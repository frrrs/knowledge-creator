// 热点数据服务
// 支持多平台热榜数据获取

interface HotTopic {
  id: string
  title: string
  platform: string
  heat: number // 热度值
  trend: 'up' | 'down' | 'stable'
  category?: string
  url?: string
  createdAt: string
}

// 模拟热榜数据（实际应调用API或爬虫）
const MOCK_HOT_TOPICS: HotTopic[] = [
  // 微博热榜
  { id: 'weibo-1', title: 'AI技术在教育领域的应用', platform: 'weibo', heat: 98, trend: 'up', category: '科技', createdAt: new Date().toISOString() },
  { id: 'weibo-2', title: '2024年最值得读的商业书籍', platform: 'weibo', heat: 85, trend: 'stable', category: '商业', createdAt: new Date().toISOString() },
  { id: 'weibo-3', title: '心理学解读：为什么总是拖延', platform: 'weibo', heat: 92, trend: 'up', category: '心理', createdAt: new Date().toISOString() },
  { id: 'weibo-4', title: '数字经济下的新职业机会', platform: 'weibo', heat: 78, trend: 'down', category: '商业', createdAt: new Date().toISOString() },
  
  // 知乎热榜
  { id: 'zhihu-1', title: '如何系统学习经济学？', platform: 'zhihu', heat: 88, trend: 'stable', category: '经济学', createdAt: new Date().toISOString() },
  { id: 'zhihu-2', title: '人工智能会取代哪些职业？', platform: 'zhihu', heat: 95, trend: 'up', category: '科技', createdAt: new Date().toISOString() },
  { id: 'zhihu-3', title: '认知偏差如何影响投资决策', platform: 'zhihu', heat: 72, trend: 'up', category: '心理', createdAt: new Date().toISOString() },
  
  // 抖音热点
  { id: 'douyin-1', title: '一分钟看懂区块链技术', platform: 'douyin', heat: 90, trend: 'up', category: '科技', createdAt: new Date().toISOString() },
  { id: 'douyin-2', title: '普通人如何开始内容创业', platform: 'douyin', heat: 86, trend: 'stable', category: '商业', createdAt: new Date().toISOString() },
  { id: 'douyin-3', title: '30天养成阅读习惯的秘诀', platform: 'douyin', heat: 82, trend: 'down', category: '教育', createdAt: new Date().toISOString() },
]

// 领域关键词映射
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  '经济学': ['经济', '金融', '投资', '理财', '商业', '市场', '消费', '价格', '货币', '贸易'],
  '心理学': ['心理', '认知', '情绪', '行为', '习惯', '拖延', '焦虑', '压力', '沟通', '人际关系'],
  '科技': ['AI', '人工智能', '科技', '技术', '互联网', '区块链', '数字化', '算法', '大数据', '云计算'],
  '商业': ['创业', '商业', '管理', '营销', '品牌', '战略', '职场', '领导力', '创新', '商业模式'],
  '历史': ['历史', '古代', '朝代', '战争', '文化', '文明', '考古', '人物', '事件', '史书'],
  '教育': ['教育', '学习', '考试', '读书', '知识', '技能', '成长', '方法', '效率', '记忆']
}

// 获取热点列表
export async function getHotTopics(): Promise<HotTopic[]> {
  // 实际实现应该调用热榜API
  // 如：微博API、知乎API、抖音热点API等
  
  // 按热度排序
  return MOCK_HOT_TOPICS.sort((a, b) => b.heat - a.heat)
}

// 根据用户领域筛选热点
export function filterTopicsByDomains(
  topics: HotTopic[], 
  domains: string[]
): HotTopic[] {
  if (!domains || domains.length === 0) return topics
  
  return topics.filter(topic => {
    // 直接匹配领域名称
    if (domains.includes(topic.category || '')) return true
    
    // 关键词匹配
    const topicKeywords = domains.flatMap(d => DOMAIN_KEYWORDS[d] || [])
    return topicKeywords.some(keyword => 
      topic.title.toLowerCase().includes(keyword.toLowerCase())
    )
  })
}

// 计算热点匹配度分数
export function calculateTopicRelevance(
  topic: HotTopic, 
  domains: string[]
): number {
  let score = 0
  
  // 基础热度分数（0-50分）
  score += (topic.heat / 100) * 50
  
  // 领域匹配加分（0-30分）
  if (domains.includes(topic.category || '')) {
    score += 30
  } else {
    // 关键词匹配
    const topicKeywords = domains.flatMap(d => DOMAIN_KEYWORDS[d] || [])
    const matchedKeywords = topicKeywords.filter(keyword =>
      topic.title.toLowerCase().includes(keyword.toLowerCase())
    )
    score += (matchedKeywords.length / Math.max(topicKeywords.length, 1)) * 30
  }
  
  // 趋势加分（0-20分）
  if (topic.trend === 'up') score += 20
  else if (topic.trend === 'stable') score += 10
  
  return Math.min(Math.round(score), 100)
}

// 生成基于热点的选题
export function generateTopicFromHot(
  hotTopic: HotTopic, 
  domain: string
): {
  title: string
  angle: string
  outline: string[]
} {
  const templates: Record<string, Array<{title: string, angle: string, outline: string[]}>> = {
    '经济学': [
      {
        title: `${hotTopic.title}背后的经济逻辑`,
        angle: '从经济学角度深度解读热点事件',
        outline: ['热点现象描述', '经济学原理分析', '实际案例佐证', '对普通人的启示']
      },
      {
        title: `${hotTopic.title}，普通人如何抓住机会？`,
        angle: '将热点与个人发展机会结合',
        outline: ['热点趋势分析', '机会点识别', '具体行动建议', '风险提示']
      }
    ],
    '心理学': [
      {
        title: `${hotTopic.title}的心理机制`,
        angle: '用心理学原理解读热点行为',
        outline: ['现象观察', '心理学概念解释', '实验/案例佐证', '应用建议']
      },
      {
        title: `从${hotTopic.title}看认知偏差`,
        angle: '揭示热点中的认知心理学',
        outline: ['热点事件回顾', '认知偏差分析', '如何避免类似偏差', '实用技巧']
      }
    ],
    'default': [
      {
        title: `${hotTopic.title}的深层解读`,
        angle: '深度分析热点背后的逻辑',
        outline: ['热点概述', '深度分析', '观点论证', '总结升华']
      },
      {
        title: `${hotTopic.title}，你需要知道的3件事`,
        angle: '用清单形式整理热点知识',
        outline: ['热点背景', '要点1：核心信息', '要点2：深度分析', '要点3：行动建议']
      }
    ]
  }
  
  const domainTemplates = templates[domain] || templates['default']
  const template = domainTemplates[Math.floor(Math.random() * domainTemplates.length)]
  
  return template
}

// 获取平台图标
export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    'weibo': '🔴',
    'zhihu': '🔵',
    'douyin': '⚫',
    'xiaohongshu': '🔴',
    'bilibili': '🟣'
  }
  return icons[platform] || '📱'
}

// 获取平台名称
export function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    'weibo': '微博',
    'zhihu': '知乎',
    'douyin': '抖音',
    'xiaohongshu': '小红书',
    'bilibili': 'B站'
  }
  return names[platform] || platform
}
