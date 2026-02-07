import { describe, it, expect } from '@jest/globals'
import { generateCode, verifyCode } from './verification'

describe('Verification', () => {
  describe('generateCode', () => {
    it('should generate 6-digit code', () => {
      const code = generateCode()
      expect(code).toHaveLength(6)
      expect(/^\d{6}$/.test(code)).toBe(true)
    })
  })

  describe('verifyCode', () => {
    it('should verify correct code', () => {
      const phone = '13800138000'
      const code = '123456'
      // Store code first
      const { storeCode } = require('./verification')
      storeCode(phone, code)
      
      expect(verifyCode(phone, code)).toBe(true)
    })

    it('should reject wrong code', () => {
      expect(verifyCode('13800138000', '000000')).toBe(false)
    })
  })
})
