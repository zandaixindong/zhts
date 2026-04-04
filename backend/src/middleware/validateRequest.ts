import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ErrorCode, errorResponse } from '../types/response';

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      const message = `Validation error: ${errors[0].message}`;
      res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, message));
      return;
    }
    // 替换为解析后的值以保证类型正确
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      const message = `Validation error: ${errors[0].message}`;
      res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, message));
      return;
    }
    req.query = result.data;
    next();
  };
}

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      const message = `Validation error: ${errors[0].message}`;
      res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, message));
      return;
    }
    req.params = result.data;
    next();
  };
}
