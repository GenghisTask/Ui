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
    async function getFiles(dir) {
        const subdirs = await readdir(dir);
        const files = await Promise.all(subdirs.filter(item => !(/(^|\/)\.[^\/\.]/g.test(item))).map(async (subdir) => {
            const res = resolve(dir, subdir);
            return (await stat(res)).isDirectory() ? getFiles(res) : {value:res.split('data/api/shell/')[1], label:basename(res)};
        }));
        return {value:dir.split('data/api/shell/')[1], label:basename(dir), children: files.reduce((a, f) => a.concat(f), [])};
    }
    return res.send(JSON.stringify((await getFiles('data/api/shell/')).children, null, 4));
}
