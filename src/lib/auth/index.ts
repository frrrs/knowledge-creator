import { NextRequest, NextResponse } from 'next/server'

// 简单的JWT实现（实际应使用jsonwebtoken库）
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export function generateToken(payload: object): string {
  // 实际应使用 jwt.sign
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export function verifyToken(token: string): any {
  try {
    // 实际应使用 jwt.verify
    return JSON.parse(Buffer.from(token, 'base64').toString())
  } catch {
    return null
  }
}

export function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    return handler(req, user)
  }
}
