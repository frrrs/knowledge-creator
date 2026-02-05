'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Target } from 'lucide-react'

interface ScriptViewerProps {
  content: string
  hooks?: Array<{ position: number; text: string }>
  keywords?: string[]
}

export function ScriptViewer({ content, hooks = [], keywords = [] }: ScriptViewerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['hook'])
  
  // 解析脚本各部分
  const sections = parseSections(content)
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }
  
  const sectionTitles: Record<string, string> = {
    hook: '🔥 钩子（前3秒）',
    pain: '💡 痛点',
    knowledge: '📚 核心知识',
    interaction: '🎯 互动设计',
    ending: '📝 结尾'
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-white font-semibold text-lg">口播脚本</h2>
        <p className="text-blue-100 text-sm mt-1">
          预计时长：{estimateDuration(content)}分钟 | 字数：{content.length}
        </p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {Object.entries(sections).map(([key, text]) => {
          if (!text) return null
          const isExpanded = expandedSections.includes(key)
          
          return (
            <div key={key} className="">
              <button
                onClick={() => toggleSection(key)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-800">{sectionTitles[key] || key}</span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-4">
                  <div className="prose prose-blue max-w-none">
                    {highlightContent(text, hooks, keywords)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {hooks.length > 0 && (
        <div className="px-6 py-4 bg-yellow-50 border-t border-yellow-100">
          <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            互动提示点
          </h4>
          <ul className="space-y-1">
            {hooks.map((hook, index) => (
              <li key={index} className="text-sm text-yellow-700">
                {index + 1}. {hook.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function parseSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {
    hook: '',
    pain: '',
    knowledge: '',
    interaction: '',
    ending: ''
  }
  
  const sectionMap: Record<string, string> = {
    '钩子': 'hook',
    '痛点': 'pain',
    '知识点': 'knowledge',
    '互动': 'interaction',
    '结尾': 'ending'
  }
  
  const regex = /【(.+?)】([\s\S]*?)(?=【|$)/g
  let match
  
  while ((match = regex.exec(content)) !== null) {
    const cnName = match[1]
    const enName = sectionMap[cnName]
    if (enName) {
      sections[enName] = match[2].trim()
    }
  }
  
  // 如果没有解析到，把整个内容作为knowledge
  if (!sections.hook && !sections.knowledge) {
    sections.knowledge = content
  }
  
  return sections
}

function highlightContent(
  text: string, 
  hooks: Array<{ position: number; text: string }>,
  keywords: string[]
) {
  let highlighted = text
  
  // 高亮关键词
  keywords.forEach(keyword => {
    highlighted = highlighted.replace(
      new RegExp(keyword, 'g'),
      `<span class="bg-blue-100 text-blue-800 px-1 rounded">${keyword}</span>`
    )
  })
  
  // 高亮互动标记
  highlighted = highlighted.replace(
    /🎯([^\n]+)/g,
    `<span class="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
      <Target className="w-3 h-3" />$1
    </span>`
  )
  
  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />
}

function estimateDuration(content: string): number {
  // 中文大约每分钟200-250字
  const chars = content.length
  return Math.max(1, Math.round(chars / 220))
}
