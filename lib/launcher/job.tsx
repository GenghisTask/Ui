import temp from 'temp';
import path from 'path';
import fs from 'fs';
import UUID from 'uuid-int';
import childProcess from 'child_process';
import EventEmitter from 'events';
import JobFactory from './job-factory';
import readline from 'readline';
import Stream from 'stream';
import { exit } from 'process';

class Job extends EventEmitter {
    logFile: any;
    data: any;
    environment: any;
    secret: any;
    log(event) {
        if (!this.logFile) {
            this.logFile = fs.openSync(
                path.join('data/public/log/', this.data.id + '.log'),
                'a'
            );
        }
        event.id = this.data.id;
        event.timestamp = new Date().toISOString();
        fs.writeSync(this.logFile, JSON.stringify(event) + '\n');
    }

    execute(env) {
        if (this.data.disabled) {
            this.emit('finished', 0);
            return;
        }
        const id = UUID(0).uuid();
        const logDir = 'data/public/log/';

        Object.assign(env, this.secret);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }
        const output = fs.openSync(path.join(logDir, this.data.id + '.stdout.log'), 'w');
        const output2 = fs.openSync(path.join(logDir, this.data.id + '.stderr.log'), 'w');
        this.log({ execution_id: id, status: 'started' });
        const tempName = temp.path();
        if (!this.data.command) {
            this.log({
                execution_id: id,
                code: 0,
                status: 'Finished'
            });
            this.close(tempName, output, output2);
            this.launchTrigger(env, 0);
            this.emit('finished', 0);
            return;
        }
        if (!fs.existsSync('data/api/shell/' + this.data.command)) {
            this.log({
                execution_id: id,
                code: -1,
                status: 'Script not found :' + this.data.command
            });
            this.close(tempName, output, output2);
            return;
        }

        let stdin = null;
        const scriptContent = fs.readFileSync('data/api/shell/' + this.data.command);
        childProcess.execSync(`export -p | cut -d ' ' -f 2- > data/env`, { env: env });
        if (this.data.forward_env) {
            childProcess.execSync('export -p > ' + tempName + '.sh\n', { env: env });
            fs.appendFileSync(
                tempName + '.sh',
                scriptContent
            );
            stdin = fs.openSync(tempName + '.sh', 'r');
        } else {
            stdin = fs.openSync('data/api/shell/' + this.data.command, 'r');
        }

        this.environment.remote +=
            ((new String(scriptContent).match(/(^#!.*)/) || [])[1] || ''
        ).replace('#!', ' ');

        const execution = childProcess.spawn('sh', ['-c', this.environment.remote], {
            stdio: [stdin, output, output2],
            env: env
        });
        this.log({
            execution_id: id,
            pid: execution.pid,
            status: 'running',
            command: this.environment.remote + ' < ' + this.data.command
        });

        execution.on('close', (code, signal) => {
            if (signal) {
                code = Number(signal);
            }
            this.log({ execution_id: id, code: code, status: 'finished' });
            this.close(tempName, output, output2, stdin);
            this.emit('finished', code, output);
            this.launchTrigger(env, code);
        });
    }

    launchTrigger(env, code) {
        if ('trigger' in this.data && typeof this.data.trigger.forEach != 'undefined') {
            this.data.trigger.forEach(async function (jobId) {
                env['TRIGGER_RETURN_CODE'] = code;
                (await JobFactory.load(jobId)).execute(env);
            });
        }
    }

    static lastLine(id: String): Promise<any> {
        const fileName = path.join('data/public/log/', id + '.log');
        const minLength = 1;
        const defaultLine = JSON.stringify({ id: id, status: '' });
        return new Promise((resolve) => {
            if (!fs.existsSync(fileName)) {
                return resolve(defaultLine);
            }
            let inStream = fs.createReadStream(fileName);
            let rl = readline.createInterface(inStream);
            let lastLine = defaultLine;
            rl.on('line', function (line) {
                if (line.length >= minLength) {
                    lastLine = line;
                }
            });

            rl.on('error', function () {
                resolve(defaultLine);
            });

            rl.on('close', function () {
                resolve(lastLine);
            });
        });
    }

    close(tempName, output, output2, stdin = null): void {
        fs.unlink(tempName + '.sh', () => 0);
        fs.close(output, () => 0);
        fs.close(output2, () => 0);
        if (stdin) {
            fs.close(stdin, () => 0);
        }
        if (this.logFile) {
            fs.close(this.logFile, () => 0);
        }
    }
}

export default Job;
