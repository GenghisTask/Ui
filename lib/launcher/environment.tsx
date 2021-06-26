import fs from 'fs';
import path from 'path';
import split from 'split';
import YAML from 'yaml';

class Environment {
    static async getCollection(): Promise<{ id: string }[]> {
        const result = [{id:'', name:'Local', remote:''}];
        const promises = [Promise.resolve(true)];
        if (fs.existsSync(path.join(process.cwd(), 'data/api/environment/ssh/config'))) {
            const configStream = fs
                .createReadStream(
                    path.join(process.cwd(), 'data/api/environment/ssh/config'),
                    'utf8'
                )
                .pipe(split())
                .on('data', (line) => {
                    let capturingRegex;
                    if ((capturingRegex = line.match(/Host (?<host>.*)/))) {
                        const host = capturingRegex.groups.host;
                        if (!host.includes('*') && !host.includes('?')) {
                            result.push({
                                name: host,
                                remote: 'ssh -F data/api/environment/ssh/config ' + host,
                                id: host
                            });
                        }
                    }
                });
            promises.push(
                new Promise((resolve) => configStream.on('close', () => resolve(true)))
            );
        }
        if (
            fs.existsSync(
                path.join(process.cwd(), 'data/api/environment/docker/docker-compose.yml')
            )
        ) {
            const detectDockerEnvs: Promise<boolean> = new Promise((resolve) =>
                fs.readFile(
                    path.join(
                        process.cwd(),
                        'data/api/environment/docker/docker-compose.yml'
                    ),
                    'utf8',
                    function (err, data) {
                        Object.keys(YAML.parse(data).services).forEach((service) =>
                            result.push({
                                name: service,
                                remote:
                                    'docker-compose  --env-file data/env  -f data/api/environment/docker/docker-compose.yml run --rm ' +
                                    service,
                                id: service
                            })
                        );
                        resolve(true);
                    }
                )
            );
            promises.push(detectDockerEnvs);
        }

        await Promise.all(promises);
        return result;
    }
}

export default Environment;
