import { Request, Response, NextFunction } from 'express';
import { ErrorCode, errorResponse } from '../types/response';
import { verifyToken, JwtPayload } from '../utils/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Try to get token from cookie first, then from authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json(errorResponse(ErrorCode.AUTHENTICATION_FAILED, '未提供认证令牌'));
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json(errorResponse(ErrorCode.AUTHENTICATION_FAILED, '无效或已过期的认证令牌'));
  }

  req.user = payload;
  next();
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(errorResponse(ErrorCode.AUTHENTICATION_FAILED, '需要认证'));
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json(errorResponse(ErrorCode.PERMISSION_DENIED, '需要相应权限才能访问'));
    }

    next();
  };
}
