import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';

/**
 * Serve given file (from cache dir only)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    let filename: string | string[] = req.query.filename;
    if (Array.isArray(filename)) {
        filename = filename.join('/');
    }
    await fs
        .readFile(
            process.cwd() + '/data/api/shell/' + filename.replace(/\.\./, '')
        )
        .catch((err) => {
            res.writeHead(404);
            res.end(JSON.stringify(err));
        })
        .then((data) => {
            res.writeHead(200);
            res.end(data);
        });
}
