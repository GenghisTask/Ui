import { Command } from 'commander';
import JobFactory from './lib/launcher/job-factory';
// Example : npm run cli -- --id 3695551434208984
const command = new Command();
command.option('-i, --id <value>', 'Job identifier');
command.action(async ()=>{
    const job = await JobFactory.load(command.opts().id);
    job.execute(process.env);
});
command.parse();
