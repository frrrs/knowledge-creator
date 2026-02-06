'use client'

import { useState, useEffect } from 'react'

interface LoadingProps {
  text?: string
  fullscreen?: boolean
}

export function Loading({ text = '加载中...', fullscreen = false }: LoadingProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 text-sm">{text}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-3 text-gray-600 text-sm">{text}</p>
    </div>
  )
}

// 页面加载状态管理
export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 模拟页面加载完成
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return { isLoading, setIsLoading }
}
