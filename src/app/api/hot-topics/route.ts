import { NextRequest, NextResponse } from 'next/server'
import { 
  getHotTopics, 
  filterTopicsByDomains,
  calculateTopicRelevance,
  generateTopicFromHot
} from '@/lib/services/hotTopics'
import { successResponse, errorResponse } from '@/lib/utils/api'

// GET /api/hot-topics?domains=经济学,心理学 - 获取热点列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domainsParam = searchParams.get('domains')
    const domains = domainsParam ? domainsParam.split(',') : []
    
    console.log('[API] Fetching hot topics for domains:', domains)
    
    // 获取所有热点
    let topics = await getHotTopics()
    
    // 根据领域筛选
    if (domains.length > 0) {
      topics = filterTopicsByDomains(topics, domains)
    }
    
    // 计算相关度分数并排序
    const topicsWithScore = topics.map(topic => ({
      ...topic,
      relevanceScore: calculateTopicRelevance(topic, domains)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore)
    
    return successResponse({
      topics: topicsWithScore,
      total: topicsWithScore.length,
      domains: domains,
      updatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[API] Hot topics error:', error)
    return errorResponse('Failed to fetch hot topics', 500)
  }
}

// POST /api/hot-topics/generate - 基于热点生成选题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotTopicId, domain } = body
    
    if (!hotTopicId || !domain) {
      return errorResponse('hotTopicId and domain are required', 400)
    }
    
    console.log('[API] Generating topic from hot:', hotTopicId, 'domain:', domain)
    
    // 获取热点信息
    const topics = await getHotTopics()
    const hotTopic = topics.find(t => t.id === hotTopicId)
    
    if (!hotTopic) {
      return errorResponse('Hot topic not found', 404)
    }
    
    // 生成选题
    const generatedTopic = generateTopicFromHot(hotTopic, domain)
    
    return successResponse({
      originalTopic: hotTopic,
      generatedTopic,
      domain
    })
    
  } catch (error) {
    console.error('[API] Generate topic from hot error:', error)
    return errorResponse('Failed to generate topic', 500)
  }
}
