import { NextApiRequest, NextApiResponse } from 'next';
import { NextFunctionReturn, NextFunction } from '../middleware';

/* Adapter for ReactAdmin filter into APIDevTools/swagger-express-middleware filter  */
export default (
    req: NextApiRequest,
    res: NextApiResponse,
    next: NextFunction
): NextFunctionReturn => {
    try {
        const filter = JSON.parse('' + req.query.filter);
        for (const [key, value] of Object.entries<string>(filter)) {
            req.query[key] = value;
        }
    } catch (e) {
        // no valid filter required do nothing
    }
    return next(req, res);
};
