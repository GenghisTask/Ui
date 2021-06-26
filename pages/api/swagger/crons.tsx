import { NextApiRequest, NextApiResponse } from 'next';
import JobFactory from '../../../lib/launcher/job-factory';
import util from 'util';
import contentRange from '../../../lib/middleware/content-range';
import childProcess from 'child_process';
/**
 * Serve given file (from cache dir only)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    contentRange(req, res, () => 0);
    let filter: string | string[] = req.query.filter;
    if (Array.isArray(filter)) {
        filter = filter.pop();
    }
    const jobIds = JSON.parse(filter).id;
    try {
        const text = await util.promisify(childProcess.exec)('crontab -l');
        const lines = text.stdout.split('\n');
        const regex = /^(#?(\@[a-zA-Z]+\s+)|(([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+))/;
        const crontab = lines
            .filter((line) => line.match(/npm run cli -- --id/))
            .reduce((result, line) => {
                const command = line.replace(regex, '').trim();
                const schedule = line.replace(command, '').trim();
                const jobId = command.trim().match(/\d+$/)[0];
                result[jobId] = schedule;
                return result;
            }, {});
        res.send(
            jobIds.map((id) => {
                if (id in crontab) {
                    return {
                        id: Number(id),
                        in_crontab: crontab[id]
                    };
                }
                return {
                    id: Number(id),
                    in_crontab: 'Not In Crontab'
                };
            })
        );
    } catch (e) {
        console.log(e);
        return res.send([]);
    }
}
