import { NextRequest } from 'next/server'
import { completeTask, skipTask, rateScript } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/api'

// POST /api/tasks/[id]/complete - 完成任务
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const body = await request.json().catch(() => ({}))
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
