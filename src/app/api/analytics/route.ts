/**
 * 数据分析 API 路由
 * 提供用户任务统计、完成率、连续打卡天数等数据分析
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/api'

/** 每日统计数据 */
interface DailyStat {
  completed: number
  total: number
  dayName: string
}

/**
 * GET /api/analytics?userId=xxx - 获取用户数据分析
 * 返回用户的任务统计、完成率、连续打卡天数等
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return errorResponse('userId is required', 400)
    }
    
    console.log('[API] Fetching analytics for user:', userId)
    
    // 获取总任务数
    const totalTasks = await prisma.task.count({
      where: { userId }
    })
    
    // 获取已完成任务数
    const completedTasks = await prisma.task.count({
      where: { 
        userId,
        status: 'COMPLETED'
      }
    })
    
    // 获取已跳过任务数
    const skippedTasks = await prisma.task.count({
      where: { 
        userId,
        status: 'SKIPPED'
      }
    })
    
    // 获取总创作时长（分钟）
    const tasksWithDuration = await prisma.task.findMany({
      where: { 
        userId,
        status: 'COMPLETED'
      },
      select: {
        duration: true
      }
    })
    const totalTime = tasksWithDuration.reduce((sum, task) => sum + (task.duration || 0), 0)
    
    // 获取最近7天的任务完成情况
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const weeklyTasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    // 按日期分组统计
    const dailyStats: Record<string, DailyStat> = {}
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    
    // 初始化最近7天
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const dayName = weekDays[date.getDay()]
      dailyStats[dateKey] = { completed: 0, total: 0, dayName }
    }
    
    // 填充实际数据
    weeklyTasks.forEach(task => {
      const dateKey = task.createdAt.toISOString().split('T')[0]
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].total++
        if (task.status === 'COMPLETED') {
          dailyStats[dateKey].completed++
        }
      }
    })
    
    // 计算连续打卡天数
    let streakDays = 0
    const today = new Date().toISOString().split('T')[0]
    const dates = Object.keys(dailyStats).sort().reverse()
    
    for (const date of dates) {
      if (dailyStats[date].completed > 0 || date === today) {
        if (dailyStats[date].completed > 0) {
          streakDays++
        }
      } else {
        break
      }
    }
    
    // 获取评分统计（从 TaskFeedback 中统计）
    const ratings = await prisma.taskFeedback.findMany({
      where: {
        task: {
          userId
        },
        rating: {
          not: null
        }
      },
      select: {
        rating: true
      }
    })
    
    const averageRating = ratings.length > 0 
      ? (ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length).toFixed(1)
      : '0.0'
    
    return successResponse({
      totalTasks,
      completedTasks,
      skippedTasks,
      pendingTasks: totalTasks - completedTasks - skippedTasks,
      totalTime,
      streakDays,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        dayName: stats.dayName,
        completed: stats.completed,
        total: stats.total
      })),
      ratings: {
        count: ratings.length,
        average: parseFloat(averageRating)
      }
    })
    
  } catch (error) {
    console.error('[API] Analytics error:', error)
    return errorResponse('Failed to fetch analytics', 500)
  }
}
