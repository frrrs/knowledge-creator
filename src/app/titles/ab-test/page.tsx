'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check,
  TrendingUp,
  Lightbulb,
  Target,
  MessageCircle,
  Hash,
  AlertCircle,
  Loader2,
  BarChart3
} from 'lucide-react'
import { Loading } from '@/components/ui/Loading'

interface TitleVariant {
  text: string
  style: string
  technique: string
  reason: string
  predictedScore: number
}

const PLATFORMS = [
  { id: 'douyin', name: '抖音', icon: '🎵' },
  { id: 'xiaohongshu', name: '小红书', icon: '📕' },
  { id: 'bilibili', name: 'B站', icon: '📺' },
  { id: 'wechat', name: '公众号', icon: '💬' },
  { id: 'zhihu', name: '知乎', icon: '📚' }
]

export default function ABTestPage() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [titles, setTitles] = useState<TitleVariant[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [selectedTitles, setSelectedTitles] = useState<Set<number>>(new Set())
  
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }
  
  const handleGenerate = async () => {
    if (!topic) return
    
    setLoading(true)
    setTitles([])
    
    try {
      const res = await fetch('/api/titles/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          content,
          targetPlatform: selectedPlatforms.length > 0 ? selectedPlatforms : undefined
        })
      })
      
      if (!res.ok) throw new Error('生成失败')
      
      const data = await res.json()
      setTitles(data.data.titles)
      
      // 默认选中前3个
      setSelectedTitles(new Set([0, 1, 2]))
      
    } catch (err) {
      console.error('Generate error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }
  
  const toggleSelection = (index: number) => {
    setSelectedTitles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-blue-600 bg-blue-50'
    return 'text-yellow-600 bg-yellow-50'
  }
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return '优秀'
    if (score >= 60) return '良好'
    return '一般'
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.push('/features')}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              标题A/B测试
            </h1>
            <p className="text-sm text-white/80">AI生成多版本标题，选择最优方案</p>
          </div>
        </div>
      </header>
      
      <main className="p-4">
        {/* Input Section */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            1. 输入主题
          </h2>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入文章/视频主题，如：时间管理技巧"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:border-purple-500 focus:outline-none text-gray-900"
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="补充内容摘要（可选，帮助AI生成更精准的标题）..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:border-purple-500 focus:outline-none text-gray-900"
            rows={3}
          />
        </div>
        
        {/* Platform Selection */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            2. 目标平台（可选）
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  selectedPlatforms.includes(platform.id)
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                }`}
              >
                <span className="mr-1">{platform.icon}</span>
                {platform.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!topic || loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI生成标题中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              生成A/B测试标题
            </>
          )}
        </button>
        
        {/* Results */}
        {titles.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                生成的标题方案
              </h2>
              <span className="text-sm text-gray-500">
                已选 {selectedTitles.size} 个
              </span>
            </div>
            
            {/* Stats */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{titles.length}</p>
                  <p className="text-xs text-gray-500">总方案数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(titles.reduce((sum, t) => sum + t.predictedScore, 0) / titles.length)}
                  </p>
                  <p className="text-xs text-gray-500">平均分</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {titles.filter(t => t.predictedScore >= 80).length}
                  </p>
                  <p className="text-xs text-gray-500">优秀方案</p>
                </div>
              </div>
            </div>
            
            {/* Title List */}
            <div className="space-y-3">
              {titles.map((title, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-xl border-2 p-4 transition ${
                    selectedTitles.has(index) 
                      ? 'border-purple-500 shadow-md' 
                      : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(title.predictedScore)}`}>
                        {title.predictedScore}分
                      </span>
                      <span className="text-xs text-gray-500">{title.style}</span>
                      {index < 3 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-xs">
                          TOP{index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(index, title.text)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        {copied === index ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleSelection(index)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          selectedTitles.has(index)
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {selectedTitles.has(index) ? '已选' : '选择'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Title Text */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-relaxed">
                    {title.text}
                  </h3>
                  
                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">
                        <span className="font-medium">技巧：</span>{title.technique}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">
                        <span className="font-medium">原理：</span>{title.reason}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Export Selected */}
            {selectedTitles.size > 0 && (
              <div className="mt-6 bg-white rounded-xl p-5 border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-3">已选中的标题</h3>
                <div className="space-y-2 mb-4">
                  {Array.from(selectedTitles).map(index => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg text-sm">
                      {titles[index].text}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const selected = Array.from(selectedTitles).map(i => titles[i].text).join('\n\n')
                    navigator.clipboard.writeText(selected)
                    alert('已复制到剪贴板！')
                  }}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
                >
                  一键复制选中标题
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
