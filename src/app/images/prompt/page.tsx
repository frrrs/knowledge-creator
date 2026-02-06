'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ImageIcon, 
  Copy, 
  Check,
  Palette,
  Layout,
  Type,
  Lightbulb,
  Wand2,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react'

const STYLES = [
  { id: 'modern', name: '现代插画', desc: '扁平化设计，适合知识类', icon: '🎨' },
  { id: '3d', name: '3D渲染', desc: 'C4D质感，专业高端', icon: '🎲' },
  { id: 'photo', name: '摄影风格', desc: '真实照片感，亲近自然', icon: '📷' },
  { id: 'handdrawn', name: '手绘风格', desc: '温暖手绘，亲切有趣', icon: '✏️' },
  { id: 'minimal', name: '极简风格', desc: '大量留白，高级感', icon: '◻️' },
  { id: 'infographic', name: '信息图表', desc: '数据可视化，信息密集', icon: '📊' }
]

const PLATFORMS = [
  { id: 'xiaohongshu', name: '小红书', ratio: '3:4', size: '1242×1660' },
  { id: 'douyin', name: '抖音', ratio: '9:16', size: '1080×1920' },
  { id: 'bilibili', name: 'B站', ratio: '16:9', size: '1920×1080' },
  { id: 'wechat', name: '公众号', ratio: '2.35:1', size: '900×383' },
  { id: 'zhihu', name: '知乎', ratio: '16:9', size: '1920×1080' }
]

interface ImagePrompt {
  scene: string
  prompt: string
  negativePrompt: string
  aspectRatio: string
  style: string
  usage: string
}

interface CoverSuggestion {
  title: string
  subtitle: string
  colorScheme: string
  fontStyle: string
  layout: string
}

export default function ImagePromptPage() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [script, setScript] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [selectedPlatform, setSelectedPlatform] = useState('xiaohongshu')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    prompts: ImagePrompt[]
    coverSuggestion: CoverSuggestion
  } | null>(null)
  const [copied, setCopied] = useState<number | null>(null)
  
  const handleGenerate = async () => {
    if (!topic && !script) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/images/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          script,
          style: STYLES.find(s => s.id === selectedStyle)?.name,
          platform: selectedPlatform
        })
      })
      
      if (!res.ok) throw new Error('生成失败')
      
      const data = await res.json()
      setResult({
        prompts: data.data.prompts,
        coverSuggestion: data.data.coverSuggestion
      })
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
  
  const handleCopyAll = () => {
    if (!result) return
    const allPrompts = result.prompts.map((p, i) => 
      `[${p.scene}]\n${p.prompt}\n\n负面提示词：${p.negativePrompt}`
    ).join('\n\n---\n\n')
    navigator.clipboard.writeText(allPrompts)
    alert('已复制所有提示词！')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.push('/features')}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              AI配图提示词
            </h1>
            <p className="text-sm text-white/80">为内容生成专业AI绘图提示词</p>
          </div>
        </div>
      </header>
      
      <main className="p-4">
        {/* Input Section */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">1. 内容信息</h2>
          
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="输入主题，如：时间管理技巧"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:border-indigo-500 focus:outline-none text-gray-900"
          />
          
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="粘贴脚本内容（可选，帮助生成更精准的配图提示词）..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:border-indigo-500 focus:outline-none text-gray-900"
            rows={4}
          />
        </div>
        
        {/* Style Selection */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            2. 选择风格
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedStyle === style.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-2xl mb-1">{style.icon}</div>
                <h3 className="font-medium text-gray-900 text-sm">{style.name}</h3>
                <p className="text-xs text-gray-500">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Platform Selection */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Layout className="w-5 h-5 text-blue-500" />
            3. 目标平台
          </h2>
          
          <div className="space-y-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition ${
                  selectedPlatform === platform.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    selectedPlatform === platform.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {platform.ratio}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{platform.name}</h3>
                    <p className="text-xs text-gray-500">推荐尺寸 {platform.size}</p>
                  </div>
                </div>
                {selectedPlatform === platform.id && (
                  <Check className="w-5 h-5 text-indigo-500" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={(!topic && !script) || loading}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI生成提示词...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              生成配图提示词
            </>
          )}
        </button>
        
        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                生成的提示词
              </h2>
              <button
                onClick={handleCopyAll}
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                复制全部
              </button>
            </div>
            
            {/* Cover Suggestion */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Type className="w-5 h-5" />
                封面文字建议
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-amber-800">
                  <span className="font-medium">{result.coverSuggestion.title}</span>
                </p>
                <p className="text-amber-700">{result.coverSuggestion.subtitle}</p>
                <p className="text-amber-600">{result.coverSuggestion.colorScheme}</p>
                <p className="text-amber-600">{result.coverSuggestion.fontStyle}</p>
                <p className="text-amber-600">{result.coverSuggestion.layout}</p>
              </div>
            </div>
            
            {/* Prompts */}
            {result.prompts.map((prompt, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                      {prompt.scene}
                    </span>
                    <span className="text-xs text-gray-500">{prompt.aspectRatio}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(index, prompt.prompt)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                  >
                    {copied === index ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-2">用途：{prompt.usage}</p>
                  <p className="text-sm text-gray-800 leading-relaxed mb-3 bg-gray-50 p-3 rounded-lg">
                    {prompt.prompt}
                  </p>
                  <div className="text-xs text-gray-400">
                    <span className="font-medium">负面提示词：</span>
                    {prompt.negativePrompt}
                  </div>
                </div>
              </div>
            ))}
            
            {/* How to Use */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">如何使用这些提示词？</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li>1. 复制上方的提示词</li>
                <li>2. 打开 AI 绘图工具（如 Midjourney / Stable Diffusion / 即梦）</li>
                <li>3. 粘贴提示词，调整参数生成图片</li>
                <li>4. 根据生成的图片微调提示词</li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
