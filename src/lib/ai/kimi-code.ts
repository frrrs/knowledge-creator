import OpenAI from 'openai'
import { SYSTEM_PROMPT, buildPrompt, parseScript } from './prompts'

// Kimi Code API 配置
const kimiCode = new OpenAI({
  baseURL: process.env.KIMI_CODE_BASE_URL || 'https://api.kimi.com/coding/v1',
  apiKey: process.env.KIMI_CODE_API_KEY || '',
  defaultHeaders: {
    'User-Agent': 'KimiCLI/0.77'
  }
})

// 检查API配置
function checkAIConfig() {
  if (!process.env.KIMI_CODE_API_KEY) {
    throw new Error('KIMI_CODE_API_KEY 未配置')
  }
}

export async function generateScript(params: {
  topic: string
  domain: string
  duration: number
}) {
  // 检查配置
  checkAIConfig()
  
  console.log('[AI] Generating script for topic:', params.topic)
  
  try {
    const prompt = buildPrompt(params)
    console.log('[AI] Prompt length:', prompt.length)
    
    const response = await kimiCode.chat.completions.create({
      model: 'kimi-for-coding',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })
    
    const content = response.choices[0].message.content || ''
    console.log('[AI] Response length:', content.length)
    
    const parsed = parseScript(content)
    
    // 验证生成的脚本是否包含主题关键词
    const topicKeywords = params.topic.split(/\s+/)
    const hasTopicReference = topicKeywords.some(kw => 
      parsed.content.toLowerCase().includes(kw.toLowerCase())
    )
    
    if (!hasTopicReference && topicKeywords.length > 0) {
      console.warn('[AI] Generated script may not reference topic:', params.topic)
    }
    
    return parsed
  } catch (error) {
    console.error('[AI] Generate script error:', error)
    throw error
  }
}

export async function generateTopic(params: {
  domains: string[]
  userHistory?: string[]
}) {
  const prompt = `请为知识博主生成一个选题。

用户领域：${params.domains.join(', ')}
历史选题：${params.userHistory?.join(', ') || '无'}

要求：
1. 选题要有趣味性，能吸引普通观众
2. 结合当前热点或生活场景
3. 要有知识增量，不是常识
4. 适合3-5分钟讲解

请输出JSON格式：
{
  "title": "选题标题",
  "domain": "所属领域",
  "duration": 5,
  "difficulty": "EASY|MEDIUM|HARD",
  "tags": ["标签1", "标签2"],
  "outline": "简要大纲"
}`

  try {
    const response = await kimiCode.chat.completions.create({
      model: 'kimi-for-coding',
      messages: [
        { 
          role: 'system', 
          content: '你是知识博主选题策划专家，擅长发现有趣且有深度的选题。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    })
    
    const content = response.choices[0].message.content || '{}'
    return JSON.parse(content)
  } catch (error) {
    console.error('AI generate topic error:', error)
    // 返回默认选题
    return {
      title: `${params.domains[0]}中的有趣现象`,
      domain: params.domains[0],
      duration: 5,
      difficulty: 'MEDIUM',
      tags: ['入门'],
      outline: '现象描述 → 原理解释 → 实际应用'
    }
  }
}
