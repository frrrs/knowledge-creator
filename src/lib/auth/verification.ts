// 验证码存储（生产环境应使用 Redis）
const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

export function storeCode(phone: string, code: string) {
  verificationCodes.set(phone, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5分钟
  })
}

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

export function generateCode(): string {
  return Math.random().toString().slice(2, 8)
}
