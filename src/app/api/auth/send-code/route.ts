import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api'
import { storeCode, generateCode } from '@/lib/auth/verification'

/** 发送验证码请求体 */
interface SendCodeRequest {
  phone: string
}

/**
 * POST /api/auth/send-code - 发送验证码
 * 生成6位数字验证码并存储（5分钟有效）
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendCodeRequest = await request.json()
    const { phone } = body

    // 验证手机号格式（中国大陆）
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
