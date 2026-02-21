// 全局错误处理工具

/** 应用错误类 - 带错误码和HTTP状态码 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
    
    // 修复原型链（TypeScript 继承 Error 的需要）
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/** 错误码类型 - 所有预定义错误码的联合类型 */
export type ErrorCode = 
  // 认证错误
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_UNAUTHORIZED'
  // 验证错误
  | 'VALIDATION_INVALID_PHONE'
  | 'VALIDATION_INVALID_CODE'
  | 'VALIDATION_EXPIRED_CODE'
  // 业务错误
  | 'TASK_NOT_FOUND'
  | 'TASK_ALREADY_COMPLETED'
  | 'TASK_GENERATION_FAILED'
  // 系统错误
  | 'SYSTEM_DATABASE_ERROR'
  | 'SYSTEM_AI_ERROR'
  | 'SYSTEM_UNKNOWN_ERROR'

/** 错误码常量对象 */
export const ErrorCodes: Record<string, ErrorCode> = {
  // 认证错误
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  // 验证错误
  VALIDATION_INVALID_PHONE: 'VALIDATION_INVALID_PHONE',
  VALIDATION_INVALID_CODE: 'VALIDATION_INVALID_CODE',
  VALIDATION_EXPIRED_CODE: 'VALIDATION_EXPIRED_CODE',
  
  // 业务错误
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  TASK_ALREADY_COMPLETED: 'TASK_ALREADY_COMPLETED',
  TASK_GENERATION_FAILED: 'TASK_GENERATION_FAILED',
  
  // 系统错误
  SYSTEM_DATABASE_ERROR: 'SYSTEM_DATABASE_ERROR',
  SYSTEM_AI_ERROR: 'SYSTEM_AI_ERROR',
  SYSTEM_UNKNOWN_ERROR: 'SYSTEM_UNKNOWN_ERROR'
} as const

/** 错误处理结果 */
interface ErrorResult {
  message: string
  code: ErrorCode
}

/**
 * 统一处理错误
 * @param error - 未知类型的错误对象
 * @returns 标准化的错误结果
 */
export function handleError(error: unknown): ErrorResult {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code
    }
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: ErrorCodes.SYSTEM_UNKNOWN_ERROR
    }
  }
  
  return {
    message: '发生未知错误',
    code: ErrorCodes.SYSTEM_UNKNOWN_ERROR
  }
}

/**
 * 获取用户友好的错误消息
 * @param code - 错误码
 * @returns 本地化错误提示
 */
export function getUserErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCodes.AUTH_INVALID_CREDENTIALS]: '账号或密码错误',
    [ErrorCodes.AUTH_TOKEN_EXPIRED]: '登录已过期，请重新登录',
    [ErrorCodes.AUTH_UNAUTHORIZED]: '请先登录',
    [ErrorCodes.VALIDATION_INVALID_PHONE]: '请输入正确的手机号',
    [ErrorCodes.VALIDATION_INVALID_CODE]: '验证码错误',
    [ErrorCodes.VALIDATION_EXPIRED_CODE]: '验证码已过期，请重新获取',
    [ErrorCodes.TASK_NOT_FOUND]: '任务不存在',
    [ErrorCodes.TASK_ALREADY_COMPLETED]: '任务已完成',
    [ErrorCodes.TASK_GENERATION_FAILED]: '任务生成失败，请重试',
    [ErrorCodes.SYSTEM_DATABASE_ERROR]: '数据库错误，请稍后重试',
    [ErrorCodes.SYSTEM_AI_ERROR]: 'AI服务暂时不可用',
    [ErrorCodes.SYSTEM_UNKNOWN_ERROR]: '发生错误，请稍后重试'
  }
  
  return messages[code] || '发生错误，请稍后重试'
}
