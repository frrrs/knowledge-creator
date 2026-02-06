import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api'

// 平台适配配置
const PLATFORM_CONFIGS: Record<string, {
  name: string
  maxLength: number
  style: string
  features: string[]
  emojiUsage: 'high' | 'medium' | 'low'
  hashtagStyle: string
  tips: string[]
}> = {
  douyin: {
    name: '抖音',
    maxLength: 500,
    style: '短视频口播风格，口语化，节奏快',
    features: ['前3秒钩子必须抓人', '每15秒一个小高潮', '结尾引导互动'],
    emojiUsage: 'high',
    hashtagStyle: '#话题 放在文案末尾',
    tips: [
      '开头直接抛出痛点或悬念',
      '多用"你"字拉近距离',
      '口语化表达，避免书面语',
      '结尾加"你怎么看？评论区告诉我"'
    ]
  },
  xiaohongshu: {
    name: '小红书',
    maxLength: 1000,
    style: '种草笔记风格，真实分享，emoji丰富',
    features: ['标题要有关键词', '分段清晰，多用emoji', '真实感强的分享'],
    emojiUsage: 'high',
    hashtagStyle: '#话题# 融入正文',
    tips: [
      '标题格式：人群+痛点+解决方案',
      '多用✨❤️🔥等emoji',
      '添加"亲测有效""良心推荐"等词',
      '文末加相关话题标签'
    ]
  },
  bilibili: {
    name: 'B站',
    maxLength: 2000,
    style: '中长视频，内容深度，弹幕互动',
    features: ['可以更深入展开', '适合系列内容', '学术性与趣味性结合'],
    emojiUsage: 'low',
    hashtagStyle: 'tag标签系统',
    tips: [
      '开场白要有特色，建立个人风格',
      '内容可以更深入详细',
      '适当玩梗，增加弹幕互动',
      '结尾预告下期内容'
    ]
  },
  wechat: {
    name: '公众号',
    maxLength: 10000,
    style: '长文章，深度内容，结构完整',
    features: ['适合深度长文', '可以分章节', 'SEO优化空间大'],
    emojiUsage: 'low',
    hashtagStyle: '无，靠标题关键词',
    tips: [
      '标题要有吸引力且含关键词',
      '开头用故事或数据引入',
      '使用小标题分层',
      '结尾有总结和行动号召'
    ]
  },
  zhihu: {
    name: '知乎',
    maxLength: 5000,
    style: '问答式，专业分析，逻辑清晰',
    features: ['回答要有信息量', '逻辑结构清晰', '适当引用数据'],
    emojiUsage: 'low',
    hashtagStyle: '话题标签',
    tips: [
      '开门见山回答核心问题',
      '使用"首先/其次/最后"等逻辑词',
      '添加数据或案例支撑',
      '结尾总结核心观点'
    ]
  }
}

// POST /api/scripts/adapt - 将脚本适配到不同平台
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { script, platform, topic } = body
    
    if (!script || !platform) {
      return errorResponse('script and platform are required', 400)
    }
    
    const config = PLATFORM_CONFIGS[platform]
    if (!config) {
      return errorResponse('Unsupported platform', 400)
    }
    
    console.log('[API] Adapting script for:', platform)
    
    // 调用AI进行平台适配
    const adapted = await adaptScriptWithAI(script, platform, config, topic)
    
    return successResponse({
      original: script,
      adapted: adapted.content,
      platform: config.name,
      tips: config.tips,
      characterCount: adapted.content.length,
      maxLength: config.maxLength,
      fitsLimit: adapted.content.length <= config.maxLength
    })
    
  } catch (error) {
    console.error('[API] Adapt script error:', error)
    return errorResponse('Failed to adapt script', 500)
  }
}

// GET /api/scripts/adapt/platforms - 获取支持的平台列表
export async function GET() {
  const platforms = Object.entries(PLATFORM_CONFIGS).map(([id, config]) => ({
    id,
    name: config.name,
    maxLength: config.maxLength,
    style: config.style,
    features: config.features
  }))
  
  return successResponse({ platforms })
}

