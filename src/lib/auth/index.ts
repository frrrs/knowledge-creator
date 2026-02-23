/**
 * JWT 认证模块
 * 提供 Token 生成、验证和认证中间件功能
 * @remarks 当前使用简易 Base64 实现，生产环境应使用 jsonwebtoken 库
 */

import { NextRequest, NextResponse } from 'next/server'

// 简单的JWT实现（实际应使用jsonwebtoken库）
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

/** JWT Token 载荷结构 */
interface TokenPayload {
  userId: string
  phone?: string
  iat?: number
  exp?: number
}

/** 认证用户信息 */
interface AuthUser {
  userId: string
  phone?: string
}

/** 认证处理器函数类型 */
type AuthHandler = (req: NextRequest, user: AuthUser) => Promise<NextResponse>

/**
 * 生成 JWT Token
 * @param payload - Token 载荷数据
 * @returns Base64 编码的 token（实际应使用 jsonwebtoken）
 */
export function generateToken(payload: TokenPayload): string {
  // 实际应使用 jwt.sign
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * 验证并解析 JWT Token
 * @param token - 要验证的 token
 * @returns 解析后的载荷，无效时返回 null
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    // 实际应使用 jwt.verify
    return JSON.parse(Buffer.from(token, 'base64').toString()) as TokenPayload
  } catch {
    return null
  }
}

/**
 * 创建需要认证的 API 路由处理器
 * @param handler - 业务逻辑处理器
 * @returns 包装后的处理器（自动验证认证信息）
 */
export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const user: AuthUser = {
      userId: payload.userId,
      phone: payload.phone
    }
    
    return handler(req, user)
  }
}
