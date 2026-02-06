'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, TrendingUp, Clock } from 'lucide-react'

const TOPIC_SUGGESTIONS = [
  {
    id: '1',
    title: 'AI 工具如何提升写作效率',
    category: '科技',
    trend: 'hot',
    difficulty: 'easy',
    estimatedViews: '10k+'
  },
  {
    id: '2',
    title: '2024年创业避坑指南',
    category: '商业',
    trend: 'rising',
    difficulty: 'medium',
    estimatedViews: '5k+'
  },
  {
    id: '3',
    title: '认知心理学在日常决策中的应用',
    category: '心理',
    trend: 'stable',
    difficulty: 'hard',
    estimatedViews: '3k+'
  },
  {
    id: '4',
    title: '新手必读：内容创作入门',
    category: '教育',
    trend: 'hot',
    difficulty: 'easy',
    estimatedViews: '8k+'
  },
  {
    id: '5',
    title: '数字经济下的新商业模式',
    category: '商业',
    trend: 'rising',
    difficulty: 'medium',
    estimatedViews: '6k+'
  }
]

export default function TopicsPage() {
  const router = useRouter()
  
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
          <h1 className="text-xl font-bold">选题推荐</h1>
        </div>
      </header>
      
      <main className="p-4">
        {/* AI Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI 智能推荐</span>
          </div>
          <p className="text-sm text-white/80">
            基于你的擅长领域和当前热点，为你推荐最适合的选题
          </p>
        </div>
        
        {/* Topic List */}
        <div className="space-y-3">
          {TOPIC_SUGGESTIONS.map((topic) => (
            <div 
              key={topic.id}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-300 transition cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      {topic.category}
                    </span>
                    {topic.trend === 'hot' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs">
                        <TrendingUp className="w-3 h-3" />
                        热门
                      </span>
                    )}
                    {topic.trend === 'rising' && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                        上升期
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      预计 {topic.difficulty === 'easy' ? '15' : topic.difficulty === 'medium' ? '25' : '40'} 分钟
                    </span>
                    <span>预计阅读 {topic.estimatedViews}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Load More */}
        <button className="w-full py-3 mt-4 text-gray-500 text-sm hover:text-gray-700 transition">
          加载更多选题...
        </button>
      </main>
    </div>
  )
}
