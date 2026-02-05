'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

const DOMAINS = [
  { id: 'tech', name: '科技', icon: '💻', subdomains: ['AI', '互联网', '半导体', '新能源', '生物科技'] },
  { id: 'business', name: '商业', icon: '💼', subdomains: ['创业', '投资', '管理', '营销', '财经'] },
  { id: 'humanities', name: '人文', icon: '📚', subdomains: ['历史', '哲学', '文学', '艺术'] },
  { id: 'psychology', name: '心理', icon: '🧠', subdomains: ['情绪管理', '人际关系', '认知科学'] },
  { id: 'law', name: '法律', icon: '⚖️', subdomains: ['民法', '刑法', '商法', '知识产权'] },
  { id: 'education', name: '教育', icon: '🎓', subdomains: ['学习方法', '亲子教育', '职业发展'] },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  const toggleDomain = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else if (selected.length < 3) {
      setSelected([...selected, id])
    }
  }
  
  const handleConfirm = async () => {
    if (selected.length === 0) return
    
    setLoading(true)
    // 保存用户选择
    localStorage.setItem('domains', JSON.stringify(selected))
    
    // 实际应调用API保存
    setTimeout(() => {
      router.push('/')
    }, 500)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">选择你的领域</h1>
        <p className="text-gray-500 mt-2">
          选择1-3个你擅长的领域，我们将为你推荐相关选题
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">已选择:</span>
          <span className="text-blue-600 font-medium">{selected.length}/3</span>
        </div>
      </div>
      
      {/* Domain Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {DOMAINS.map((domain) => {
          const isSelected = selected.includes(domain.id)
          const isDisabled = !isSelected && selected.length >= 3
          
          return (
            <button
              key={domain.id}
              onClick={() => toggleDomain(domain.id)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-xl border-2 text-left transition
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : isDisabled 
                    ? 'border-gray-100 bg-gray-100 opacity-50' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-3xl mb-2 block">{domain.icon}</span>
              <h3 className="font-semibold text-gray-900">{domain.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {domain.subdomains.slice(0, 3).join('、')}...
              </p>
            </button>
          )
        })}
      </div>
      
      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleConfirm}
          disabled={selected.length === 0 || loading}
          className={`
            w-full py-4 rounded-xl font-medium transition
            ${selected.length > 0 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-400'
            }
          `}
        >
          {loading ? '保存中...' : `开始创作 (${selected.length})`}
        </button>
      </div>
    </div>
  )
}
