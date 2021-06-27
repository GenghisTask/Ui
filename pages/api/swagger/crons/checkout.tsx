import { NextApiRequest, NextApiResponse } from 'next';
import simpleGit, { SimpleGit } from 'simple-git';
/**
 * Serve given file (from cache dir only)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const git: SimpleGit = simpleGit({ baseDir: 'data/api/' });
    try {
        await git.init();
    } catch (e) {
        console.log(e);
    }
    try {
        await git.checkout('.');
    } catch (e) {
        res.status(500);
        return res.send(e.message);
    }
    return res.send('');
}
