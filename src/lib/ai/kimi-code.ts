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

export async function generateScript(params: {
  topic: string
  domain: string
  duration: number
}) {
  try {
    const response = await kimiCode.chat.completions.create({
      model: 'kimi-for-coding',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(params) }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })
    
    const content = response.choices[0].message.content || ''
    return parseScript(content)
  } catch (error) {
    console.error('AI generate script error:', error)
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
