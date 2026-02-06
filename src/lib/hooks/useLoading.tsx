'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// v0.1.4 - 新增全局 Loading 状态管理

interface LoadingState {
  isLoading: boolean
  message: string
  progress?: number
}

interface LoadingContextType {
  state: LoadingState
  startLoading: (message?: string) => void
  stopLoading: () => void
  updateProgress: (progress: number) => void
  updateMessage: (message: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    message: ''
  })

  const startLoading = useCallback((message = '加载中...') => {
    setState({ isLoading: true, message, progress: 0 })
  }, [])

  const stopLoading = useCallback(() => {
    setState({ isLoading: false, message: '' })
  }, [])

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }))
  }, [])

  const updateMessage = useCallback((message: string) => {
    setState(prev => ({ ...prev, message }))
  }, [])

  return (
    <LoadingContext.Provider 
      value={{ state, startLoading, stopLoading, updateProgress, updateMessage }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

// 异步函数包装器
export function withLoading<T>(
  fn: () => Promise<T>,
  options: { message?: string; onError?: (error: Error) => void } = {}
): () => Promise<T | undefined> {
  return async function() {
    const { startLoading, stopLoading } = useLoading()
    
    try {
      startLoading(options.message)
      const result = await fn()
      return result
    } catch (error) {
      if (options.onError && error instanceof Error) {
        options.onError(error)
      }
      throw error
    } finally {
      stopLoading()
    }
  }
}
