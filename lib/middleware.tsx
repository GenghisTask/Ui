import { NextApiRequest, NextApiResponse } from 'next';
/**
 * Typedef
 */
export type NextFunctionReturn = any;
export type NextFunction = (
    req: NextApiRequest,
    res: NextApiResponse,
    next?: NextFunction
) => NextFunctionReturn;
