'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Loading } from '@/components/ui/Loading'

interface HotTopic {
  id: string
  title: string
  platform: string
  heat: number
  trend: 'up' | 'down' | 'stable'
  category?: string
  relevanceScore: number
}

export default function HotTopicsPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<HotTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [domains, setDomains] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState<HotTopic | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<any>(null)
  
  useEffect(() => {
    // 获取用户领域
    const savedDomains = localStorage.getItem('domains')
    if (savedDomains) {
      setDomains(JSON.parse(savedDomains))
    }
  }, [])
  
  useEffect(() => {
    if (domains.length > 0) {
      fetchHotTopics()
    }
  }, [domains])
  
  const fetchHotTopics = async () => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`/api/hot-topics?domains=${domains.join(',')}`)
      if (!res.ok) throw new Error('获取热点失败')
      
      const data = await res.json()
      setTopics(data.data.topics)
    } catch (err) {
      setError('加载热点失败，请重试')
    } finally {
      setLoading(false)
    }
  }
  
  const handleGenerateTopic = async (topic: HotTopic) => {
    setSelectedTopic(topic)
    setGenerating(true)
    setGeneratedResult(null)
    
    try {
      const res = await fetch('/api/hot-topics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotTopicId: topic.id,
          domain: topic.category || domains[0] || '通用'
        })
      })
      
      if (!res.ok) throw new Error('生成失败')
      
      const data = await res.json()
      setGeneratedResult(data.data)
    } catch (err) {
      setError('生成选题失败')
    } finally {
      setGenerating(false)
    }
  }
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }
  
  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'weibo': '🔴',
      'zhihu': '🔵',
      'douyin': '⚫'
    }
    return icons[platform] || '📱'
  }
  
  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      'weibo': '微博',
      'zhihu': '知乎',
      'douyin': '抖音'
    }
    return names[platform] || platform
  }
  
  if (loading) {
    return <Loading text="正在追踪热点..." fullscreen />
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.push('/features')}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6" />
              热点追踪
            </h1>
            <p className="text-sm text-white/80">AI智能匹配你的领域</p>
          </div>
          <button 
            onClick={fetchHotTopics}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        {/* Domain Tags */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {domains.map(domain => (
              <span 
                key={domain}
                className="px-3 py-1 bg-white/20 rounded-full text-sm"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      </header>
      
      <main className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Hot Topics List */}
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div 
              key={topic.id}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:border-orange-300 transition"
            >
              {/* Rank & Platform */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-lg">{getPlatformIcon(topic.platform)}</span>
                  <span className="text-xs text-gray-500">{getPlatformName(topic.platform)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(topic.trend)}
                  <span className="text-xs text-gray-500">热度 {topic.heat}</span>
                </div>
              </div>
              
              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-3">{topic.title}</h3>
              
              {/* Score & Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    匹配度 
                    <span className={`font-bold ${
                      topic.relevanceScore >= 80 ? 'text-green-600' : 
                      topic.relevanceScore >= 60 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {topic.relevanceScore}%
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => handleGenerateTopic(topic)}
                  disabled={generating && selectedTopic?.id === topic.id}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-1"
                >
                  {generating && selectedTopic?.id === topic.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  生成选题
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Generated Result */}
        {generatedResult && (
          <div className="mt-6 bg-white rounded-xl p-5 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">AI生成的选题</h3>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-500 mb-1">基于热点：</p>
              <p className="font-medium text-gray-900">{generatedResult.originalTopic.title}</p>
            </div>
            
            <h4 className="font-bold text-lg text-gray-900 mb-2">
              {generatedResult.generatedTopic.title}
            </h4>
            
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">切入角度：</span>
              {generatedResult.generatedTopic.angle}
            </p>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">建议大纲：</p>
              <ol className="space-y-1">
                {generatedResult.generatedTopic.outline.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // 保存到本地存储，跳转到dashboard
                  localStorage.setItem('hotTopicGenerated', JSON.stringify(generatedResult))
                  router.push('/dashboard')
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                使用此选题创作
              </button>
              <button
                onClick={() => setGeneratedResult(null)}
                className="px-4 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                关闭
              </button>
            </div>
          </div>
        )}
        
        {topics.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无匹配热点</h3>
            <p className="text-gray-500">当前热点与您的领域匹配度较低</p>
          </div>
        )}
      </main>
    </div>
  )
}
