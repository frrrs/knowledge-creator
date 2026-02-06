'use client'

import { useState } from 'react'
import { Check, SkipForward, Star, X } from 'lucide-react'

interface TaskCardProps {
  id: string
  title: string
  domain: string
  duration: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED'
  userRating?: number
  onComplete?: () => void
  onSkip?: () => void
  onViewScript?: () => void
  onRate?: (rating: number, comment?: string) => Promise<void>
}

export function TaskCard({
  id,
  title,
  domain,
  duration,
  difficulty,
  status,
  userRating,
  onComplete,
  onSkip,
  onViewScript,
  onRate
}: TaskCardProps) {
  const [isRating, setIsRating] = useState(false)
  const [rating, setRating] = useState(userRating || 0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
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
  
  const handleRateSubmit = async () => {
    if (!onRate || rating === 0) return
    
    setSubmitting(true)
    try {
      await onRate(rating, comment)
      setIsRating(false)
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setSubmitting(false)
    }
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
        
        {/* Rating Display / Input */}
        {userRating ? (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">你的评分：</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${star <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-yellow-600 font-medium">{userRating}分</span>
          </div>
        ) : !isRating ? (
          <button
            onClick={() => setIsRating(true)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Star className="w-4 h-4" />
            给脚本打个分？
          </button>
        ) : (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">脚本质量如何？</span>
              <button 
                onClick={() => setIsRating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Star Rating */}
            <div className="flex gap-2 justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  disabled={submitting}
                  className={`p-1 transition ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'} hover:scale-110`}
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            
            {/* Rating Label */}
            <p className="text-center text-sm text-gray-600 mb-3">
              {rating === 1 && '⭐ 有待改进'}
              {rating === 2 && '⭐⭐ 一般般'}
              {rating === 3 && '⭐⭐⭐ 还不错'}
              {rating === 4 && '⭐⭐⭐⭐ 很好'}
              {rating === 5 && '⭐⭐⭐⭐⭐ 非常棒!'}
            </p>
            
            {/* Comment Input */}
            {rating > 0 && (
              <>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="有什么建议吗？（可选）"
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:border-blue-500 focus:outline-none mb-3"
                  rows={2}
                />
                <button
                  onClick={handleRateSubmit}
                  disabled={submitting}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? '提交中...' : '提交评价'}
                </button>
              </>
            )}
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
