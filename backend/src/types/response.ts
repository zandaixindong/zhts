export enum ErrorCode {
  SUCCESS = 'SUCCESS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: ErrorCode;
  message?: string;
  data?: T;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    code: ErrorCode.SUCCESS,
    message,
    data,
  };
}

export function errorResponse(code: ErrorCode, message: string): ApiResponse {
  return {
    success: false,
    code,
    message,
  };
}
