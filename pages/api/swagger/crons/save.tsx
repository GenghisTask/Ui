import { NextApiRequest, NextApiResponse } from 'next';
import JobFactory from '../../../../lib/launcher/job-factory';
import util from 'util';
import contentRange from '../../../../lib/middleware/content-range';
import childProcess from 'child_process';
import myDB from '../../../../lib/database';
/**
 * Serve given file (from cache dir only)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const getCollection = util.promisify(myDB.getCollection.bind(myDB));
    const jobs: {
        data: { schedule: string; id: Number; disabled: Boolean };
    }[] = await getCollection('/api/swagger/jobs');
    const text = jobs
        .filter((job) => job.data.schedule)
        .map(
            (job) =>
                `${job.data.disabled ? '#' : ''}${
                    job.data.schedule
                } \t cd ${process.cwd()} && npm run cli -- --id ${job.data.id}`
        )
        .join('\n');

    try {
        childProcess.execSync('crontab -', { input: text + '\n' });
    } catch (e) {
        res.status(500);
        res.send(e.message);
        return;
    }
    res.status(200);
    res.send(null);
    return;
}
