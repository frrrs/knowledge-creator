/**
 * 脚本生成 API 路由
 * 根据选题和模板类型生成 AI 口播脚本
 */

import { NextRequest } from 'next/server'
import { generateScript } from '@/lib/ai/kimi-code'
import { successResponse, errorResponse, validateRequired } from '@/lib/utils/api'

/** 脚本模板类型 */
type TemplateType = 'tutorial' | 'story' | 'review' | 'opinion' | 'custom'

/** 生成脚本请求体 */
interface GenerateScriptRequest {
  topic: string
  templateType: TemplateType
  templateName?: string
  structure?: string[]
}

/**
 * POST /api/scripts/generate - AI生成脚本
 * 根据选题和模板类型生成口播脚本
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateScriptRequest = await request.json()

    // 验证必要参数
    const validationError = validateRequired(body, ['topic', 'templateType'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    const { topic, templateType, templateName } = body
    
    console.log('[API] Generating script for:', topic, 'type:', templateType)
    
    // 根据模板类型构建提示
    const promptMap: Record<string, string> = {
      tutorial: `这是一个教程类脚本，需要步骤清晰地讲解"${topic}"。受众是想要学习这个技能的新手。`,
      story: `这是一个故事类脚本，用叙事方式讲述与"${topic}"相关的故事。需要有情感共鸣。`,
      review: `这是一个评测类脚本，客观评价"${topic}"。需要既有优点也有缺点。`,
      opinion: `这是一个观点类脚本，表达对"${topic}"的独特见解。需要有论据支撑。`
    }
    
    const prompt = promptMap[templateType] || `创作关于"${topic}"的内容脚本。`
    
    // 调用AI生成脚本
    const scriptData = await generateScript({
      topic: prompt,
      domain: templateName || '通用',
      duration: 5
    })
    
    return successResponse({
      script: scriptData.content,
      hooks: scriptData.hooks,
      keywords: scriptData.keywords,
      templateType
    })
    
  } catch (error) {
    console.error('[API] Generate script error:', error)
    return errorResponse('AI脚本生成失败：' + (error instanceof Error ? error.message : '未知错误'), 500)
  }
}
