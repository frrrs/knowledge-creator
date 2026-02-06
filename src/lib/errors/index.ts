/**
 * 统一错误处理工具
 * v0.1.3 - 新增标准化错误处理
 */

export enum ErrorCode {
  // 认证错误 1xx
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_UNAUTHORIZED = 'AUTH_003',
  
  // 验证错误 2xx
  VALIDATION_INVALID_INPUT = 'VAL_001',
  VALIDATION_MISSING_FIELD = 'VAL_002',
  
  // 业务错误 3xx
  BUSINESS_TASK_NOT_FOUND = 'BUS_001',
  BUSINESS_TASK_COMPLETED = 'BUS_002',
  
  // 系统错误 9xx
  SYSTEM_UNKNOWN = 'SYS_001',
  SYSTEM_DATABASE = 'SYS_002',
  SYSTEM_AI_SERVICE = 'SYS_003'
}

interface AppErrorOptions {
  code: ErrorCode
  message: string
  statusCode: number
  details?: Record<string, any>
}

export class AppError extends Error {
  code: ErrorCode
  statusCode: number
  details?: Record<string, any>
  timestamp: string

  constructor(options: AppErrorOptions) {
    super(options.message)
    this.code = options.code
    this.statusCode = options.statusCode
    this.details = options.details
    this.timestamp = new Date().toISOString()
    this.name = 'AppError'
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: this.timestamp
      }
    }
  }
}

// 预定义错误
export const Errors = {
  invalidCredentials: () => new AppError({
    code: ErrorCode.AUTH_INVALID_CREDENTIALS,
    message: '账号或密码错误',
    statusCode: 401
  }),
  
  unauthorized: () => new AppError({
    code: ErrorCode.AUTH_UNAUTHORIZED,
    message: '请先登录',
    statusCode: 401
  }),
  
  validationFailed: (field: string) => new AppError({
    code: ErrorCode.VALIDATION_INVALID_INPUT,
    message: `字段验证失败: ${field}`,
    statusCode: 400,
    details: { field }
  }),
  
  taskNotFound: () => new AppError({
    code: ErrorCode.BUSINESS_TASK_NOT_FOUND,
    message: '任务不存在',
    statusCode: 404
  }),
  
  aiServiceError: (details?: string) => new AppError({
    code: ErrorCode.SYSTEM_AI_SERVICE,
    message: 'AI服务暂时不可用',
    statusCode: 503,
    details: details ? { reason: details } : undefined
  })
}

// 错误处理器
export function handleError(error: unknown): { 
  message: string
  code: ErrorCode
  statusCode: number 
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: ErrorCode.SYSTEM_UNKNOWN,
      statusCode: 500
    }
  }
  
  return {
    message: '发生未知错误',
    code: ErrorCode.SYSTEM_UNKNOWN,
    statusCode: 500
  }
}
