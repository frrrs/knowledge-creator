/**
 * 数据库操作模块
 * 封装 Prisma Client 的数据库操作，提供类型安全的数据访问层
 */

import { PrismaClient } from '@prisma/client'

/** Prisma 客户端单例（开发环境使用全局变量防止热重载时重复实例化） */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/** 导出的 Prisma 客户端实例 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// 开发环境：将实例保存到全局变量，避免热重载时重复创建
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ============================================
// 用户相关操作
// ============================================
export async function createUser(data: {
  phone?: string
  wechatId?: string
  domains: string[]
}) {
  return prisma.user.create({
    data: {
      ...data,
      settings: {
        create: {
          pushTime: '08:00',
          timezone: 'Asia/Shanghai'
        }
      }
    },
    include: {
      settings: true
    }
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      settings: true
    }
  })
}

export async function updateUserDomains(userId: string, domains: string[]) {
  return prisma.user.update({
    where: { id: userId },
    data: { domains }
  })
}

// ============================================
// 任务相关操作
// ============================================

/** 创建任务参数 */
interface CreateTaskParams {
  userId: string
  title: string
  domain: string
  duration: number
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
}

/**
 * 创建新任务
 * @param data - 任务数据
 * @returns 创建的任务记录
 */
export async function createTask(data: CreateTaskParams) {
  return prisma.task.create({
    data: {
      ...data,
      difficulty: data.difficulty || 'MEDIUM'
    }
  })
}

/**
 * 获取用户今天的任务
 * @param userId - 用户ID
 * @returns 今天创建的最新任务（包含脚本和反馈信息），如果没有则返回 null
 * @remarks 查询范围从今天 00:00:00 开始，按创建时间倒序排列取第一条
 */
export async function getTodayTask(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return prisma.task.findFirst({
    where: {
      userId,
      createdAt: {
        gte: today
      }
    },
    include: {
      script: true,
      feedback: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getTaskHistory(userId: string, limit: number = 30) {
  return prisma.task.findMany({
    where: { userId },
    include: {
      script: true,
      feedback: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}

export async function completeTask(taskId: string) {
  return prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    }
  })
}

export async function skipTask(taskId: string, reason?: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { status: 'SKIPPED' }
  })
  
  if (reason) {
    await prisma.taskFeedback.create({
      data: {
        taskId,
        skipped: true,
        reason
      }
    })
  }
}

// ============================================
// 脚本相关操作
// ============================================

/** 脚本钩子结构 - 用于吸引观众的开场 */
interface ScriptHook {
  text: string
  type: 'question' | 'fact' | 'story' | 'challenge'
}

/** 关键词结构 - 用于SEO和标签 */
interface ScriptKeyword {
  word: string
  relevance: number // 0-1
}

/**
 * 创建脚本记录
 * @param taskId - 关联的任务ID
 * @param content - 脚本内容
 * @param hooks - 可选的钩子数组，用于吸引观众
 * @param keywords - 可选的关键词数组，用于SEO
 */
export async function createScript(
  taskId: string,
  content: string,
  hooks?: ScriptHook[],
  keywords?: ScriptKeyword[]
) {
  return prisma.script.create({
    data: {
      taskId,
      content,
      hooks: hooks || [],
      keywords: keywords || []
    }
  })
}

// ============================================
// 反馈相关操作
// ============================================
export async function rateScript(taskId: string, rating: number, comment?: string) {
  return prisma.taskFeedback.upsert({
    where: { taskId },
    create: {
      taskId,
      rating,
      comment
    },
    update: {
      rating,
      comment
    }
  })
}

// ============================================
// 统计相关操作
// ============================================

/**
 * 获取用户统计数据
 * @param userId - 用户ID
 * @returns 用户任务统计数据（总数、完成数、连续天数、完成率）
 */
export async function getUserStats(userId: string) {
  const total = await prisma.task.count({ where: { userId } })
  const completed = await prisma.task.count({ 
    where: { userId, status: 'COMPLETED' } 
  })
  const streak = await calculateStreak(userId)
  
  return {
    total,
    completed,
    streak,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  }
}

/**
 * 计算用户连续打卡天数
 * @param userId - 用户ID
 * @returns 连续完成任务的次数
 * @remarks 从最近完成的任务开始计算，直到出现空缺
 */
async function calculateStreak(userId: string): Promise<number> {
  const tasks = await prisma.task.findMany({
    where: { 
      userId, 
      status: 'COMPLETED',
      completedAt: { not: null }
    },
    orderBy: { completedAt: 'desc' }
  })
  
  if (tasks.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const task of tasks) {
    const taskDate = new Date(task.completedAt!)
    taskDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor(
      (currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (diffDays === streak) {
      streak++
      currentDate = taskDate
    } else if (diffDays > streak) {
      break
    }
  }
  
  return streak
}
