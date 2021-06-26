import createMiddleware from '@apidevtools/swagger-express-middleware';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { FileDataStore } from '@apidevtools/swagger-express-middleware';
import contentRange from '../../../lib/middleware/content-range';
import expressMock, { useMiddleware } from '../../../lib/middleware/express-mock';
import filterMock from '../../../lib/middleware/filter-mock';
import upload from '../../../lib/middleware/upload';
const myDB = new FileDataStore(process.cwd() + '/data');

/**
 * Swagger 2.0 generic middlware for NextJs
 * Inspired from @apidevtools/swagger-express-middleware
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<boolean> {
    return await new Promise(function (resolve, reject) {
        const swaggerFile = path.join(process.cwd(), '/data/public/swagger.yaml');
        createMiddleware(swaggerFile, async function (err, swaggerMiddleware) {
            try {
                await useMiddleware(
                    [].concat(
                        [expressMock, contentRange, filterMock, upload],
                        swaggerMiddleware.metadata(),
                        swaggerMiddleware.parseRequest(),
                        swaggerMiddleware.validateRequest(),
                        swaggerMiddleware.mock(myDB),
                    ),
                    req,
                    res
                );
                resolve(true);
            } catch (e) {
                reject(e);
            }
        });
    });
}
