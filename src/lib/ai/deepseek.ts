/**
 * DeepSeek AI 服务模块
 * 提供脚本生成和选题推荐的 AI 能力
 */

import OpenAI from 'openai'
import { SYSTEM_PROMPT, buildPrompt, parseScript, type ScriptParams, type ParsedScript } from './prompts'

/** DeepSeek AI 客户端 */
const deepseek = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
})

/** 选题生成参数 */
interface TopicParams {
  domains: string[]
  userHistory?: string[]
}

/** 选题生成结果 */
interface GeneratedTopic {
  title: string
  domain: string
  duration: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  outline: string
}

/**
 * 使用 DeepSeek 生成脚本
 * @param params - 脚本生成参数
 * @returns 解析后的脚本数据
 */
export async function generateScript(params: ScriptParams): Promise<ParsedScript> {
  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
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

/**
 * 使用 DeepSeek 生成选题
 * @param params - 选题生成参数
 * @returns 生成的选题信息
 */
export async function generateTopic(params: TopicParams): Promise<GeneratedTopic> {
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
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
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
