'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

// 模拟历史数据
const MOCK_HISTORY = [
  {
    id: '1',
    title: 'AI 在医疗领域的应用',
    domain: '科技',
    status: 'completed',
    completedAt: '2026-02-05',
    duration: 15
  },
  {
    id: '2',
    title: '创业者的心理健康',
    domain: '商业',
    status: 'skipped',
    completedAt: null,
    duration: 0
  },
  {
    id: '3',
    title: '认知偏差与决策',
    domain: '心理',
    status: 'completed',
    completedAt: '2026-02-03',
    duration: 20
  }
]

/**
 * 历史记录页面
 * 展示用户已完成的创作任务历史
 */
export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState(MOCK_HISTORY)
  const [filter, setFilter] = useState<'all' | 'completed' | 'skipped'>('all')
  
  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })
  
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
          <h1 className="text-xl font-bold">创作历史</h1>
        </div>
        
        {/* Filter Tabs */}
        <div className="px-4 pb-3 flex gap-2">
          {(['all', 'completed', 'skipped'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === f 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'completed' ? '已完成' : '已跳过'}
            </button>
          ))}
        </div>
      </header>
      
      {/* History List */}
      <main className="p-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-lg font-semibold text-gray-800">暂无记录</h2>
            <p className="text-gray-500 mt-1">开始创作你的第一个内容吧</p>
            <Link 
              href="/dashboard"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
            >
              去创作
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                        {item.domain}
                      </span>
                      {item.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          已完成
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <XCircle className="w-3 h-3" />
                          已跳过
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {item.completedAt && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                        <Clock className="w-4 h-4" />
                        <span>{item.completedAt}</span>
                        {item.duration > 0 && (
                          <span>· {item.duration}分钟</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
