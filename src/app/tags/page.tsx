'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Tag, 
  Copy, 
  Check,
  Search,
  Hash,
  Target,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react'

const PLATFORMS = [
  { id: 'all', name: '全部平台', icon: '🌐' },
  { id: 'douyin', name: '抖音', icon: '🎵' },
  { id: 'xiaohongshu', name: '小红书', icon: '📕' },
  { id: 'bilibili', name: 'B站', icon: '📺' },
  { id: 'wechat', name: '公众号', icon: '💬' },
  { id: 'zhihu', name: '知乎', icon: '📚' }
]

interface TagResult {
  seo: string[]
  topics: string[]
  entities: string[]
  hashtags: Record<string, string[]>
  recommendations: {
    title: string
    description: string
    keywords: string
  }
}

export default function TagsPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [topic, setTopic] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TagResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  
  const handleExtract = async () => {
    if (!content && !topic) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/tags/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          topic,
          platform: selectedPlatform === 'all' ? undefined : selectedPlatform
        })
      })
      
      if (!res.ok) throw new Error('提取失败')
      
      const data = await res.json()
      setResult(data.data)
      
      // 默认选中所有标签
      const allTags = [
        ...data.data.seo,
        ...data.data.topics,
        ...data.data.entities
      ]
      setSelectedTags(new Set(allTags))
      
    } catch (err) {
      console.error('Extract error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tag)) {
        newSet.delete(tag)
      } else {
        newSet.add(tag)
      }
      return newSet
    })
  }
  
  const copyAllSelected = () => {
    const tags = Array.from(selectedTags).join(' ')
    navigator.clipboard.writeText(tags)
    alert(`已复制 ${selectedTags.size} 个标签！`)
  }
  
  const getPlatformHashtags = () => {
    if (!result) return []
    if (selectedPlatform === 'all') {
      // 合并所有平台的hashtag
      const allHashtags = new Set<string>()
      Object.values(result.hashtags).forEach(tags => {
        tags.forEach(tag => allHashtags.add(tag))
      })
      return Array.from(allHashtags)
    }
    return result.hashtags[selectedPlatform] || []
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.push('/features')}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Tag className="w-6 h-6" />
              智能标签提取
            </h1>
            <p className="text-sm text-white/80">AI自动提取SEO关键词和话题标签</p>
          </div>
        </div>
      </header>
      
      <main className="p-4">
        {/* Input Section */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-500" />
            1. 输入内容
          </h2>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入主题（可选）"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:border-teal-500 focus:outline-none text-gray-900"
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="粘贴你的内容..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:border-teal-500 focus:outline-none text-gray-900"
            rows={5}
          />
        </div>
        
        {/* Platform Selection */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">2. 目标平台</h2>
          
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  selectedPlatform === platform.id
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                }`}
              >
                <span className="mr-1">{platform.icon}</span>
                {platform.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Extract Button */}
        <button
          onClick={handleExtract}
          disabled={(!content && !topic) || loading}
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI分析中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              提取标签
            </>
          )}
        </button>
        
        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Selected Count */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                提取结果
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  已选 {selectedTags.size} 个
                </span>
                <button
                  onClick={copyAllSelected}
                  className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium"
                >
                  复制选中
                </button>
              </div>
            </div>
            
            {/* SEO Keywords */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">SEO关键词</h3>
                <span className="text-xs text-gray-400">用于搜索引擎优化</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.seo.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      selectedTags.has(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Topic Tags */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-5 h-5 text-pink-500" />
                <h3 className="font-semibold text-gray-900">话题标签</h3>
                <span className="text-xs text-gray-400">用于社交媒体话题</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.topics.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      selectedTags.has(tag)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Entities */}
            {result.entities.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">关键实体</h3>
                  <span className="text-xs text-gray-400">人名、品牌、产品等</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.entities.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm transition ${
                        selectedTags.has(tag)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Platform Hashtags */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  {selectedPlatform === 'all' ? '全平台Hashtag' : PLATFORMS.find(p => p.id === selectedPlatform)?.name + ' Hashtag'}
                </h3>
                <button
                  onClick={() => handleCopy(getPlatformHashtags().join(' '), 'hashtags')}
                  className="text-sm text-teal-600 flex items-center gap-1"
                >
                  {copied === 'hashtags' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  复制
                </button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {getPlatformHashtags().join(' ')}
                </p>
              </div>
            </div>
            
            {/* SEO Recommendations */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-200">
              <h3 className="font-semibold text-teal-900 mb-3">SEO优化建议</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-teal-600 mb-1">推荐标题：</p>
                  <p className="text-sm text-teal-800 font-medium">
                    {result.recommendations.title}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-teal-600 mb-1">推荐描述：</p>
                  <p className="text-sm text-teal-800">
                    {result.recommendations.description}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-teal-600 mb-1">关键词：</p>
                  <p className="text-sm text-teal-800">
                    {result.recommendations.keywords}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
