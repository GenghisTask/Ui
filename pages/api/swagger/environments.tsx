import { NextApiRequest, NextApiResponse } from 'next';
import contentRange from '../../../lib/middleware/content-range';
import Environment from '../../../lib/launcher/environment';
/**
 * Serve given file (from cache dir only)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    contentRange(req, res, () => 0);
    const result = await Environment.getCollection();
    return res.send(result);
}
