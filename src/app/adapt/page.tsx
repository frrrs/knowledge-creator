'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Smartphone,
  Monitor,
  Tablet,
  MessageCircle,
  BookOpen,
  Video,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'

const PLATFORMS = [
  {
    id: 'douyin',
    name: '抖音',
    icon: Video,
    color: 'bg-black',
    desc: '短视频口播风格',
    maxLength: 500,
    features: ['前3秒钩子', '口语化', '引导互动']
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: BookOpen,
    color: 'bg-red-500',
    desc: '种草笔记风格',
    maxLength: 1000,
    features: ['emoji丰富', '分段清晰', '真实分享']
  },
  {
    id: 'bilibili',
    name: 'B站',
    icon: Monitor,
    color: 'bg-pink-400',
    desc: '中长视频风格',
    maxLength: 2000,
    features: ['内容深入', '系列化', '弹幕互动']
  },
  {
    id: 'wechat',
    name: '公众号',
    icon: MessageCircle,
    color: 'bg-green-500',
    desc: '深度长文风格',
    maxLength: 10000,
    features: ['结构完整', 'SEO优化', '深度内容']
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: PenTool,
    color: 'bg-blue-500',
    desc: '问答专业风格',
    maxLength: 5000,
    features: ['逻辑清晰', '数据支撑', '专业分析']
  }
]

export default function AdaptPage() {
  const router = useRouter()
  const [script, setScript] = useState('')
  const [topic, setTopic] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [adaptedScripts, setAdaptedScripts] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }
  
  const handleAdapt = async () => {
    if (!script || selectedPlatforms.length === 0) return
    
    setLoading(true)
    setAdaptedScripts({})
    
    for (const platformId of selectedPlatforms) {
      try {
        const res = await fetch('/api/scripts/adapt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script, platform: platformId, topic })
        })
        
        if (res.ok) {
          const data = await res.json()
          setAdaptedScripts(prev => ({
            ...prev,
            [platformId]: data.data
          }))
        }
      } catch (err) {
        console.error('Adapt error:', err)
      }
    }
    
    setLoading(false)
  }
  
  const handleCopy = (platformId: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(platformId)
    setTimeout(() => setCopied(null), 2000)
  }
  
  const selectAll = () => {
    setSelectedPlatforms(PLATFORMS.map(p => p.id))
  }
  
  const clearAll = () => {
    setSelectedPlatforms([])
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
          <h1 className="text-xl font-bold">多平台适配</h1>
        </div>
      </header>
      
      <main className="p-4">
        {/* Input Section */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">1. 输入原脚本</h2>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入主题（可选）"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:border-blue-500 focus:outline-none text-gray-900"
          />
          
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="粘贴你的脚本内容..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:outline-none text-gray-900"
            rows={6}
          />
          <p className="text-xs text-gray-400 mt-2">
            已输入 {script.length} 字符
          </p>
        </div>
        
        {/* Platform Selection */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">2. 选择目标平台</h2>
            <div className="flex gap-2">
              <button 
                onClick={selectAll}
                className="text-xs text-blue-600 hover:underline"
              >
                全选
              </button>
              <button 
                onClick={clearAll}
                className="text-xs text-gray-500 hover:underline"
              >
                清空
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map(platform => {
              const Icon = platform.icon
              const isSelected = selectedPlatforms.includes(platform.id)
              
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{platform.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{platform.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">限{platform.maxLength}字</p>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Adapt Button */}
        <button
          onClick={handleAdapt}
          disabled={!script || selectedPlatforms.length === 0 || loading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 hover:bg-blue-700 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              正在适配...
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              一键适配 {selectedPlatforms.length} 个平台
            </>
          )}
        </button>
        
        {/* Results */}
        {Object.keys(adaptedScripts).length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="font-semibold text-gray-900">3. 适配结果</h2>
            
            {Object.entries(adaptedScripts).map(([platformId, data]) => {
              const platform = PLATFORMS.find(p => p.id === platformId)
              if (!platform) return null
              
              const Icon = platform.icon
              const isOverLimit = !data.fitsLimit
              
              return (
                <div key={platformId} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className={`px-4 py-3 flex items-center justify-between ${platform.color}`}>
                    <div className="flex items-center gap-2 text-white">
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{data.platform}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(platformId, data.adapted)}
                      className="px-3 py-1 bg-white/20 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-white/30 transition"
                    >
                      {copied === platformId ? (
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
                  
                  {/* Content */}
                  <div className="p-4">
                    {/* Length Warning */}
                    {isOverLimit && (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs text-yellow-700">
                          内容超限：{data.characterCount}/{data.maxLength} 字符
                        </span>
                      </div>
                    )}
                    
                    {/* Adapted Script */}
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 p-3 rounded-lg">
                      {data.adapted}
                    </pre>
                    
                    {/* Platform Tips */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">💡 平台技巧：</p>
                      <ul className="space-y-1">
                        {data.tips.slice(0, 3).map((tip: string, i: number) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="text-blue-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
