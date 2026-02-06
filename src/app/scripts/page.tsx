'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Copy, Check, Sparkles, Loader2 } from 'lucide-react'

const SCRIPT_TEMPLATES = [
  {
    id: 'tutorial',
    name: '教程类',
    description: '步骤清晰的教学内容',
    structure: ['引入问题', '解决方案', '详细步骤', '总结']
  },
  {
    id: 'story',
    name: '故事类',
    description: '引人入胜的叙事内容',
    structure: ['开场钩子', '背景介绍', '情节发展', '高潮', '结尾']
  },
  {
    id: 'review',
    name: '评测类',
    description: '客观详细的产品/服务评测',
    structure: ['产品概述', '优点', '缺点', '使用体验', '总结建议']
  },
  {
    id: 'opinion',
    name: '观点类',
    description: '表达独特见解的内容',
    structure: ['观点陈述', '论据支持', '反驳其他观点', '总结']
  }
]

export default function ScriptsPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [generatedScript, setGeneratedScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  
  const handleGenerate = async () => {
    if (!topic || !selectedTemplate) return
    
    setLoading(true)
    setError('')
    
    try {
      const template = SCRIPT_TEMPLATES.find(t => t.id === selectedTemplate)
      
      const res = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          templateType: selectedTemplate,
          templateName: template?.name,
          structure: template?.structure
        })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '生成失败')
      }
      
      const data = await res.json()
      setGeneratedScript(data.data.script)
      
    } catch (err: any) {
      setError(err.message || 'AI生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const getTemplateIcon = (id: string) => {
    const icons: Record<string, string> = {
      tutorial: '📚',
      story: '📖',
      review: '⭐',
      opinion: '💡'
    }
    return icons[id] || '📝'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.push('/features')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">脚本助手</h1>
        </div>
      </header>
      
      <main className="p-4">
        {/* Template Selection */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">选择脚本类型</h2>
          <div className="grid grid-cols-2 gap-3">
            {SCRIPT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-xl border text-left transition ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-2">{getTemplateIcon(template.id)}</div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Topic Input */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">输入主题</h2>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：如何提高写作效率..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:outline-none text-gray-900"
            rows={3}
          />
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!topic || !selectedTemplate || loading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 hover:bg-blue-700 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              AI生成脚本
            </>
          )}
        </button>
        
        {/* Generated Script */}
        {generatedScript && (
          <div className="mt-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-500">AI生成的脚本</h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </button>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {generatedScript}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
