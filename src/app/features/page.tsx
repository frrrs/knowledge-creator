'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PenTool, 
  Lightbulb, 
  FileText, 
  History, 
  BarChart3, 
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react'

/**
 * 功能中心页面
 * 展示应用核心功能入口，引导用户选择功能模块
 */

const FEATURES = [
  {
    id: 'today',
    name: '今日创作',
    description: '查看今日推荐选题和脚本',
    icon: PenTool,
    color: 'bg-blue-500',
    badge: '每日更新'
  },
  {
    id: 'topics',
    name: '选题推荐',
    description: 'AI 智能推荐热门选题',
    icon: Lightbulb,
    color: 'bg-amber-500',
    badge: 'AI 驱动'
  },
  {
    id: 'scripts',
    name: '脚本助手',
    description: '生成和编辑内容脚本',
    icon: FileText,
    color: 'bg-green-500',
    badge: null
  },
  {
    id: 'history',
    name: '创作历史',
    description: '查看已完成的内容',
    icon: History,
    color: 'bg-purple-500',
    badge: null
  },
  {
    id: 'analytics',
    name: '数据分析',
    description: '创作数据和表现分析',
    icon: BarChart3,
    color: 'bg-pink-500',
    badge: 'Pro'
  },
  {
    id: 'settings',
    name: '设置',
    description: '管理偏好和账户',
    icon: Settings,
    color: 'bg-gray-500',
    badge: null
  },
]

/**
 * 功能中心页面组件
 * 展示应用核心功能入口，引导用户选择功能模块
 */
export default function FeaturesPage() {
  const router = useRouter()
  const [domains, setDomains] = useState<string[]>([])
  const [userName, setUserName] = useState('创作者')
  
  useEffect(() => {
    // 获取用户选择的领域
    const savedDomains = localStorage.getItem('domains')
    if (savedDomains) {
      setDomains(JSON.parse(savedDomains))
    }
    
    // 获取用户名
    const userId = localStorage.getItem('userId')
    if (userId) {
      setUserName(userId === 'user-001' ? '微信用户' : userId)
    }
  }, [])
  
  const handleFeatureClick = (featureId: string) => {
    switch (featureId) {
      case 'today':
        router.push('/dashboard')
        break
      case 'topics':
        router.push('/topics')
        break
      case 'scripts':
        router.push('/scripts')
        break
      case 'history':
        router.push('/history')
        break
      case 'analytics':
        router.push('/analytics')
        break
      case 'settings':
        router.push('/settings')
        break
      default:
        router.push('/dashboard')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 px-6 py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">欢迎回来，{userName}</h1>
            <p className="text-blue-100 text-sm">今天想创作什么内容？</p>
          </div>
        </div>
        
        {/* Selected Domains */}
        <div className="mt-6">
          <p className="text-blue-100 text-xs mb-2">你的擅长领域：</p>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <span 
                key={domain}
                className="px-3 py-1 bg-white/20 rounded-full text-white text-sm backdrop-blur"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="p-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">功能中心</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature.id)}
                  className="relative p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition text-left group"
                >
                  {feature.badge && (
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full text-white ${feature.color}`}>
                      {feature.badge}
                    </span>
                  )}
                  
                  <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 text-sm">{feature.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{feature.description}</p>
                  
                  <ChevronRight className="w-4 h-4 text-gray-300 absolute bottom-4 right-4 group-hover:text-blue-500 transition" />
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Quick Tip */}
        <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 text-sm">今日建议</h4>
              <p className="text-xs text-amber-700 mt-1">
                坚持每日创作能帮助你建立个人品牌。建议每天至少完成一个选题。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Safe Area */}
      <div className="h-8" />
    </div>
  )
}
