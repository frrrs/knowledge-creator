'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Phone, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loginType, setLoginType] = useState<'wechat' | 'phone'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      
      const data = await res.json()
      
      if (data.data?.debugCode) {
        // 测试环境显示验证码
        setCode(data.data.debugCode)
        setError(`测试验证码: ${data.data.debugCode}（已自动填写）`)
      } else {
        setError('验证码已发送（测试环境看控制台）')
      }
      
      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      setError('发送失败，请重试')
    } finally {
      setLoading(false)
    }
  }
  
  // 登录
  const handleLogin = async () => {
    if (!phone || !code) {
      setError('请填写手机号和验证码')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, type: 'phone' })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || '登录失败')
      }
      
      // 保存用户信息
      localStorage.setItem('userId', data.data.user.id)
      localStorage.setItem('token', data.data.token)
      
      // 新用户去 onboarding，老用户去功能页
      if (data.data.isNewUser || data.data.user.domains.length === 0) {
        router.push('/onboarding')
      } else {
        router.push('/features')
      }
      
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 模拟微信登录
  const handleWechatLogin = async () => {
    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('userId', 'wechat-user-001')
      router.push('/onboarding')
    }, 1000)
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
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            {error}
          </div>
        )}
        
        {/* Login Type Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setLoginType('phone')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              loginType === 'phone' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone className="w-4 h-4 inline mr-1" />
            手机号
          </button>
          <button
            onClick={() => setLoginType('wechat')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              loginType === 'wechat' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" />
            微信
          </button>
        </div>
        
        {/* Phone Login Form */}
        {loginType === 'phone' && (
          <div className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手机号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                maxLength={11}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            
            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                验证码
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入验证码"
                  maxLength={6}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
                />
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || loading}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm whitespace-nowrap disabled:opacity-50 hover:bg-gray-200 transition"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                测试环境验证码：000000 或直接点击获取
              </p>
            </div>
            
            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading || !phone || !code}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  登录
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Wechat Login */}
        {loginType === 'wechat' && (
          <div className="text-center py-8">
            <button
              onClick={handleWechatLogin}
              disabled={loading}
              className="w-full py-4 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  微信一键登录
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-4">
              （模拟登录，实际需配置微信开放平台）
            </p>
          </div>
        )}
        
        {/* Agreement */}
        <p className="text-xs text-gray-400 text-center mt-8">
          登录即表示同意
          <a href="#" className="text-blue-600 hover:underline">用户协议</a>
          和
          <a href="#" className="text-blue-600 hover:underline">隐私政策</a>
        </p>
      </div>
    </div>
  )
}
