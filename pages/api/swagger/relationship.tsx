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
    console.log(req.method)
    const from = await JobFactory.load(req.query.from);
    if (!('trigger' in from.data && from.data.trigger.push)) {
        from.data.trigger = [];
    }
    console.log(req.method)
    if (req.method == 'PUT') {
        from.data.trigger.push(req.query.to);
    } else if (req.method == 'DELETE') {
        from.data.trigger.splice(from.data.trigger.indexOf(req.query.to), 1);
    }
    await JobFactory.save(from);
    return res.send('');
}
