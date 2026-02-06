import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api'
import { storeCode, generateCode } from '@/lib/auth/verification'

// POST /api/auth/send-code - 发送验证码
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return errorResponse('Invalid phone number', 400)
    }
    
    // 生成6位验证码
    const code = generateCode()
    
    // 存储验证码（5分钟有效）
    storeCode(phone, code)
    
    // TODO: 实际应调用短信服务商发送
    // 目前仅输出到控制台用于测试
    console.log(`[SMS] Phone: ${phone}, Code: ${code}`)
    
    return successResponse({ 
      sent: true,
      // 测试环境返回验证码，生产环境删除
      debugCode: process.env.NODE_ENV === 'development' ? code : undefined
    }, 'Verification code sent')
    
  } catch (error) {
    console.error('Send code error:', error)
    return errorResponse('Failed to send code', 500)
  }
}

// 验证验证码（供登录接口使用）
export function verifyCode(phone: string, code: string): boolean {
  const record = verificationCodes.get(phone)
  
  if (!record) return false
  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(phone)
    return false
  }
  if (record.code !== code) return false
  
  // 验证成功后删除
  verificationCodes.delete(phone)
  return true
}
