// 验证码存储（生产环境应使用 Redis）

/** 验证码记录结构 */
interface VerificationRecord {
  code: string
  expiresAt: number
}

/** 内存中的验证码存储（生产环境应使用 Redis） */
const verificationCodes = new Map<string, VerificationRecord>()

/** 验证码有效期（毫秒） */
const CODE_EXPIRY_MS = 5 * 60 * 1000 // 5分钟

/**
 * 存储验证码
 * @param phone - 手机号
 * @param code - 6位验证码
 */
export function storeCode(phone: string, code: string): void {
  verificationCodes.set(phone, {
    code,
    expiresAt: Date.now() + CODE_EXPIRY_MS
  })
}

/**
 * 验证验证码
 * @param phone - 手机号
 * @param code - 用户输入的验证码
 * @returns 验证是否成功（验证成功后自动删除记录）
 */
export function verifyCode(phone: string, code: string): boolean {
  const record = verificationCodes.get(phone)
  
  if (!record) return false
  
  // 检查是否过期
  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(phone)
    return false
  }
  
  // 检查验证码是否匹配
  if (record.code !== code) return false
  
  // 验证成功后删除（一次性使用）
  verificationCodes.delete(phone)
  return true
}

/**
 * 生成6位数字验证码
 * @returns 6位数字字符串
 */
export function generateCode(): string {
  return Math.random().toString().slice(2, 8)
}
