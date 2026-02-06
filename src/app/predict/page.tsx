'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Clock, 
  Users, 
  Share2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  Lightbulb,
  Zap,
  BarChart3
} from 'lucide-react'

const PLATFORMS = [
  { id: 'douyin', name: '抖音', icon: '🎵' },
  { id: 'xiaohongshu', name: '小红书', icon: '📕' },
  { id: 'bilibili', name: 'B站', icon: '📺' },
  { id: 'wechat', name: '公众号', icon: '💬' },
  { id: 'zhihu', name: '知乎', icon: '📚' }
]

interface PredictionResult {
  scores: {
    overall: number
    attractiveness: number
    readability: number
    shareability: number
    completeness: number
    timing: number
  }
  prediction: {
    estimatedViews: { min: number; max: number; unit: string }
    estimatedLikes: { min: number; max: number; unit: string }
    estimatedShares: { min: number; max: number; unit: string }
    confidence: number
    potential: 'low' | 'medium' | 'high' | 'viral'
  }
  suggestions: Array<{
    type: 'title' | 'content' | 'timing' | 'general'
    priority: 'high' | 'medium' | 'low'
    message: string
    action: string
  }>
  analysis: {
    titleAnalysis: {
      length: number
      hasNumber: boolean
      hasQuestion: boolean
      hasEmotion: boolean
    }
    contentAnalysis: {
      wordCount: number
      hasStructure: boolean
      hasList: boolean
      hasCTA: boolean
    }
    timingAnalysis: {
      currentHour: number
      isBestTime: boolean
      suggestion: string
    }
  }
}

export default function PredictPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('douyin')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  
  const handlePredict = async () => {
    if (!title && !content) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const userId = localStorage.getItem('userId')
      
      const res = await fetch('/api/predict/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          platform: selectedPlatform,
          userId
        })
      })
      
      if (!res.ok) throw new Error('预测失败')
      
      const data = await res.json()
      setResult(data.data)
    } catch (err) {
      console.error('Predict error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const getPotentialLabel = (potential: string) => {
    const labels: Record<string, { text: string; color: string; icon: string }> = {
      viral: { text: '爆款潜力', color: 'text-red-600 bg-red-50', icon: '🔥' },
      high: { text: '高潜力', color: 'text-orange-600 bg-orange-50', icon: '⭐' },
      medium: { text: '中等潜力', color: 'text-blue-600 bg-blue-50', icon: '💡' },
      low: { text: '待优化', color: 'text-gray-600 bg-gray-50', icon: '📝' }
    }
    return labels[potential] || labels.low
  }
  
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'border-red-200 bg-red-50',
      medium: 'border-yellow-200 bg-yellow-50',
      low: 'border-blue-200 bg-blue-50'
    }
    return colors[priority] || colors.low
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
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
              效果预测
            </h1>
            <p className="text-sm text-white/80">AI预测内容表现，提供优化建议</p>
          </div>
        </div>
      </header>
      
      <main className="p-4">
        {/* Input Section */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">1. 内容信息</h2>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入标题..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:border-violet-500 focus:outline-none text-gray-900"
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="粘贴内容..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:border-violet-500 focus:outline-none text-gray-900"
            rows={5}
          />
        </div>
        
        {/* Platform Selection */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">2. 发布平台</h2>
          
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  selectedPlatform === platform.id
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300'
                }`}
              >
                <span className="mr-1">{platform.icon}</span>
                {platform.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Predict Button */}
        <button
          onClick={handlePredict}
          disabled={(!title && !content) || loading}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI分析中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              预测内容表现
            </>
          )}
        </button>
        
        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Overall Score */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">综合评分</p>
                  <p className={`text-4xl font-bold ${getScoreColor(result.scores.overall)}`}>
                    {result.scores.overall}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full ${getPotentialLabel(result.prediction.potential).color}`}>
                  <span className="text-lg mr-1">{getPotentialLabel(result.prediction.potential).icon}</span>
                  <span className="font-medium">{getPotentialLabel(result.prediction.potential).text}</span>
                </div>
              </div>
              
              {/* Score Bar */}
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getScoreBg(result.scores.overall)} transition-all duration-500`}
                  style={{ width: `${result.scores.overall}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                置信度 {result.prediction.confidence}%
              </p>
            </div>
            
            {/* Dimension Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">吸引力</p>
                <p className={`text-xl font-bold ${getScoreColor(result.scores.attractiveness)}`}>
                  {result.scores.attractiveness}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">可读性</p>
                <p className={`text-xl font-bold ${getScoreColor(result.scores.readability)}`}>
                  {result.scores.readability}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">传播性</p>
                <p className={`text-xl font-bold ${getScoreColor(result.scores.shareability)}`}>
                  {result.scores.shareability}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">完整性</p>
                <p className={`text-xl font-bold ${getScoreColor(result.scores.completeness)}`}>
                  {result.scores.completeness}
                </p>
              </div>
            </div>
            
            {/* Prediction */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200">
              <h3 className="font-semibold text-violet-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                预估表现
              </h3>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-violet-700">
                    {result.prediction.estimatedViews.min}-{result.prediction.estimatedViews.max}
                    {result.prediction.estimatedViews.unit}
                  </p>
                  <p className="text-xs text-violet-600 flex items-center justify-center gap-1 mt-1">
                    <Users className="w-3 h-3" />
                    预估阅读
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-700">
                    {result.prediction.estimatedLikes.min}-{result.prediction.estimatedLikes.max}
                    {result.prediction.estimatedLikes.unit}
                  </p>
                  <p className="text-xs text-violet-600 flex items-center justify-center gap-1 mt-1">
                    <Zap className="w-3 h-3" />
                    预估点赞
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-700">
                    {result.prediction.estimatedShares.min}-{result.prediction.estimatedShares.max}
                    {result.prediction.estimatedShares.unit}
                  </p>
                  <p className="text-xs text-violet-600 flex items-center justify-center gap-1 mt-1">
                    <Share2 className="w-3 h-3" />
                    预估分享
                  </p>
                </div>
              </div>
            </div>
            
            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    优化建议
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {result.suggestions.map((suggestion, index) => (
                    <div key={index} className={`p-4 ${getPriorityColor(suggestion.priority)}`}>
                      <div className="flex items-start gap-3">
                        {suggestion.priority === 'high' ? (
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : suggestion.priority === 'medium' ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{suggestion.message}</p>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Timing Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">发布时机</h3>
              </div>
              <p className={`text-sm ${result.analysis.timingAnalysis.isBestTime ? 'text-green-600' : 'text-gray-600'}`}>
                {result.analysis.timingAnalysis.isBestTime ? '✅ ' : '⏰ '}
                {result.analysis.timingAnalysis.suggestion}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
