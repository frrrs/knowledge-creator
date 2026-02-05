import { NextRequest, NextResponse } from 'next/server'
import { generateTopic, generateScript } from '@/lib/ai/deepseek'
import { 
  createTask, 
  getTodayTask, 
  createScript,
  completeTask,
  skipTask,
  rateScript
} from '@/lib/db'
import { successResponse, errorResponse, validateRequired } from '@/lib/utils/api'

// POST /api/tasks/generate - 生成今日任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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
    
    // AI生成选题
    const topicData = await generateTopic({ domains })
    
    // 创建任务
    const task = await createTask({
      userId,
      title: topicData.title,
      domain: topicData.domain,
      duration: topicData.duration || 5,
      difficulty: topicData.difficulty || 'MEDIUM'
    })
    
    // AI生成脚本
    const scriptData = await generateScript({
      topic: topicData.title,
      domain: topicData.domain,
      duration: topicData.duration || 5
    })
    
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
    console.error('Generate task error:', error)
    return errorResponse('Failed to generate task', 500)
  }
}

// GET /api/tasks/today?userId=xxx - 获取今日任务
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
