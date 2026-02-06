import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/api'

// GET /api/user/settings?userId=xxx - 获取用户设置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return errorResponse('userId is required', 400)
    }
    
    let settings = await prisma.userSettings.findUnique({
      where: { userId }
    })
    
    // 如果没有设置，创建默认设置
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          pushTime: '08:00',
          timezone: 'Asia/Shanghai'
        }
      })
    }
    
    return successResponse(settings)
    
  } catch (error) {
    console.error('Get user settings error:', error)
    return errorResponse('Failed to get settings', 500)
  }
}

// PUT /api/user/settings - 更新用户设置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, pushTime, timezone } = body
    
    if (!userId) {
      return errorResponse('userId is required', 400)
    }
    
    // 验证推送时间格式
    if (pushTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(pushTime)) {
        return errorResponse('Invalid pushTime format. Use HH:mm', 400)
      }
    }
    
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...(pushTime && { pushTime }),
        ...(timezone && { timezone })
      },
      create: {
        userId,
        pushTime: pushTime || '08:00',
        timezone: timezone || 'Asia/Shanghai'
      }
    })
    
    return successResponse(settings, 'Settings updated successfully')
    
  } catch (error) {
    console.error('Update user settings error:', error)
    return errorResponse('Failed to update settings', 500)
  }
}
