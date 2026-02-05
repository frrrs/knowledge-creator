export const SYSTEM_PROMPT = `你是一位资深知识博主内容策划专家。
你的任务是将专业知识转化为通俗易懂的口播稿。

要求：
1. 开头3秒必须有吸引人的钩子
2. 用"说人话"的方式解释专业概念
3. 删除冗余词汇，保持节奏紧凑
4. 在关键位置插入互动提示（用🎯标记）
5. 控制字数在500-800字（3-5分钟口播）

输出格式：
【钩子】...
【痛点】...
【知识点】...
【互动】...
【结尾】...
`

export function buildPrompt(params: {
  topic: string
  domain: string
  duration: number
}) {
  return `请为以下选题生成口播稿：

选题：${params.topic}
领域：${params.domain}
时长：约${params.duration}分钟

请直接输出口播稿全文。`
}

export function parseScript(content: string) {
  // 解析脚本，提取各个部分
  const sections = {
    hook: extractSection(content, '钩子'),
    pain: extractSection(content, '痛点'),
    knowledge: extractSection(content, '知识点'),
    interaction: extractSection(content, '互动'),
    ending: extractSection(content, '结尾'),
    fullContent: content
  }
  
  // 提取互动点位置
  const hooks = findHooks(content)
  
  return {
    content,
    sections,
    hooks,
    keywords: extractKeywords(content)
  }
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`【${sectionName}】([\\s\\S]*?)(?=【|$)`, 'i')
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

function findHooks(content: string): Array<{position: number, text: string}> {
  const hooks: Array<{position: number, text: string}> = []
  const regex = /🎯([^🎯\n]+)/g
  let match
  while ((match = regex.exec(content)) !== null) {
    hooks.push({
      position: match.index,
      text: match[1].trim()
    })
  }
  return hooks
}

function extractKeywords(content: string): string[] {
  // 简单关键词提取，后续可以用NLP优化
  const commonWords = new Set(['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'])
  const words = content.match(/[\u4e00-\u9fa5]{2,4}/g) || []
  const freq: Record<string, number> = {}
  
  words.forEach(word => {
    if (!commonWords.has(word) && word.length >= 2) {
      freq[word] = (freq[word] || 0) + 1
    }
  })
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}
