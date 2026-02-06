import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api'

// POST /api/tags/extract - 从内容中提取标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, topic, platform, extractSEO = true, extractTopics = true, extractEntities = true } = body
    
    if (!content && !topic) {
      return errorResponse('content or topic is required', 400)
    }
    
    console.log('[API] Extracting tags from content')
    
    const result: {
      seo: string[]
      topics: string[]
      entities: string[]
      hashtags: Record<string, string[]>
      recommendations: {
        title: string
        description: string
        keywords: string
      }
    } = {
      seo: [],
      topics: [],
      entities: [],
      hashtags: {},
      recommendations: {
        title: '',
        description: '',
        keywords: ''
      }
    }
    
    // 提取SEO关键词
    if (extractSEO) {
      result.seo = extractSEOKeywords(content, topic)
    }
    
    // 提取话题标签
    if (extractTopics) {
      result.topics = extractTopicTags(content, topic)
    }
    
    // 提取实体
    if (extractEntities) {
      result.entities = extractEntitiesFromContent(content, topic)
    }
    
    // 生成平台特定的hashtag
    result.hashtags = generatePlatformHashtags(
      [...result.seo, ...result.topics, ...result.entities],
      platform
    )
    
    // 生成SEO建议
    result.recommendations = generateSEOSuggestions(
      topic || extractTopicFromContent(content) || '',
      result.seo,
      content
    )
    
    return successResponse(result)
    
  } catch (error) {
    console.error('[API] Tag extraction error:', error)
    return errorResponse('Failed to extract tags', 500)
  }
}

// 提取SEO关键词
function extractSEOKeywords(content?: string, topic?: string): string[] {
  const keywords: string[] = []
  const text = `${topic || ''} ${content || ''}`.toLowerCase()
  
  // 预设关键词库（按领域分类）
  const keywordDatabase: Record<string, string[]> = {
    '经济学': ['经济学', '投资', '理财', '金融', '商业', '市场', '消费', '财富', '赚钱', '副业'],
    '心理学': ['心理学', '认知', '情绪', '行为', '习惯', '拖延', '焦虑', '压力', '沟通', '人际关系'],
    '科技': ['科技', 'AI', '人工智能', '互联网', '数字化', '区块链', '算法', '大数据'],
    '商业': ['创业', '商业', '管理', '营销', '品牌', '职场', '领导力', '创新'],
    '教育': ['教育', '学习', '考试', '读书', '知识', '技能', '成长', '方法']
  }
  
  // 从内容匹配关键词
  for (const [domain, words] of Object.entries(keywordDatabase)) {
    for (const word of words) {
      if (text.includes(word) && !keywords.includes(word)) {
        keywords.push(word)
      }
    }
  }
  
  // 提取长尾关键词（2-4字词组）
  const phrases = extractPhrases(text, 2, 4)
  keywords.push(...phrases.slice(0, 10))
  
  // 去重并限制数量
  return [...new Set(keywords)].slice(0, 15)
}

// 提取话题标签
function extractTopicTags(content?: string, topic?: string): string[] {
  const tags: string[] = []
  const text = `${topic || ''} ${content || ''}`
  
  // 热点话题库
  const hotTopics = [
    'AI技术', '数字化转型', '个人成长', '副业赚钱', '时间管理',
    '认知升级', '投资理财', '职场技能', '创业经验', '知识付费',
    '心理学', '自我提升', '读书分享', '科技前沿', '商业思维'
  ]
  
  for (const hotTopic of hotTopics) {
    if (text.includes(hotTopic)) {
      tags.push(hotTopic)
    }
  }
  
  // 提取核心概念作为标签
  const concepts = extractConcepts(text)
  tags.push(...concepts)
  
  return [...new Set(tags)].slice(0, 10)
}

