'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Bell, Shield, LogOut, ChevronRight, Palette } from 'lucide-react'

const SETTINGS_GROUPS = [
  {
    title: '账户',
    items: [
      { id: 'profile', name: '个人资料', icon: User, description: '修改昵称和头像' },
      { id: 'domains', name: '擅长领域', icon: Palette, description: '管理你的内容领域' },
    ]
  },
  {
    title: '偏好',
    items: [
      { id: 'notifications', name: '通知设置', icon: Bell, description: '每日提醒和推送' },
      { id: 'privacy', name: '隐私设置', icon: Shield, description: '数据使用和分享' },
    ]
  }
]

export default function SettingsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('微信用户')
  const [domains, setDomains] = useState<string[]>([])
  
  useEffect(() => {
    const savedDomains = localStorage.getItem('domains')
    if (savedDomains) {
      setDomains(JSON.parse(savedDomains))
    }
  }, [])
  
  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('domains')
    router.push('/login')
  }
  
  const handleItemClick = (id: string) => {
    switch (id) {
      case 'domains':
        router.push('/onboarding')
        break
      default:
        // 其他设置项暂未实现
        alert('功能开发中...')
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.push('/features')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">设置</h1>
        </div>
      </header>
      
      <main className="p-4">
        {/* User Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userName[0]}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{userName}</h2>
              <div className="flex flex-wrap gap-1 mt-1">
                {domains.slice(0, 3).map((d) => (
                  <span key={d} className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                    {d}
                  </span>
                ))}
                {domains.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    +{domains.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Groups */}
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">{group.title}</h3>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {group.items.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition ${
                      index !== group.items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 text-red-600 bg-white rounded-xl border border-gray-100 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">退出登录</span>
        </button>
        
        {/* Version */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Knowledge Creator v1.0.0
        </p>
      </main>
    </div>
  )
}
