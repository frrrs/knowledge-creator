import { NextRequest } from 'next/server'
import { completeTask, skipTask, rateScript } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/api'

/** 路由参数 */
interface RouteParams {
  params: {
    id: string
  }
}

/** 任务操作请求体 */
interface TaskActionRequest {
  action: 'complete' | 'skip' | 'rate'
  reason?: string
  rating?: number
  comment?: string
}

/**
 * POST /api/tasks/[id] - 执行任务操作
 * 支持完成、跳过、评分三种操作
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const taskId = params.id
    const body: TaskActionRequest = await request.json().catch(() => ({} as TaskActionRequest))
    const { action, reason, rating, comment } = body
    
    switch (action) {
      case 'complete':
        await completeTask(taskId)
        return successResponse({ completed: true })
        
      case 'skip':
        await skipTask(taskId, reason)
        return successResponse({ skipped: true })
        
      case 'rate':
        if (rating === undefined || rating < 1 || rating > 5) {
          return errorResponse('Rating must be 1-5', 400)
        }
        await rateScript(taskId, rating, comment)
        return successResponse({ rated: true })
        
      default:
        return errorResponse('Invalid action', 400)
    }
    
  } catch (error) {
    console.error('Task action error:', error)
    return errorResponse('Failed to process action', 500)
  }
}
