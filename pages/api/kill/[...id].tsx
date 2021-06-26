import { NextApiRequest, NextApiResponse } from 'next';
import Job from '../../../lib/launcher/job';
import childProcess from 'child_process';
/**
 * Serve given file (from cache dir only)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const log = await Job.lastLine(req.query.id[0]);
    if (log.status == 'running') {
        process.kill(log.pid);
    }
    return res.send('');
}
