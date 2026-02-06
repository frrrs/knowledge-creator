import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/utils/api'

// POST /api/predict/performance - 预测内容表现
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, topic, platform, userId } = body
    
    if (!title && !content) {
      return errorResponse('title or content is required', 400)
    }
    
    console.log('[API] Predicting performance for:', title?.slice(0, 30))
    
    // 获取用户历史数据（用于个性化预测）
    const userHistory = userId ? await getUserHistory(userId) : null
    
    // 进行多维度评分
    const scores = calculateContentScores(title, content, platform, userHistory)
    
    // 生成预测数据
    const prediction = generatePrediction(scores, platform, userHistory)
    
    // 生成优化建议
    const suggestions = generateSuggestions(scores, title, content)
    
    return successResponse({
      scores,
      prediction,
      suggestions,
      analysis: {
        titleAnalysis: analyzeTitle(title),
        contentAnalysis: analyzeContent(content),
        timingAnalysis: analyzeTiming(platform)
      }
    })
    
  } catch (error) {
    console.error('[API] Performance prediction error:', error)
    return errorResponse('Failed to predict performance', 500)
  }
}

// 获取用户历史表现数据
async function getUserHistory(userId: string) {
  try {
    // 获取用户完成的任务
    const completedTasks = await prisma.task.findMany({
      where: { 
        userId,
        status: 'COMPLETED'
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    
    // 获取用户评分数据
    const ratings = await prisma.scriptRating.findMany({
      where: {
        script: {
          task: { userId }
        }
      }
    })
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 3.5
    
    return {
      totalCompleted: completedTasks.length,
      avgRating,
      domains: completedTasks.map(t => t.domain),
      consistency: calculateConsistency(completedTasks)
    }
  } catch (error) {
    console.error('Get user history error:', error)
    return null
  }
}

// 计算内容多维度评分
function calculateContentScores(
  title?: string,
  content?: string,
  platform?: string,
  userHistory?: any
): {
  overall: number
  attractiveness: number
  readability: number
  shareability: number
  completeness: number
  timing: number
} {
  const text = `${title || ''} ${content || ''}`
  
  // 1. 吸引力评分 (0-100)
  let attractiveness = 50
  if (title) {
    // 标题长度
    if (title.length >= 15 && title.length <= 30) attractiveness += 10
    // 包含数字
    if (/\d+/.test(title)) attractiveness += 10
    // 包含情感词
    if (/震惊|惊喜|必看|揭秘|真相/.test(title)) attractiveness += 15
    // 包含疑问
    if (/为什么|如何|怎么/.test(title)) attractiveness += 10
    // 包含痛点
    if (/不懂|不会|迷茫|焦虑|困扰/.test(title)) attractiveness += 10
  }
  attractiveness = Math.min(attractiveness, 100)
  
  // 2. 可读性评分 (0-100)
  let readability = 50
  if (content) {
    // 段落长度适中
    const paragraphs = content.split(/\n/)
    const avgParaLength = content.length / Math.max(paragraphs.length, 1)
    if (avgParaLength < 100) readability += 15
    // 有分点
    if (/[•·\d+\.\-]/.test(content)) readability += 15
    // 有标题层级
    if (/【|】|\[|\]|#+/.test(content)) readability += 10
    // 字数适中
    if (content.length >= 300 && content.length <= 2000) readability += 10
  }
  readability = Math.min(readability, 100)
  
  // 3. 传播性评分 (0-100)
  let shareability = 50
  if (text) {
    // 包含价值承诺
    if (/学会|掌握|搞定|解决|提升/.test(text)) shareability += 15
    // 包含情绪共鸣
    if (/感动|震撼|惊讶|认同/.test(text)) shareability += 10
    // 包含实用性
    if (/技巧|方法|步骤|攻略|指南/.test(text)) shareability += 15
    // 包含稀缺性
    if (/独家|首次|揭秘|内部|秘密/.test(text)) shareability += 10
  }
  shareability = Math.min(shareability, 100)
  
  // 4. 完整性评分 (0-100)
  let completeness = 50
  if (content) {
    // 有开头
    if (content.length > 50) completeness += 10
    // 有中间内容
    if (content.length > 300) completeness += 15
    // 有结尾
    if (/总结|总之|最后|希望|记得/.test(content)) completeness += 15
    // 有互动引导
    if (/评论|分享|点赞|关注|你怎么看/.test(content)) completeness += 10
  }
  completeness = Math.min(completeness, 100)
  
  // 5. 发布时机评分 (0-100)
  let timing = calculateTimingScore(platform)
  
  // 综合评分
  const overall = Math.round(
    (attractiveness * 0.25) +
    (readability * 0.20) +
    (shareability * 0.25) +
    (completeness * 0.20) +
    (timing * 0.10)
  )
  
  return {
    overall: Math.min(overall, 100),
    attractiveness,
    readability,
    shareability,
    completeness,
    timing
  }
}

// 计算发布时机评分
function calculateTimingScore(platform?: string): number {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  
  let score = 50
  
  // 平台最佳发布时间
  const platformBestTimes: Record<string, number[]> = {
    'douyin': [7, 12, 18, 21, 22], // 早中晚 + 睡前
    'xiaohongshu': [7, 12, 20, 22],
    'bilibili': [12, 18, 20, 21, 22],
    'wechat': [7, 12, 18, 21],
    'zhihu': [12, 20, 21, 22]
  }
  
  if (platform && platformBestTimes[platform]) {
    const bestTimes = platformBestTimes[platform]
    if (bestTimes.includes(hour)) {
      score += 30
    } else if (bestTimes.some(t => Math.abs(t - hour) <= 1)) {
      score += 15
    }
  } else {
    // 通用最佳时间
    if ([7, 12, 18, 20, 21].includes(hour)) {
      score += 20
    }
  }
  
  // 周末加分
  if (day === 0 || day === 6) {
    score += 10
  }
  
  return Math.min(score, 100)
}

// 生成预测数据
function generatePrediction(
  scores: any,
  platform?: string,
  userHistory?: any
): {
  estimatedViews: { min: number; max: number; unit: string }
  estimatedLikes: { min: number; max: number; unit: string }
  estimatedShares: { min: number; max: number; unit: string }
  confidence: number
  potential: 'low' | 'medium' | 'high' | 'viral'
} {
  // 基础数据
  const baseViews = scores.overall * 100
  const userMultiplier = userHistory ? (userHistory.avgRating / 3.5) : 1
  
  // 平台系数
  const platformMultiplier: Record<string, number> = {
    'douyin': 1.5,
    'xiaohongshu': 1.3,
    'bilibili': 1.2,
    'wechat': 1.0,
    'zhihu': 0.8
  }
  const pm = platform ? (platformMultiplier[platform] || 1) : 1
  
  // 计算预测值
  const estimatedViews = Math.round(baseViews * userMultiplier * pm)
  const estimatedLikes = Math.round(estimatedViews * (scores.attractiveness / 100) * 0.05)
  const estimatedShares = Math.round(estimatedViews * (scores.shareability / 100) * 0.02)
  
  // 潜力评级
  let potential: 'low' | 'medium' | 'high' | 'viral' = 'low'
  if (scores.overall >= 85) potential = 'viral'
  else if (scores.overall >= 70) potential = 'high'
  else if (scores.overall >= 55) potential = 'medium'
  
  // 置信度
  const confidence = Math.min(
    50 + (userHistory ? 20 : 0) + (scores.overall > 70 ? 20 : 10),
    95
  )
  
  return {
    estimatedViews: formatNumber(estimatedViews),
    estimatedLikes: formatNumber(estimatedLikes),
    estimatedShares: formatNumber(estimatedShares),
    confidence,
    potential
  }
}

// 格式化数字
function formatNumber(num: number): { min: number; max: number; unit: string } {
  if (num >= 10000) {
    return {
      min: Math.round(num * 0.7 / 1000),
      max: Math.round(num * 1.3 / 1000),
      unit: 'k'
    }
  }
  return {
    min: Math.round(num * 0.7),
    max: Math.round(num * 1.3),
    unit: ''
  }
}

// 生成优化建议
function generateSuggestions(
  scores: any,
  title?: string,
  content?: string
): Array<{
  type: 'title' | 'content' | 'timing' | 'general'
  priority: 'high' | 'medium' | 'low'
  message: string
  action: string
}> {
  const suggestions = []
  
  // 标题建议
  if (scores.attractiveness < 60) {
    suggestions.push({
      type: 'title',
      priority: 'high',
      message: '标题吸引力不足',
      action: '建议添加数字、疑问词或情感词，如"5个技巧""为什么""震惊"'
    })
  }
  
  if (title && title.length < 10) {
    suggestions.push({
      type: 'title',
      priority: 'high',
      message: '标题过短',
      action: '建议标题长度15-30字，传递更多信息量'
    })
  }
  
  // 内容建议
  if (scores.readability < 60) {
    suggestions.push({
      type: 'content',
      priority: 'medium',
      message: '内容可读性有待提升',
      action: '建议使用短段落、分点说明、添加小标题'
    })
  }
  
  if (scores.shareability < 60) {
    suggestions.push({
      type: 'content',
      priority: 'medium',
      message: '内容传播性较弱',
      action: '建议增加实用价值、情感共鸣或稀缺信息'
    })
  }
  
  if (!content || content.length < 200) {
    suggestions.push({
      type: 'content',
      priority: 'high',
      message: '内容篇幅偏短',
      action: '建议扩充到300-2000字，提供更完整的信息'
    })
  }
  
  if (content && !/评论|分享|你怎么看|记得/.test(content)) {
    suggestions.push({
      type: 'content',
      priority: 'low',
      message: '缺少互动引导',
      action: '建议在结尾添加互动引导，如"你怎么看？"'
    })
  }
  
  // 时机建议
  if (scores.timing < 60) {
    suggestions.push({
      type: 'timing',
      priority: 'low',
      message: '当前可能不是最佳发布时间',
      action: '建议选择早晚高峰时段（7-9点，18-22点）发布'
    })
  }
  
  // 按优先级排序
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

// 标题分析
function analyzeTitle(title?: string): {
  length: number
  hasNumber: boolean
  hasQuestion: boolean
  hasEmotion: boolean
  keywords: string[]
} {
  if (!title) {
    return { length: 0, hasNumber: false, hasQuestion: false, hasEmotion: false, keywords: [] }
  }
  
  return {
    length: title.length,
    hasNumber: /\d+/.test(title),
    hasQuestion: /为什么|如何|怎么|吗\?/.test(title),
    hasEmotion: /震惊|惊喜|必看|揭秘|真相|感动/.test(title),
    keywords: extractKeywords(title)
  }
}

// 内容分析
function analyzeContent(content?: string): {
  wordCount: number
  paragraphCount: number
  hasStructure: boolean
  hasList: boolean
  hasCTA: boolean
} {
  if (!content) {
    return { wordCount: 0, paragraphCount: 0, hasStructure: false, hasList: false, hasCTA: false }
  }
  
  return {
    wordCount: content.length,
    paragraphCount: content.split(/\n/).length,
    hasStructure: /【|】|#+|\[\d+\]/.test(content),
    hasList: /[•·\d+\.\-]/.test(content),
    hasCTA: /评论|分享|点赞|关注|你怎么看/.test(content)
  }
}

// 时机分析
function analyzeTiming(platform?: string): {
  currentHour: number
  isBestTime: boolean
  bestTimes: number[]
  suggestion: string
} {
  const now = new Date()
  const hour = now.getHours()
  
  const platformBestTimes: Record<string, number[]> = {
    'douyin': [7, 12, 18, 21, 22],
    'xiaohongshu': [7, 12, 20, 22],
    'bilibili': [12, 18, 20, 21, 22],
    'wechat': [7, 12, 18, 21],
    'zhihu': [12, 20, 21, 22]
  }
  
  const bestTimes = platform ? (platformBestTimes[platform] || [7, 12, 18, 20]) : [7, 12, 18, 20]
  const isBestTime = bestTimes.includes(hour)
  
  return {
    currentHour: hour,
    isBestTime,
    bestTimes,
    suggestion: isBestTime ? '当前是较好的发布时间' : `建议在 ${bestTimes.join('、')} 点发布`
  }
}

// 提取关键词
function extractKeywords(text: string): string[] {
  const keywords: string[] = []
  const patterns = [
    /(?:关于|聊聊|谈谈|说说)([^，。]+)/,
    /(?:如何|怎么|为什么)([^，。]+)/,
    /(\d+个[^，。]+)/,
    /([^，。]+)(?:技巧|方法|攻略|指南)/
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      keywords.push(match[1].trim())
    }
  }
  
  return keywords.slice(0, 3)
}

// 计算创作一致性
function calculateConsistency(tasks: any[]): number {
  if (tasks.length < 3) return 50
  
  // 计算发布频率一致性
  const dates = tasks.map(t => new Date(t.createdAt).toDateString())
  const uniqueDates = [...new Set(dates)]
  
  // 最近7天内有创作则加分
  const recentDays = dates.filter(d => {
    const date = new Date(d)
    const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }).length
  
  return Math.min(50 + recentDays * 10, 100)
}
