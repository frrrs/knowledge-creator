import { NextRequest } from 'next/server'
import { PrismaClient, TaskDifficulty, TaskStatus } from '@prisma/client'

const prisma = new PrismaClient()

/** 任务生成结果 */
interface TaskResult {
  userId: string
  status: 'created' | 'skipped' | 'error'
  taskId?: string
  reason?: string
  error?: string
}

/**
 * POST /api/cron/daily-tasks
 * 定时任务：每日为用户生成创作任务
 * 需要 CRON_SECRET 验证
 */
export async function POST(req: NextRequest) {
  try {
    // 验证 cron secret（防止未授权访问）
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取当前时间
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    console.log(`[Cron] Running daily task generation at ${currentTime}`)

    // 查找需要推送的用户（根据用户设置的推送时间）
    const users = await prisma.user.findMany({
      where: {
        settings: {
          pushTime: currentTime
        }
      },
      include: {
        settings: true
      }
    })

    console.log(`[Cron] Found ${users.length} users to generate tasks for`)

    const results: TaskResult[] = []

    // 为每个用户生成今日任务
    for (const user of users) {
      try {
        // 检查用户今天是否已有任务
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const existingTask = await prisma.task.findFirst({
          where: {
            userId: user.id,
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        })

        if (existingTask) {
          results.push({
            userId: user.id,
            status: 'skipped',
            reason: 'Task already exists for today'
          })
          continue
        }

        // 生成任务（使用 AI 或预设选题）
        const task = await generateDailyTask(user)
        
        results.push({
          userId: user.id,
          status: 'created',
          taskId: task.id
        })

        console.log(`[Cron] Created task for user ${user.id}: ${task.title}`)

      } catch (error) {
        console.error(`[Cron] Failed to create task for user ${user.id}:`, error)
        results.push({
          userId: user.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      usersProcessed: users.length,
      results
    })

  } catch (error) {
    console.error('[Cron] Daily task generation failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/** 简化用户类型 */
interface UserWithSettings {
  id: string
  domains: string[]
}

// 生成每日任务
async function generateDailyTask(user: UserWithSettings) {
  const domains = user.domains || ['科技']
  const domain = domains[Math.floor(Math.random() * domains.length)]

  // 选题库（实际应从数据库或 AI 生成）
  const topicPool: Record<string, string[]> = {
    '科技': [
      'AI 在医疗领域的应用',
      '为什么芯片制造如此困难？',
      '新能源车的未来趋势',
      '量子计算原理通俗解读'
    ],
    '商业': [
      '2024年创业避坑指南',
      '如何打造个人品牌？',
      '小而美的商业模式',
      '创业者的心理健康'
    ],
    '人文': [
      '古代智慧在现代的应用',
      '为什么哲学很重要？',
      '文学如何影响社会？'
    ],
    '心理': [
      '认知偏差与决策',
      '如何管理情绪？',
      '建立良好人际关系的技巧'
    ],
    '法律': [
      '普通人必知的法律常识',
      '知识产权如何保护？',
      '合同纠纷如何避免？'
    ],
    '教育': [
      '高效学习的方法',
      '如何培养孩子的创造力？',
      '终身学习的重要性'
    ]
  }

  const topics = topicPool[domain] || topicPool['科技']
  const title = topics[Math.floor(Math.random() * topics.length)]

  // 创建任务
  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title,
      domain,
      duration: [15, 20, 25][Math.floor(Math.random() * 3)],
      difficulty: ['EASY', 'MEDIUM', 'HARD'][Math.floor(Math.random() * 3)] as TaskDifficulty,
      status: 'PENDING'
    }
  })

  // 生成脚本
  await prisma.script.create({
    data: {
      taskId: task.id,
      content: generateScriptContent(title, domain),
      hooks: JSON.stringify([
        '你有没有遇到过这种情况？',
        '今天我要告诉你一个秘密',
        '这个问题困扰了很多人'
      ]),
      keywords: JSON.stringify([domain, '知识', '分享'])
    }
  })

  return task
}

// 生成脚本内容
function generateScriptContent(title: string, domain: string): string {
  return `【开场钩子】
你是不是也对${title}感到好奇？今天我就来为你揭秘！

【核心内容】
1. 首先，我们要理解这个问题的背景
2. 其次，分析其中的关键因素
3. 最后，给出实用的建议

【知识点讲解】
${title}实际上涉及到很多方面。从${domain}的角度来看，我们需要关注几个核心要点：

第一，理论基础要扎实。
第二，实践案例要丰富。
第三，表达方式要通俗。

【互动引导】
如果你对这个话题感兴趣，欢迎在评论区分享你的想法！

【结尾号召】
记得点赞关注，我们下期再见！`
}
