'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, FileText, Clock, Target } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  
  // 模拟数据
  const stats = {
    totalTasks: 12,
    completedTasks: 8,
    totalTime: 180, // 分钟
    streakDays: 3
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
            <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            <p className="text-xs text-gray-400 mt-1">总任务 {stats.totalTasks}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">创作时长</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{Math.floor(stats.totalTime / 60)}h</p>
            <p className="text-xs text-gray-400 mt-1">{stats.totalTime} 分钟</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500">连续打卡</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.streakDays}</p>
            <p className="text-xs text-gray-400 mt-1">天</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-500">完成率</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">{stats.completedTasks}/{stats.totalTasks}</p>
          </div>
        </div>
        
        {/* Chart Placeholder */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">近7天创作趋势</h3>
          <div className="h-40 bg-gray-50 rounded-lg flex items-end justify-around p-4">
            {[40, 65, 30, 80, 55, 90, 45].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div 
                  className="w-8 bg-blue-500 rounded-t transition-all"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-400">{['一', '二', '三', '四', '五', '六', '日'][i]}</span>
              </div>
            ))}
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
