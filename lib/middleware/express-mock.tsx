import vary from 'vary';
import accepts from 'accepts';
import async from 'async';
import typeis from 'type-is';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunctionReturn, NextFunction } from '../middleware';
interface ExpressRequest {
    path: string;
    baseUrl: string;
    is: (consume: string) => boolean;
    get: (key: string) => string | string[];
    set: (key: string, value: string) => void;
    accepts: (url: string) => void;
}
interface ExpressResponse {
    body: boolean;
    headers: NodeJS.Dict<string | string[]>;
    location: (url: string) => void;
    type: (url: string) => void;
    vary: (url: string) => void;
    set: (key: string, value: string) => void;
    get: (key: string) => string | string[];
    swagger : {lastModified: Date};
}

/* Adapter for NextApiRequest and NextApiResponse to work like Express */
export default (
    req: NextApiRequest & ExpressRequest,
    res: NextApiResponse & ExpressResponse,
    next: NextFunction
): NextFunctionReturn => {
    req.path = req.url.split('?')[0];
    req.baseUrl = '';
    res.body = false;
    res.location = (url) => {
        res.set('Location', url);
        res.status(302);
    };
    req.is = (consumes) => typeis(req, consumes);
    req.get = (name) => req.headers?.[name];
    req.set = (name, value) => (req.headers[name] = value);
    res.set = (name, value) => {
        res.setHeader(name, value);
    };
    res.get = (name) => {
        return res.headers?.[name];
    };
    res.type = (ct) => {
        res.set('Content-Type', ct);
    };
    res.vary = (value) => vary(res, value);
    req.accepts = accepts.bind(res);
    return next(req, res);
};

export const useMiddleware = (
    swaggerMiddlewares: NextFunctionReturn[],
    req: NextApiRequest,
    res: NextApiResponse,
): Promise<void> => {
    return async.series(
        swaggerMiddlewares.map((middleware) => (resolve: () => void) => {
            console.log(middleware.name)
            if (['jsonParser', 'mockResponseBody'].indexOf(middleware.name) != -1) {
                const oldmiddleware = middleware;
                middleware = function (req, res, next) {
                    oldmiddleware(req, res, () => 0);
                    next();
                };
            }
            middleware(req, res, function next() {
                try {
                    resolve();
                } catch (e) {
                    console.log(e);
                }
            });
        })
    );
};
