import { NextApiRequest, NextApiResponse } from 'next';
import { promisify } from 'util';
import { resolve, basename } from 'path';
import fs from 'fs';
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
/**
 * handle api for log
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const repository = 'https://' + process.env.GIT_REPO.replace('.git', '').replace(/^.*@/,'').replace(/^.*\/\//,'');
    let append = '';
    if (req.query.file) {
        append = `/edit/${process.env.GIT_BRANCH}/shell/${req.query.file}`;
    } else if (req.query.file === '') {
        append = `/new/${process.env.GIT_BRANCH}/shell`;
    }
    res.redirect(repository + append);
    return;
}
