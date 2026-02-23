/**
 * 仪表板页面模块
 * 用户主界面，展示今日任务、脚本查看、任务操作等核心功能
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { TaskCard } from '@/components/features/TaskCard'
import { ScriptViewer } from '@/components/features/ScriptViewer'
import { Loading } from '@/components/ui/Loading'
import { Flame, Calendar, Settings, BookOpen } from 'lucide-react'
import Link from 'next/link'

/**
 * 仪表板页面 - 用户主界面
 * 显示今日任务、脚本查看、任务操作等功能
 */
export default function DashboardPage() {
  const router = useRouter()
  const [showScript, setShowScript] = useState(false)
  
  const {
    user,
    isAuthenticated,
    currentTask,
    taskLoading,
    generateTask,
    completeTask,
    skipTask,
    rateTask
  } = useAppStore()
  
  // 检查登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])
  
  // 获取今日任务
  useEffect(() => {
    if (isAuthenticated && !currentTask && !taskLoading) {
      const domains = user?.domains || JSON.parse(localStorage.getItem('domains') || '["经济学"]')
      generateTask(domains).catch(() => {
        // 错误已处理
      })
    }
  }, [isAuthenticated, user, currentTask, taskLoading, generateTask])
  
  const handleComplete = async () => {
    if (!currentTask) return
    try {
      await completeTask(currentTask.id)
    } catch (error) {
      console.error('Complete error:', error)
    }
  }
  
  const handleSkip = async () => {
    if (!currentTask) return
    try {
      await skipTask(currentTask.id, '不感兴趣')
    } catch (error) {
      console.error('Skip error:', error)
    }
  }

  const handleRate = async (rating: number, comment?: string) => {
    if (!currentTask) return
    try {
      await rateTask(currentTask.id, rating, comment)
    } catch (error) {
      console.error('Rate error:', error)
      throw error
    }
  }

  // 计算连续打卡天数（简化版）
  const streak = currentTask?.status === 'COMPLETED' ? 1 : 0
  
  if (!isAuthenticated || taskLoading) {
    return <Loading text="正在加载今日任务..." />
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">
              {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-orange-600">{streak}</span>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {!currentTask ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">今日任务生成中</h2>
            <p className="text-gray-500">AI正在为你挑选最合适的选题...</p>
          </div>
        ) : (
          <>
            <TaskCard
              id={currentTask.id}
              title={currentTask.title}
              domain={currentTask.domain}
              duration={currentTask.duration}
              difficulty={currentTask.difficulty}
              status={currentTask.status}
              userRating={currentTask.rating}
              onComplete={handleComplete}
              onSkip={handleSkip}
              onViewScript={() => setShowScript(true)}
              onRate={handleRate}
            />
            
            {showScript && currentTask.script && (
              <div className="mt-6 animate-fadeIn">
                <ScriptViewer
                  content={currentTask.script.content}
                  hooks={currentTask.script.hooks}
                  keywords={currentTask.script.keywords}
                />
                <button
                  onClick={() => setShowScript(false)}
                  className="mt-4 w-full py-3 text-gray-600 hover:text-gray-800 transition"
                >
                  收起脚本 ↑
                </button>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="max-w-md mx-auto px-4 py-2 flex justify-around">
          <Link 
            href="/dashboard" 
            className="flex flex-col items-center gap-1 py-2 text-blue-600"
          >
            <span className="text-2xl">📋</span>
            <span className="text-xs">今日</span>
          </Link>
          <Link 
            href="/history" 
            className="flex flex-col items-center gap-1 py-2 text-gray-400 hover:text-gray-600"
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">历史</span>
          </Link>
          <Link 
            href="/settings" 
            className="flex flex-col items-center gap-1 py-2 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">设置</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
