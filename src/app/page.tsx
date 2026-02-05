'use client'

import { useState, useEffect } from 'react'
import { TaskCard } from '@/components/features/TaskCard'
import { ScriptViewer } from '@/components/features/ScriptViewer'
import { Task } from '@/types'
import { Flame, Calendar, Settings } from 'lucide-react'

export default function Home() {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScript, setShowScript] = useState(false)
  const [streak, setStreak] = useState(3) // Mock数据
  
  // Mock用户ID，实际应从登录状态获取
  const userId = 'user-001'
  
  useEffect(() => {
    fetchTodayTask()
  }, [])
  
  const fetchTodayTask = async () => {
    try {
      // 实际API调用
      // const res = await fetch(`/api/tasks/today?userId=${userId}`)
      // const data = await res.json()
      
      // Mock数据用于演示
      setTimeout(() => {
        setTask({
          id: 'task-001',
          title: '为什么奶茶越卖越贵？背后的经济学原理',
          domain: '经济学',
          duration: 5,
          difficulty: 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          script: {
            id: 'script-001',
            content: `【钩子】你有没有发现，以前10块钱的奶茶，现在动辄二三十？🎯你是不是也纳闷，这奶茶凭什么这么贵？

【痛点】很多人觉得是商家黑心，但其实背后有一套经济学逻辑。理解了这个逻辑，你不仅能看懂奶茶定价，还能看懂很多消费品的定价策略。

【知识点】
首先，这是典型的「价格歧视」策略。🎯奶茶店通过推出不同价位的产品线，把消费者分成三类：价格敏感型（选基础款）、品质追求型（选中高端）、身份认同型（选网红款）。

其次，是「锚定效应」。🎯当你看到38元的「霸气芝士」时，22元的「标准款」突然就显得很划算了。那个高价款的存在，就是为了衬托中价款。

最后，是「沉没成本」的反向运用。奶茶店故意让排队时间变长，让你觉得「都等了这么久，不如买杯贵的」。

【互动】你现在买奶茶，一般选什么价位？评论区告诉我。

【结尾】搞懂了这些，下次买奶茶时，你就知道自己是被哪个套路「套路」了。我是你的经济学科普博主，我们下期见。`,
            hooks: [
              { position: 0, text: '你是不是也纳闷，这奶茶凭什么这么贵？' },
              { position: 200, text: '你现在买奶茶，一般选什么价位？' }
            ],
            keywords: ['价格歧视', '锚定效应', '沉没成本']
          }
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Fetch task error:', error)
      setLoading(false)
    }
  }
  
  const handleGenerateTask = async () => {
    setLoading(true)
    try {
      // const res = await fetch('/api/tasks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, domains: ['经济学'] })
      // })
      // const data = await res.json()
      // setTask(data.data)
      
      // Mock
      await fetchTodayTask()
    } catch (error) {
      console.error('Generate task error:', error)
    }
    setLoading(false)
  }
  
  const handleComplete = async () => {
    if (!task) return
    // await fetch(`/api/tasks/${task.id}`, {
    //   method: 'POST',
    //   body: JSON.stringify({ action: 'complete' })
    // })
    setTask({ ...task, status: 'COMPLETED' })
    setStreak(s => s + 1)
  }
  
  const handleSkip = async () => {
    if (!task) return
    // await fetch(`/api/tasks/${task.id}`, {
    //   method: 'POST',
    //   body: JSON.stringify({ action: 'skip', reason: '不感兴趣' })
    // })
    setTask({ ...task, status: 'SKIPPED' })
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在生成今日任务...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
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
        {!task ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">今天还没有任务</p>
            <button
              onClick={handleGenerateTask}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              生成今日任务
            </button>
          </div>
        ) : (
          <>
            <TaskCard
              id={task.id}
              title={task.title}
              domain={task.domain}
              duration={task.duration}
              difficulty={task.difficulty}
              status={task.status}
              onComplete={handleComplete}
              onSkip={handleSkip}
              onViewScript={() => setShowScript(true)}
            />
            
            {showScript && task.script && (
              <div className="mt-6">
                <ScriptViewer
                  content={task.script.content}
                  hooks={task.script.hooks}
                  keywords={task.script.keywords}
                />
                <button
                  onClick={() => setShowScript(false)}
                  className="mt-4 w-full py-3 text-gray-600 hover:text-gray-800"
                >
                  收起脚本
                </button>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-2 flex justify-around">
          <button className="flex flex-col items-center gap-1 py-2 text-blue-600">
            <span className="text-2xl">📋</span>
            <span className="text-xs">今日</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400">
            <span className="text-2xl">📚</span>
            <span className="text-xs">历史</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-400">
            <Settings className="w-6 h-6" />
            <span className="text-xs">设置</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
