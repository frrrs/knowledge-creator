'use client'

import { useState } from 'react'
import { Check, SkipForward, Star } from 'lucide-react'

interface TaskCardProps {
  id: string
  title: string
  domain: string
  duration: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED'
  onComplete?: () => void
  onSkip?: () => void
  onViewScript?: () => void
}

export function TaskCard({
  title,
  domain,
  duration,
  difficulty,
  status,
  onComplete,
  onSkip,
  onViewScript
}: TaskCardProps) {
  const [isRating, setIsRating] = useState(false)
  const [rating, setRating] = useState(0)
  
  const difficultyColor = {
    EASY: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-red-100 text-red-800'
  }
  
  const difficultyText = {
    EASY: '简单',
    MEDIUM: '中等',
    HARD: '困难'
  }
  
  if (status === 'COMPLETED') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">今日任务</span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            已完成 ✅
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{domain}</span>
          <span>⏱️ {duration}分钟</span>
        </div>
        {!isRating && (
          <button
            onClick={() => setIsRating(true)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            给脚本打个分？
          </button>
        )}
        {isRating && (
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">今日任务</span>
        <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor[difficulty]}`}>
          {difficultyText[difficulty]}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          {domain}
        </span>
        <span className="flex items-center gap-1">
          ⏱️ {duration}分钟
        </span>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onViewScript}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          查看脚本
        </button>
        <button
          onClick={onComplete}
          className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          onClick={onSkip}
          className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
