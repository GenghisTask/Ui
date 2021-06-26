import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunctionReturn, NextFunction } from '../middleware';
import mkdirp from 'mkdirp';
import fs from 'fs';

const downloadFile = (file): string => {
    if (!file.base64) {
        return '';
    }
    const cacheDir = '/data/cache/';
    const filename = process.cwd() + cacheDir + file.title;
    mkdirp.sync(process.cwd() + cacheDir);
    fs.writeFileSync(filename, file.base64.split('base64,')[1], 'base64');
    return file.title;
};

/**
 * Middleware to download any POSTed File
 *
 * Side effect on request data :
 * - File is transformed into corresponding filename string
 */
export default (
    req: NextApiRequest,
    res: NextApiResponse,
    next: NextFunction
): NextFunctionReturn => {
    Object.keys(req.body).forEach((key) => {
        if (req.body[key].base64) {
            // input key is supposed to be myname_upload
            // and an other input text must exists with name myname
            req.body[key.split('_')[0]] = downloadFile(req.body[key]);
            delete req.body[key];
        }
    });
    return next(req, res);
};