// AI适配脚本
async function adaptScriptWithAI(
  script: string, 
  platform: string,
  config: typeof PLATFORM_CONFIGS['douyin'],
  topic?: string
): Promise<{ content: string }> {
  // 这里应该调用AI API进行适配
  // 目前返回模拟的适配结果
  
  const adaptations: Record<string, string> = {
    douyin: adaptToDouyinStyle(script, topic),
    xiaohongshu: adaptToXiaohongshuStyle(script, topic),
    bilibili: adaptToBilibiliStyle(script, topic),
    wechat: adaptToWechatStyle(script, topic),
    zhihu: adaptToZhihuStyle(script, topic)
  }
  
  return { content: adaptations[platform] || script }
}

// 各平台适配函数
function adaptToDouyinStyle(script: string, topic?: string): string {
  return `【抖音版】${topic || '内容'}

🔥 ${topic || '这个话题'}太重要了！

你是不是也经常遇到这个问题？今天30秒给你讲清楚！

${script.slice(0, 200)}...

✅ 记住这3点：
1. 第一点核心干货
2. 第二点实操方法  
3. 第三点避坑指南

💡 关键来了！很多人不知道...

${script.slice(200, 400)}...

👇 你怎么看？评论区说说你的经历！

#${topic?.replace(/\s/g, '') || '知识分享'} #干货 #涨知识`
}

function adaptToXiaohongshuStyle(script: string, topic?: string): string {
  return `【小红书版】${topic || '内容'}

姐妹们！今天分享一个超实用的干货✨

${topic || '这个问题'}困扰我很久了
最近终于找到解决方法！

💭 先说说我踩过的坑：
• 坑1：xxx
• 坑2：xxx  
• 坑3：xxx

✨ 正确做法：
${script.slice(0, 300)}...

❤️ 亲测有效！建议收藏

🔥 重点来了：
${script.slice(300, 500)}...

💬 你们有什么想问的？
评论区见～

#${topic?.replace(/\s/g, '') || '干货分享'} #生活技巧 #实用 #种草`
}

function adaptToBilibiliStyle(script: string, topic?: string): string {
  return `【B站版】${topic || '内容'}

Hello大家好，这里是知识创作者

今天我们来聊聊${topic || '这个话题'}

首先声明，这期内容有点硬核
建议先收藏再看

=== 正片开始 ===

${script}

=== 核心要点总结 ===

本期内容如果对你有帮助
记得一键三连支持一下！

我们下期再见，拜拜～`
}

function adaptToWechatStyle(script: string, topic?: string): string {
  return `【公众号版】${topic || '内容'}

文 | 知识创作者

${topic || '这个话题'}，相信很多人都遇到过。

最近我在研究这个问题，发现了一些很有意思的观点，今天分享给大家。

## 一、问题的本质

${script.slice(0, 400)}...

## 二、深度分析

${script.slice(400, 800)}...

## 三、实用建议

基于以上分析，给大家3个建议：

1. **建议一**：具体内容
2. **建议二**：具体内容
3. **建议三**：具体内容

## 四、总结

今天我们从多个角度分析了${topic || '这个问题'}。

希望对你有所启发。

---

如果这篇文章对你有帮助，欢迎转发给朋友。

也可以在评论区分享你的看法。`
}

function adaptToZhihuStyle(script: string, topic?: string): string {
  return `【知乎版】${topic || '内容'}

谢邀。

这个问题我刚好有研究，来认真回答一下。

**先说结论：**
核心观点总结在这里...

**以下是详细分析：**

首先，${script.slice(0, 300)}...

其次，从数据来看...

再者，结合实际案例...

${script.slice(300, 600)}...

最后，总结一下：

1. 要点一
2. 要点二
3. 要点三

以上。

如果觉得有帮助，欢迎点赞支持。`
}
