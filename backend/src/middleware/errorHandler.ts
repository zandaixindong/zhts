import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ErrorCode, errorResponse } from '../types/response';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error', { error: err, path: req.path, method: req.method });

  const response = errorResponse(
    ErrorCode.INTERNAL_ERROR,
    'Internal server error'
  );

  res.status(500).json(response);
};

export function notFoundHandler(req: Request, res: Response) {
  const response = errorResponse(
    ErrorCode.RESOURCE_NOT_FOUND,
    `Route ${req.method} ${req.path} not found`
  );
  res.status(404).json(response);
}
