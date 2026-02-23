/**
 * API 工具模块
 * 提供统一的 API 响应格式和请求验证工具
 */

import { NextResponse } from 'next/server'

/** API 成功响应结构 */
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

/** API 错误响应结构 */
interface ErrorResponse {
  success: false
  error: string
  code?: string
}

/**
 * 创建成功响应
 * @param data - 响应数据
 * @param message - 可选的提示消息
 */
export function successResponse<T>(data: T, message?: string): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

/**
 * 创建错误响应
 * @param message - 错误信息
 * @param status - HTTP 状态码，默认 500
 * @param code - 可选的业务错误码
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json({
    success: false,
    error: message,
    code
  }, { status })
}

/** 可验证的请求体类型 */
type RequestBody = Record<string, unknown>

/**
 * 验证请求体中是否包含必需的字段
 * @param body - 请求体对象
 * @param fields - 必需字段列表
 * @returns 错误信息或 null（验证通过）
 */
/**
 * 验证请求体中是否包含必需的字段
 * @param body - 请求体对象
 * @param fields - 必需字段列表
 * @returns 错误信息或 null（验证通过）
 */
export function validateRequired(body: RequestBody, fields: string[]): string | null {
  for (const field of fields) {
    const value = body[field]
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return `缺少必需参数: ${field}`
    }
  }
  return null
}
