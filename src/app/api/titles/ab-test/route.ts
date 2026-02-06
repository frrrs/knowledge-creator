import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api'

// POST /api/titles/ab-test - 生成多个标题版本供A/B测试
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, content, targetPlatform, style } = body
    
    if (!topic) {
      return errorResponse('topic is required', 400)
    }
    
    console.log('[API] Generating A/B test titles for:', topic)
    
    // 生成不同风格的标题
    const titles = generateTitleVariants(topic, content, targetPlatform, style)
    
    // 为每个标题计算预测评分
    const titlesWithScore = titles.map(title => ({
      ...title,
      predictedScore: calculateTitleScore(title.text, targetPlatform)
    }))
    
    // 按预测分数排序
    titlesWithScore.sort((a, b) => b.predictedScore - a.predictedScore)
    
    return successResponse({
      topic,
      titles: titlesWithScore,
      total: titlesWithScore.length,
      platforms: targetPlatform || ['通用']
    })
    
  } catch (error) {
    console.error('[API] A/B title generation error:', error)
    return errorResponse('Failed to generate titles', 500)
  }
}

// 生成标题变体
function generateTitleVariants(
  topic: string,
  content?: string,
  targetPlatform?: string[],
  style?: string
): Array<{
  text: string
  style: string
  technique: string
  reason: string
}> {
  const titles: Array<{
    text: string
    style: string
    technique: string
    reason: string
  }> = []
  
  // 1. 数字型标题
  titles.push({
    text: `关于${topic}的5个真相，第3个让90%的人惊讶`,
    style: '数字型',
    technique: '具体数字+悬念',
    reason: '数字增加可信度，悬念激发好奇心'
  })
  
  titles.push({
    text: `${topic}：3分钟搞懂核心要点`,
    style: '数字型',
    technique: '时间承诺+价值明确',
    reason: '降低阅读门槛，明确时间成本'
  })
  
  // 2. 疑问型标题
  titles.push({
    text: `为什么${topic}这么重要？看完你就明白了`,
    style: '疑问型',
    technique: '反问+结果承诺',
    reason: '引发思考，承诺价值'
  })
  
  titles.push({
    text: `${topic}真的有用吗？实测结果出乎意料`,
    style: '疑问型',
    technique: '质疑+反转',
    reason: '打破认知，制造冲突'
  })
  
  // 3. 痛点型标题
  titles.push({
    text: `还在为${topic}烦恼？这个方法帮你解决`,
    style: '痛点型',
    technique: '痛点共鸣+解决方案',
    reason: '直击痛点，提供希望'
  })
  
  titles.push({
    text: `不懂${topic}的人，正在错失这些机会`,
    style: '痛点型',
    technique: '损失厌恶',
    reason: '制造紧迫感，触发损失厌恶'
  })
  
  // 4. 权威型标题
  titles.push({
    text: `深度解析：${topic}的本质与未来趋势`,
    style: '权威型',
    technique: '专业术语+深度',
    reason: '建立权威感，吸引专业读者'
  })
  
  titles.push({
    text: `研究${topic}10年，我想告诉你这些`,
    style: '权威型',
    technique: '经验背书',
    reason: '用时间积累建立信任'
  })
  
  // 5. 对比型标题
  titles.push({
    text: `${topic}：新手vs高手的思维方式差异`,
    style: '对比型',
    technique: '对比冲突',
    reason: '对比产生张力，激发学习兴趣'
  })
  
  // 6. 揭秘型标题
  titles.push({
    text: `揭秘：${topic}背后不为人知的秘密`,
    style: '揭秘型',
    technique: '神秘感+稀缺性',
    reason: '制造独家感，满足窥探欲'
  })
  
  // 7. 实用型标题
  titles.push({
    text: `【收藏】${topic}最全指南，一篇文章搞定`,
    style: '实用型',
    technique: '收藏价值+全面性',
    reason: '实用价值高，促进收藏转发'
  })
  
  // 8. 情感型标题
  titles.push({
    text: `看完这篇关于${topic}的文章，我彻底改变了想法`,
    style: '情感型',
    technique: '情感共鸣+转变',
    reason: '情感驱动，制造代入感'
  })
  
  // 9. 反常识型标题
  titles.push({
    text: `${topic}的真相可能和你想的不一样`,
    style: '反常识型',
    technique: '认知冲突',
    reason: '打破预期，激发好奇心'
  })
  
  // 10. 故事型标题
  titles.push({
    text: `从${topic}小白到专家，我的成长之路`,
    style: '故事型',
    technique: '成长叙事',
    reason: '故事性强，易于产生共鸣'
  })
  
  // 根据平台定制
  if (targetPlatform?.includes('douyin')) {
    titles.push({
      text: `${topic}太重要了！30秒讲清楚`,
      style: '抖音型',
      technique: '短视频钩子+时间承诺',
      reason: '符合抖音快节奏特点'
    })
  }
  
  if (targetPlatform?.includes('xiaohongshu')) {
    titles.push({
      text: `姐妹们！${topic}的保姆级教程来了✨`,
      style: '小红书型',
      technique: '亲切称呼+emoji+实用承诺',
      reason: '符合小红书种草风格'
    })
  }
  
  return titles
}

// 计算标题评分（基于多种因素）
function calculateTitleScore(title: string, platforms?: string[]): number {
  let score = 50 // 基础分
  
  // 1. 长度评分（15-30字最佳）
  const length = title.length
  if (length >= 15 && length <= 30) {
    score += 15
  } else if (length >= 10 && length <= 40) {
    score += 10
  }
  
  // 2. 包含数字加分
  if (/\d+/.test(title)) {
    score += 10
  }
  
  // 3. 包含标点符号（增加情感）
  if (/[！？?]/.test(title)) {
    score += 5
  }
  
  // 4. 包含emoji（适合社交媒体）
  if (/[\u{1F600}-\u{1F64F}]/u.test(title)) {
    score += 5
  }
  
  // 5. 包含关键词加分
  const powerWords = ['真相', '秘密', '揭秘', '必看', '最全', '干货', '收藏', '指南', '教程', '方法']
  const matchedWords = powerWords.filter(word => title.includes(word))
  score += matchedWords.length * 3
  
  // 6. 情感词加分
  const emotionWords = ['震惊', '感动', '惊喜', '重要', '紧急', '必看']
  const matchedEmotions = emotionWords.filter(word => title.includes(word))
  score += matchedEmotions.length * 2
  
  // 7. 疑问词加分
  if (/为什么|如何|怎么|吗|？/.test(title)) {
    score += 5
  }
  
  // 8. 数字越大越好（心理暗示）
  const numbers = title.match(/\d+/g)
  if (numbers) {
    const maxNum = Math.max(...numbers.map(n => parseInt(n)))
    if (maxNum >= 10) score += 3
    if (maxNum >= 50) score += 5
    if (maxNum >= 100) score += 8
  }
  
  // 9. 减分项
  if (title.length < 8) score -= 10 // 太短
  if (title.length > 50) score -= 10 // 太长
  if (/^[^\u4e00-\u9fa5a-zA-Z]/.test(title)) score -= 5 // 以标点开头
  
  return Math.min(Math.max(score, 0), 100)
}
