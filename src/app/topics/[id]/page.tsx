'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Target,
  Lightbulb,
  FileText,
  ChevronRight,
  Loader2
} from 'lucide-react'

/**
 * 话题详情页
 * 展示选题详情、趋势分析、创作角度等信息
 */

/** 话题详情属性 */
interface TopicDetailProps {
  id: string
  title: string
  category: string
  trend: string
  difficulty: string
  estimatedViews: string
  description?: string
  keyPoints?: string[]
  outline?: string[]
  angles?: string[]
}

const TOPIC_DETAILS: Record<string, TopicDetailProps> = {
  '1': {
    id: '1',
    title: 'AI 工具如何提升写作效率',
    category: '科技',
    trend: 'hot',
    difficulty: 'easy',
    estimatedViews: '10k+',
    description: '探讨ChatGPT、Claude等AI工具如何改变内容创作方式，分享实用的提示词技巧和写作流程优化方法。',
    keyPoints: [
      'AI工具的核心能力：快速生成、润色改写、结构优化',
      '提示词工程：如何让AI理解你的需求',
      '人机协作：AI生成+人工打磨的最佳实践',
      '效率提升数据：使用AI前后的创作时间对比'
    ],
    outline: [
      '开场：展示一个创作场景（传统方式 vs AI辅助）',
      'AI工具介绍：3款主流工具对比',
      '实战演示：用AI完成一篇1000字文章',
      '效率分析：时间成本与质量平衡',
      '总结：AI是助手而非替代品'
    ],
    angles: [
      '实用角度：具体操作步骤和提示词模板',
      '批判角度：AI写作的局限性和注意事项',
      '前瞻角度：AI对内容行业的长期影响'
    ]
  },
  '2': {
    id: '2',
    title: '2024年创业避坑指南',
    category: '商业',
    trend: 'rising',
    difficulty: 'medium',
    estimatedViews: '5k+',
    description: '基于真实案例，总结创业者常犯的错误和避坑策略，帮助新手少走弯路。',
    keyPoints: [
      '选址陷阱：为什么好地段不等于好生意',
      '团队误区：合伙人选择的5个标准',
      '资金管理：现金流断裂的预警信号',
      '市场验证：MVP最小可行性产品方法论'
    ],
    outline: [
      '开场：一个失败创业故事',
      '坑点1：盲目跟风，忽视市场需求',
      '坑点2：重资产投入，现金流紧张',
      '坑点3：股权分配不均，团队内耗',
      '避坑清单：创业前必做的10件事',
      '总结：理性创业，先验证后投入'
    ],
    angles: [
      '失败案例：复盘真实创业失败经历',
      '方法论：系统化的创业验证框架',
      '心态建设：创业者的认知升级'
    ]
  },
  '3': {
    id: '3',
    title: '认知心理学在日常决策中的应用',
    category: '心理',
    trend: 'stable',
    difficulty: 'hard',
    estimatedViews: '3k+',
    description: '将认知心理学理论转化为实用工具，帮助观众识别思维偏见，做出更理性的决策。',
    keyPoints: [
      '确认偏误：为什么我们只看自己想看的',
      '锚定效应：第一印象如何影响判断',
      '损失厌恶：为什么亏钱比赚钱更难受',
      '可得性启发：为什么最近发生的事记得最清楚'
    ],
    outline: [
      '开场：一个日常决策场景',
      '概念1：确认偏误 - 实验演示',
      '概念2：锚定效应 - 价格感知实验',
      '概念3：损失厌恶 - 投资行为分析',
      '应用：如何用认知心理学优化决策',
      '总结：理性决策的思维工具箱'
    ],
    angles: [
      '实验演示：用趣味实验解释理论',
      '生活应用：购物、投资、人际关系中的心理学',
      '深度解析：认知偏见的进化心理学根源'
    ]
  },
  '4': {
    id: '4',
    title: '新手必读：内容创作入门',
    category: '教育',
    trend: 'hot',
    difficulty: 'easy',
    estimatedViews: '8k+',
    description: '为零基础新手提供内容创作的完整入门指南，包括定位、选题、制作、发布全流程。',
    keyPoints: [
      '定位策略：如何找到自己的差异化优势',
      '选题技巧：源源不断的选题库建设',
      '内容结构：黄金3秒开场+价值中段+行动结尾',
      '平台选择：不同平台的内容调性对比'
    ],
    outline: [
      '开场：为什么现在做内容是最好的时机',
      '第一步：找到你的内容定位',
      '第二步：建立选题库（3个方法）',
      '第三步：内容制作的核心框架',
      '第四步：发布策略和数据分析',
      '总结：从0到1的行动清单'
    ],
    angles: [
      '励志向：普通人通过内容创作逆袭的故事',
      '干货向：可落地的操作步骤和工具',
      '趋势向：内容行业的未来机会'
    ]
  },
  '5': {
    id: '5',
    title: '数字经济下的新商业模式',
    category: '商业',
    trend: 'rising',
    difficulty: 'medium',
    estimatedViews: '6k+',
    description: '解析数字经济发展带来的新商业机会，包括平台经济、订阅模式、创作者经济等。',
    keyPoints: [
      '平台经济：连接供需的新价值创造',
      '订阅模式：从一次性交易到持续收入',
      '创作者经济：个人IP的商业化路径',
      '数据资产：数字化时代的核心竞争力'
    ],
    outline: [
      '开场：数字经济的规模和增速数据',
      '模式1：平台型商业案例分析',
      '模式2：订阅制成功的关键因素',
      '模式3：创作者如何构建商业模式',
      '趋势预判：下一个风口在哪里',
      '总结：个人如何抓住数字红利'
    ],
    angles: [
      '案例分析：成功企业的商业模式拆解',
      '机会挖掘：普通人参与的切入点',
      '风险警示：数字经济的潜在陷阱'
    ]
  }
}

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const topicId = params.id
  const topic = TOPIC_DETAILS[topicId]
  
  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">选题不存在</p>
          <button 
            onClick={() => router.push('/topics')}
            className="mt-4 text-blue-600 hover:underline"
          >
            返回选题列表
          </button>
        </div>
      </div>
    )
  }
  
  const handleUseTopic = async () => {
    setLoading(true)
    // 将选题信息保存到localStorage，dashboard页面读取
    localStorage.setItem('selectedTopic', JSON.stringify({
      id: topic.id,
      title: topic.title,
      category: topic.category,
      description: topic.description,
      outline: topic.outline
    }))
    
    // 延迟跳转，确保数据保存
    setTimeout(() => {
      router.push('/dashboard')
    }, 300)
  }
  
  const getDifficultyText = (diff: string) => {
    const map: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return map[diff] || diff
  }
  
  const getDifficultyColor = (diff: string) => {
    const map: Record<string, string> = {
      easy: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      hard: 'text-red-600 bg-red-50'
    }
    return map[diff] || 'text-gray-600 bg-gray-50'
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.push('/topics')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">选题详情</h1>
        </div>
      </header>
      
      <main className="p-4 space-y-4">
        {/* Topic Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
              {topic.category}
            </span>
            {topic.trend === 'hot' && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs">
                <TrendingUp className="w-3 h-3" />
                热门
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(topic.difficulty)}`}>
              {getDifficultyText(topic.difficulty)}
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-3">{topic.title}</h2>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {topic.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              预计 {topic.difficulty === 'easy' ? '15' : topic.difficulty === 'medium' ? '25' : '40'} 分钟
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              预计阅读 {topic.estimatedViews}
            </span>
          </div>
        </div>
        
        {/* Key Points */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">核心观点</h3>
          </div>
          <ul className="space-y-3">
            {topic.keyPoints?.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Outline */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">建议大纲</h3>
          </div>
          <div className="space-y-3">
            {topic.outline?.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Angles */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">切入角度</h3>
          </div>
          <div className="space-y-2">
            {topic.angles?.map((angle, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 text-sm">{angle}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleUseTopic}
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <FileText className="w-5 h-5" />
              使用此选题创作
            </>
          )}
        </button>
      </div>
    </div>
  )
}
