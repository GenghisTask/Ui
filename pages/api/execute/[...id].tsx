import { NextApiRequest, NextApiResponse } from 'next';
import JobFactory from '../../../lib/launcher/job-factory';
import util from 'util';
import serveLogFile from '../static/[...filename]';
/**
 * Serve given file (from cache dir only)
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const job = await JobFactory.load(req.query.id[0]);

    const flattenObject = (obj, prefix = '') =>
        Object.keys(obj).reduce((acc, k) => {
            const pre = prefix.length ? prefix + '_' : '';
            if (obj[k] != null) {
                if (typeof obj[k] === 'object')
                    Object.assign(acc, flattenObject(obj[k], pre + k));
                else acc[pre + k] = '' + obj[k];
            }
            return acc;
        }, {});

    const uploads = {};
    //busboy https://github.com/vercel/next.js/issues/7912

    const env = [process.env, req.query, flattenObject(req.body), uploads].reduce(
        function (env, current) {
            if (typeof current != 'undefined') Object.assign(env, current);
            return env;
        },
        {}
    );

    const code = await new Promise((resolve) => {
        job.on('finished', (code) => {
            resolve(code);
        });
        job.execute(env);
    });
    req.query.filename =
        'log/' + job.data.id + '.' + (code == 0 ? 'stdout' : 'stderr') + '.log';
    return serveLogFile(req, res);
}
