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
        if (process.env.GIT_REPO) {
            await git.pull(process.env.GIT_REPO, process.env.GIT_BRANCH);
        }
    } catch (e) {
        res.status(500);
        return res.send(e.message);
    }
    return res.send('');
}