// 提取实体
function extractEntitiesFromContent(content?: string, topic?: string): string[] {
  const entities: string[] = []
  const text = `${topic || ''} ${content || ''}`
  
  // 知名人物/品牌/产品
  const knownEntities = [
    'ChatGPT', 'OpenAI', '抖音', '小红书', 'B站', '微信',
    '阿里巴巴', '腾讯', '字节跳动', '马斯克', '乔布斯',
    '巴菲特', '比尔盖茨', '马云', '雷军', '张一鸣'
  ]
  
  for (const entity of knownEntities) {
    if (text.includes(entity)) {
      entities.push(entity)
    }
  }
  
  // 提取书名号内容
  const bookMatches = text.match(/《([^》]+)》/g)
  if (bookMatches) {
    entities.push(...bookMatches.map(m => m.replace(/[《》]/g, '')))
  }
  
  // 提取引号内容
  const quoteMatches = text.match(/"([^"]+)"/g)
  if (quoteMatches) {
    entities.push(...quoteMatches.map(m => m.replace(/"/g, '')))
  }
  
  return [...new Set(entities)].slice(0, 10)
}

// 生成平台特定的hashtag
function generatePlatformHashtags(
  keywords: string[],
  platform?: string
): Record<string, string[]> {
  const hashtags: Record<string, string[]> = {
    douyin: [],
    xiaohongshu: [],
    bilibili: [],
    wechat: [],
    zhihu: []
  }
  
  // 为每个平台生成hashtag
  for (const [platformId, list] of Object.entries(hashtags)) {
    const platformTags = keywords.slice(0, 8).map(kw => {
      // 根据平台调整格式
      switch (platformId) {
        case 'douyin':
          return `#${kw}`
        case 'xiaohongshu':
          return `#${kw}#`
        case 'bilibili':
          return `#${kw}#`
        case 'zhihu':
          return kw // 知乎不用#
        default:
          return kw
      }
    })
    hashtags[platformId] = platformTags
  }
  
  // 如果只指定了一个平台，只返回该平台
  if (platform && hashtags[platform]) {
    return { [platform]: hashtags[platform] }
  }
  
  return hashtags
}

// 生成SEO建议
function generateSEOSuggestions(
  topic: string,
  keywords: string[],
  content?: string
): {
  title: string
  description: string
  keywords: string
} {
  // 生成标题建议
  const titleTemplates = [
    `${topic}：${keywords.slice(0, 3).join('、')}完整指南`,
    `关于${topic}，${keywords[0] || '专家'}告诉你真相`,
    `${topic}的${keywords[1] || '核心'}方法，看完就能用`,
    `一文读懂${topic}：${keywords.slice(0, 2).join('与')}`
  ]
  
  // 生成描述
  const descPreview = content ? content.slice(0, 50) : topic
  const description = `${topic}深度解析。本文将从${keywords.slice(0, 3).join('、')}等角度，${descPreview}...帮助你全面理解${topic}的核心要点。`
  
  return {
    title: titleTemplates[0],
    description: description.slice(0, 100) + '...',
    keywords: keywords.slice(0, 8).join(', ')
  }
}

// 辅助函数：从内容提取主题
function extractTopicFromContent(content?: string): string | null {
  if (!content) return null
  
  // 提取前15个字作为主题
  const cleanContent = content.replace(/[【】\[\]\(\)：:]/g, '').trim()
  return cleanContent.slice(0, 15) || null
}

// 辅助函数：提取词组
function extractPhrases(text: string, minLen: number, maxLen: number): string[] {
  const phrases: string[] = []
  const segments = text.split(/[，。！？\s]/)
  
  for (const segment of segments) {
    if (segment.length >= minLen && segment.length <= maxLen) {
      phrases.push(segment)
    }
  }
  
  return phrases
}

// 辅助函数：提取核心概念
function extractConcepts(text: string): string[] {
  const concepts: string[] = []
  
  // 常见概念词库
  const conceptWords = [
    '思维模型', '认知框架', '方法论', '底层逻辑', '核心原理',
    '关键要素', '操作步骤', '实用技巧', '避坑指南', '成功要素'
  ]
  
  for (const concept of conceptWords) {
    if (text.includes(concept)) {
      concepts.push(concept)
    }
  }
  
  return concepts
}
