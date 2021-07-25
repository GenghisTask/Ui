import { NextApiRequest, NextApiResponse } from 'next';
import JobFactory from '../../../lib/launcher/job-factory';
import util from 'util';
import executeTask from '../execute/[...id]';
/**
 * Execute if allowed
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    try {
        await JobFactory.checkAcl(req);
    } catch (e) {
        res.statusCode = 403;
        return res.send(e);
    }
    return executeTask(req, res);
}
