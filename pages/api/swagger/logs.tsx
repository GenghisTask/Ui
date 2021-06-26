import { NextApiRequest, NextApiResponse } from 'next';
import JobFactory from '../../../lib/launcher/job-factory';
import contentRange from '../../../lib/middleware/content-range';
import Job from '../../../lib/launcher/job';

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
        res.send('[' + (await Promise.all(jobIds.map(Job.lastLine))).join(',') + ']');
    } catch (e) {
        console.log(e);
        return res.send([]);
    }
}
