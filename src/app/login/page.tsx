'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const handleWechatLogin = async () => {
    setLoading(true)
    // 实际应调用微信登录
    // 模拟登录成功
    setTimeout(() => {
      localStorage.setItem('userId', 'user-001')
      router.push('/onboarding')
    }, 1000)
  }
  
  const handlePhoneLogin = () => {
    // 手机号登录暂未实现
    alert('手机号登录开发中...')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">知识创作者</h1>
          <p className="text-gray-500 mt-1">工作台</p>
        </div>
        
        {/* 登录按钮 */}
        <div className="space-y-4">
          <button
            onClick={handleWechatLogin}
            disabled={loading}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition disabled:opacity-50"
          >
            <MessageCircle className="w-5 h-5" />
            {loading ? '登录中...' : '微信一键登录'}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>
          
          <button
            onClick={handlePhoneLogin}
            className="w-full border border-gray-300 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            手机号登录
          </button>
        </div>
        
        {/* 协议 */}
        <p className="text-xs text-gray-400 text-center mt-8">
          登录即表示同意
          <a href="#" className="text-blue-600">用户协议</a>
          和
          <a href="#" className="text-blue-600">隐私政策</a>
        </p>
      </div>
    </div>
  )
}
