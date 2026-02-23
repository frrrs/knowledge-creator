'use client'

import { useState, useEffect } from 'react'

/** Loading 组件属性 */
interface LoadingProps {
  /** 加载提示文字 */
  text?: string
  /** 是否全屏显示 */
  fullscreen?: boolean
}

/** 旋转动画 Spinner 组件 */
function Spinner({ size }: { size: 'sm' | 'lg' }) {
  const dimensions = size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
  return (
    <div className={`relative ${dimensions}`}>
      <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
    </div>
  )
}

/**
 * 加载中组件
 * 显示旋转动画和加载文字，支持全屏和行内两种模式
 */
export function Loading({ text = '加载中...', fullscreen = false }: LoadingProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 text-sm">{text}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="sm" />
      <p className="mt-3 text-gray-600 text-sm">{text}</p>
    </div>
  )
}

/**
 * 页面加载状态管理 Hook
 * @returns 加载状态和设置函数
 * @remarks 默认 500ms 后自动完成加载，用于模拟页面初始化
 */
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
