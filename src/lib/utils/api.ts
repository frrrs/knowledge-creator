import { NextResponse } from 'next/server'

export function successResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function errorResponse(message: string, status: number = 500, code?: string) {
  return NextResponse.json({
    success: false,
    error: message,
    code
  }, { status })
}

export function validateRequired(body: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
      return `Missing required field: ${field}`
    }
  }
  return null
}
