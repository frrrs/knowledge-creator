import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// User operations
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

// Task operations
export async function createTask(data: {
  userId: string
  title: string
  domain: string
  duration: number
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
}) {
  return prisma.task.create({
    data: {
      ...data,
      difficulty: data.difficulty || 'MEDIUM'
    }
  })
}

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

// Script operations
export async function createScript(taskId: string, content: string, hooks?: any, keywords?: any) {
  return prisma.script.create({
    data: {
      taskId,
      content,
      hooks: hooks || [],
      keywords: keywords || []
    }
  })
}

// Feedback operations
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

// Stats
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
