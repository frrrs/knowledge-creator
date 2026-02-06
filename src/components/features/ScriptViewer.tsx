'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Target, Clock, MessageSquare, Sparkles, CheckCircle } from 'lucide-react'

interface ScriptViewerProps {
  content: string
  sections?: {
    hook: string
    pain: string
    knowledge: string
    interaction: string
    ending: string
    fullContent: string
  }
  hooks?: Array<{ position: string; text: string; type: string }>
  keywords?: string[]
  wordCount?: number
  validation?: { isValid: boolean; issues: string[] }
}

export function ScriptViewer({ 
  content, 
  sections,
  hooks = [], 
  keywords = [],
  wordCount = 0,
  validation
}: ScriptViewerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['hook', 'knowledge'])
  
  // 如果没有传入 sections，实时解析
  const scriptSections = sections || parseSections(content)
  const duration = estimateDuration(wordCount || content.length)
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }
  
  const sectionConfig: Record<string, { title: string; icon: any; color: string; time: string }> = {
    hook: { 
      title: '开场钩子', 
      icon: Sparkles, 
      color: 'text-orange-500',
      time: '3秒'
    },
    pain: { 
      title: '痛点共鸣', 
      icon: MessageSquare, 
      color: 'text-blue-500',
      time: '10秒'
    },
    knowledge: { 
      title: '核心知识', 
      icon: Target, 
      color: 'text-purple-500',
      time: '60秒'
    },
    interaction: { 
      title: '互动设计', 
      icon: MessageSquare, 
      color: 'text-green-500',
      time: '5秒'
    },
    ending: { 
      title: '结尾号召', 
      icon: CheckCircle, 
      color: 'text-red-500',
      time: '5秒'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI 生成脚本
        </h2>
        <div className="flex items-center gap-4 mt-2 text-blue-100 text-sm">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            预计 {duration} 分钟
          </span>
          <span>{wordCount || content.length} 字</span>
          {validation?.isValid && (
            <span className="flex items-center gap-1 text-green-300">
              <CheckCircle className="w-4 h-4" />
              质量合格
            </span>
          )}
        </div>
      </div>
      
      {/* Quality Issues Warning */}
      {validation && !validation.isValid && validation.issues.length > 0 && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-100">
          <h4 className="text-sm font-medium text-yellow-800 mb-1">💡 优化建议</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            {validation.issues.map((issue, idx) => (
              <li key={idx}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Script Sections */}
      <div className="divide-y divide-gray-100">
        {Object.entries(scriptSections)
          .filter(([key]) => key !== 'fullContent' && scriptSections[key as keyof typeof scriptSections])
          .map(([key, text]) => {
            if (!text) return null
            const config = sectionConfig[key]
            if (!config) return null
            
            const Icon = config.icon
            const isExpanded = expandedSections.includes(key)
            
            return (
              <div key={key} className="">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-800">{config.title}</span>
                      <span className="text-xs text-gray-400 ml-2">{config.time}</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {highlightContent(String(text), hooks, keywords)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>
      
      {/* Hooks Summary */}
      {hooks.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-100">
          <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            互动埋点 ({hooks.length}个)
          </h4>
          <div className="space-y-2">
            {hooks.map((hook, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-medium flex-shrink-0">
                  {hook.position}
                </span>
                <div>
                  <span className="text-yellow-700">{hook.text}</span>
                  <span className="text-yellow-500 text-xs ml-2">({hook.type})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function parseSections(content: string) {
  const sections = {
    hook: '',
    pain: '',
    knowledge: '',
    interaction: '',
    ending: '',
    fullContent: content
  }
  
  const sectionMap: Record<string, keyof typeof sections> = {
    '钩子': 'hook',
    '痛点': 'pain',
    '知识点': 'knowledge',
    '核心知识': 'knowledge',
    '互动': 'interaction',
    '互动设计': 'interaction',
    '结尾': 'ending',
    '结尾号召': 'ending'
  }
  
  const regex = /【(.+?)】([\s\S]*?)(?=【|$)/g
  let match
  
  while ((match = regex.exec(content)) !== null) {
    const cnName = match[1].trim()
    const enName = sectionMap[cnName]
    if (enName && enName !== 'fullContent') {
      sections[enName] = match[2].trim()
    }
  }
  
  // 如果没有解析到，把整个内容作为knowledge
  if (!sections.hook && !sections.knowledge && content) {
    sections.knowledge = content
  }
  
  return sections
}

function highlightContent(
  text: string, 
  hooks: Array<{ position: string; text: string; type: string }>,
  keywords: string[]
) {
  // 简单渲染，实际可用更复杂的富文本
  return text.split('\n').map((line, i) => {
    // 高亮🎯标记
    if (line.includes('🎯')) {
      return (
        <div key={i} className="my-2 p-2 bg-yellow-100 rounded border-l-4 border-yellow-400">
          {line.replace(/🎯/g, '')}
        </div>
      )
    }
    // 高亮数字列表
    if (/^[\d一二三四五六七八九十]+[.、\s]/.test(line)) {
      return <div key={i} className="font-medium text-gray-900 mt-2">{line}</div>
    }
    return <div key={i} className="py-0.5">{line}</div>
  })
}

function estimateDuration(wordCount: number): number {
  // 中文大约每分钟160-180字
  const minutes = wordCount / 170
  return Math.max(1, Math.round(minutes))
}
