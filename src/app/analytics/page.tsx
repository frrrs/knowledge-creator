'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, FileText, Clock, Target, Star, Loader2 } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'

interface AnalyticsData {
  totalTasks: number
  completedTasks: number
  skippedTasks: number
  pendingTasks: number
  totalTime: number
  streakDays: number
  completionRate: number
  dailyStats: Array<{
    date: string
    dayName: string
    completed: number
    total: number
  }>
  ratings: {
    count: number
    average: number
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        router.push('/login')
        return
      }
      
      try {
        const res = await fetch(`/api/analytics?userId=${userId}`)
        if (!res.ok) {
          throw new Error('获取数据失败')
        }
        
        const result = await res.json()
        setData(result.data)
      } catch (err) {
        setError('加载数据失败，请重试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalytics()
  }, [router])
  
  if (loading) {
    return <Loading text="加载数据中..." fullscreen />
  }
  
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{error || '暂无数据'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            刷新重试
          </button>
        </div>
      </div>
    )
  }
  
  const maxDailyCompleted = Math.max(...data.dailyStats.map(d => d.completed), 1)
  
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
          <h1 className="text-xl font-bold">数据分析</h1>
        </div>
      </header>
      
      <main className="p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500">完成任务</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.completedTasks}</p>
            <p className="text-xs text-gray-400 mt-1">总任务 {data.totalTasks}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">创作时长</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{Math.floor(data.totalTime / 60)}h</p>
            <p className="text-xs text-gray-400 mt-1">{data.totalTime} 分钟</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500">连续打卡</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.streakDays}</p>
            <p className="text-xs text-gray-400 mt-1">天</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-500">完成率</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.completionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">{data.completedTasks}/{data.totalTasks}</p>
          </div>
        </div>
        
        {/* Rating Stats */}
        {data.ratings.count > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-500">平均评分</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{data.ratings.average.toFixed(1)}</p>
                <p className="text-xs text-gray-400">{data.ratings.count} 个评价</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Weekly Chart */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">近7天创作趋势</h3>
          <div className="h-40 flex items-end justify-around px-2">
            {data.dailyStats.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="relative w-full flex justify-center">
                  {/* Completed bar */}
                  <div 
                    className="w-6 bg-blue-500 rounded-t transition-all"
                    style={{ 
                      height: `${(day.completed / maxDailyCompleted) * 100}px`,
                      minHeight: day.completed > 0 ? '4px' : '0'
                    }}
                  />
                  {/* Total indicator */}
                  {day.total > day.completed && (
                    <div 
                      className="absolute bottom-0 w-6 bg-gray-200 rounded-t -z-10"
                      style={{ 
                        height: `${(day.total / maxDailyCompleted) * 100}px`,
                        minHeight: '4px'
                      }}
                    />
                  )}
                </div>
                <span className="text-xs text-gray-400">{day.dayName}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded"></span>
              已完成
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-200 rounded"></span>
              总任务
            </span>
          </div>
        </div>
        
        {/* Pro Feature */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
          <h3 className="font-semibold mb-2">升级 Pro 版本</h3>
          <p className="text-sm text-white/80 mb-3">
            解锁更多高级分析功能：阅读趋势、内容表现、受众洞察
          </p>
          <button className="px-4 py-2 bg-white text-orange-500 rounded-lg font-medium text-sm">
            了解 Pro
          </button>
        </div>
      </main>
    </div>
  )
}
