import { NextRequest } from 'next/server'
import { generateTopic, generateScript } from '@/lib/ai/kimi-code'
import { prisma } from '@/lib/db'
import {
  createTask,
  getTodayTask,
  createScript
} from '@/lib/db'
import { successResponse, errorResponse, validateRequired } from '@/lib/utils/api'

/** 生成任务请求体 */
interface GenerateTaskRequest {
  userId: string
  domains: string[]
}

/**
 * POST /api/tasks - 生成今日任务
 * 使用 AI 生成选题和脚本
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateTaskRequest = await request.json()

    // 验证必要参数
    const validationError = validateRequired(body, ['userId', 'domains'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    const { userId, domains } = body
    
    // 检查今天是否已有任务
    const existingTask = await getTodayTask(userId)
    if (existingTask) {
      return successResponse(existingTask, '今日任务已生成')
    }
    
    console.log('[API] Generating task for domains:', domains)
    
    // AI生成选题
    let topicData
    try {
      topicData = await generateTopic({ domains })
      console.log('[API] Generated topic:', topicData.title)
    } catch (aiError) {
      console.error('[API] AI topic generation failed:', aiError)
      return errorResponse('AI选题生成失败：' + (aiError instanceof Error ? aiError.message : '未知错误'), 500)
    }
    
    // 创建任务
    const task = await createTask({
      userId,
      title: topicData.title,
      domain: topicData.domain,
      duration: topicData.duration || 5,
      difficulty: topicData.difficulty || 'MEDIUM'
    })
    
    console.log('[API] Created task:', task.id)
    
    // AI生成脚本
    let scriptData
    try {
      scriptData = await generateScript({
        topic: topicData.title,
        domain: topicData.domain,
        duration: topicData.duration || 5
      })
      console.log('[API] Generated script, length:', scriptData.content.length)
    } catch (aiError) {
      console.error('[API] AI script generation failed:', aiError)
      // 脚本生成失败但任务已创建，删除任务
      await prisma.task.delete({ where: { id: task.id } })
      return errorResponse('AI脚本生成失败：' + (aiError instanceof Error ? aiError.message : '未知错误'), 500)
    }
    
    // 保存脚本
    await createScript(
      task.id,
      scriptData.content,
      scriptData.hooks,
      scriptData.keywords
    )
    
    // 返回完整任务
    const fullTask = await getTodayTask(userId)
    return successResponse(fullTask)
    
  } catch (error) {
    console.error('[API] Generate task error:', error)
    return errorResponse('生成任务失败：' + (error instanceof Error ? error.message : '未知错误'), 500)
  }
}

/**
 * GET /api/tasks?userId=xxx - 获取今日任务
 * 返回用户今天的创作任务
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return errorResponse('userId is required', 400)
    }
    
    const task = await getTodayTask(userId)
    
    if (!task) {
      return errorResponse('No task for today', 404)
    }
    
    return successResponse(task)
    
  } catch (error) {
    console.error('Get today task error:', error)
    return errorResponse('Failed to get task', 500)
  }
}
