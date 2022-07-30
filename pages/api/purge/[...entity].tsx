import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import childProcess from 'child_process';
import path from 'path';

/**
 * Swagger 2.0 generic middlware for NextJs
 * Inspired from @apidevtools/swagger-express-middleware
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<boolean> {
    const dir = 'data/public/log/';
    let filesInDirectory = fs.readdirSync(dir);
    if (typeof(req.query.entity) != "undefined" && typeof(req.query.entity[1]) != "undefined") {
        let id = req.query.entity[1];
        filesInDirectory = filesInDirectory.filter(f => f.includes(id)) 
    }
    filesInDirectory.map(f => {
        const ed = childProcess.exec(`sed -ne':a;$p;N;11,$D;ba' -i ${path.join(process.cwd(), dir , f)}`);
    });
    res.send("");
    return Promise.resolve(true);
}
