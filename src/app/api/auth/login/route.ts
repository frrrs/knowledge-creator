import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/api'
import { verifyCode } from '@/lib/auth/verification'

// POST /api/auth/login - 手机号验证码登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code, type } = body
    
    if (!phone || !code) {
      return errorResponse('Phone and code are required', 400)
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return errorResponse('Invalid phone number', 400)
    }
    
    // 验证验证码
    const isValid = verifyCode(phone, code)
    
    // 测试环境：验证码为 000000 时直接通过
    const isDevBypass = process.env.NODE_ENV === 'development' && code === '000000'
    
    if (!isValid && !isDevBypass) {
      return errorResponse('Invalid or expired verification code', 400)
    }
    
    // 查找或创建用户
    let user = await prisma.user.findFirst({
      where: { phone }
    })
    
    const isNewUser = !user
    
    if (!user) {
      // 创建新用户
      user = await prisma.user.create({
        data: {
          phone,
          domains: [],
          settings: {
            create: {
              pushTime: '08:00',
              timezone: 'Asia/Shanghai'
            }
          }
        }
      })
    }
    
    return successResponse({
      user: {
        id: user.id,
        phone: user.phone,
        domains: user.domains
      },
      isNewUser,
      token: `token-${user.id}` // 实际应生成 JWT
    }, isNewUser ? 'Registered and logged in successfully' : 'Login successful')
    
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Failed to login', 500)
  }
}
