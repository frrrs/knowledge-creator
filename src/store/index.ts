/**
 * 全局状态管理 Store
 * 使用 Zustand 管理应用状态，支持持久化存储
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, User } from '@/types'

/** 统一处理 API 错误 */
function handleApiError(action: string, error: unknown): never {
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.error(`[Store] ${action} failed:`, message)
  throw error
}

/** 应用全局状态接口 */
interface AppState {
  // 用户信息
  user: User | null
  isAuthenticated: boolean
  
  // 当前任务
  currentTask: Task | null
  taskLoading: boolean
  
  // 历史任务
  history: Task[]
  historyLoading: boolean
  
  // 操作
  setUser: (user: User | null) => void
  logout: () => void
  
  setCurrentTask: (task: Task | null) => void
  setTaskLoading: (loading: boolean) => void
  
  setHistory: (tasks: Task[]) => void
  addToHistory: (task: Task) => void
  setHistoryLoading: (loading: boolean) => void
  
  // 生成任务
  generateTask: (domains: string[]) => Promise<void>
  
  // 完成任务
  completeTask: (taskId: string) => Promise<void>
  
  // 跳过任务
  skipTask: (taskId: string, reason?: string) => Promise<void>
  
  // 评分
  rateTask: (taskId: string, rating: number, comment?: string) => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      currentTask: null,
      taskLoading: false,
      history: [],
      historyLoading: false,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, isAuthenticated: false, currentTask: null, history: [] })
      },
      
      setCurrentTask: (task) => set({ currentTask: task }),
      setTaskLoading: (loading) => set({ taskLoading: loading }),
      
      setHistory: (tasks) => set({ history: tasks }),
      addToHistory: (task) => set((state) => ({ 
        history: [task, ...state.history] 
      })),
      setHistoryLoading: (loading) => set({ historyLoading: loading }),
      
      // API Actions
      generateTask: async (domains) => {
        set({ taskLoading: true })
        try {
          const userId = get().user?.id || localStorage.getItem('userId') || 'guest'
          
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, domains })
          })
          
          if (!res.ok) throw new Error('Failed to generate task')
          
          const data = await res.json()
          set({ currentTask: data.data })
        } catch (error) {
          handleApiError('generateTask', error)
        } finally {
          set({ taskLoading: false })
        }
      },
      
      completeTask: async (taskId) => {
        try {
          const res = await fetch(`/api/tasks/${taskId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'complete' })
          })
          
          if (!res.ok) throw new Error('Failed to complete task')
          
          // 更新本地状态
          const task = get().currentTask
          if (task && task.id === taskId) {
            const updatedTask = { ...task, status: 'COMPLETED' as const }
            set({ 
              currentTask: updatedTask,
              history: [updatedTask, ...get().history]
            })
          }
        } catch (error) {
          handleApiError('completeTask', error)
        }
      },
      
      skipTask: async (taskId, reason) => {
        try {
          const res = await fetch(`/api/tasks/${taskId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'skip', reason })
          })
          
          if (!res.ok) throw new Error('Failed to skip task')
          
          const task = get().currentTask
          if (task && task.id === taskId) {
            set({ 
              currentTask: { ...task, status: 'SKIPPED' as const }
            })
          }
        } catch (error) {
          handleApiError('skipTask', error)
        }
      },
      
      rateTask: async (taskId, rating, comment) => {
        try {
          const res = await fetch(`/api/tasks/${taskId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'rate', rating, comment })
          })
          
          if (!res.ok) throw new Error('Failed to rate task')
        } catch (error) {
          handleApiError('rateTask', error)
        }
      }
    }),
    {
      name: 'knowledge-creator-storage',
      partialize: (state) => ({ 
        user: state.user,
        history: state.history.slice(0, 10) // 只缓存最近10条
      })
    }
  )
)
