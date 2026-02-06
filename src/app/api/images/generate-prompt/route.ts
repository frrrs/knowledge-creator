import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api'

// POST /api/images/generate-prompt - 根据脚本生成配图提示词
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { script, topic, style, platform } = body
    
    if (!script && !topic) {
      return errorResponse('script or topic is required', 400)
    }
    
    console.log('[API] Generating image prompts for:', topic || 'script')
    
    // 生成配图提示词
    const prompts = generateImagePrompts(script, topic, style, platform)
    
    // 生成封面建议
    const coverSuggestion = generateCoverSuggestion(script, topic, prompts[0])
    
    return successResponse({
      topic: topic || '内容',
      prompts,
      coverSuggestion,
      style: style || 'default',
      platform: platform || '通用'
    })
    
  } catch (error) {
    console.error('[API] Generate image prompts error:', error)
    return errorResponse('Failed to generate prompts', 500)
  }
}

// 生成配图提示词
function generateImagePrompts(
  script?: string,
  topic?: string,
  style?: string,
  platform?: string
): Array<{
  scene: string
  prompt: string
  negativePrompt: string
  aspectRatio: string
  style: string
  usage: string
}> {
  const prompts = []
  
  const baseTopic = topic || extractTopicFromScript(script) || '知识分享'
  
  // 根据平台选择比例
  const aspectRatio = getPlatformAspectRatio(platform)
  
  // 1. 封面图提示词
  prompts.push({
    scene: '封面图',
    prompt: generateCoverPrompt(baseTopic, style),
    negativePrompt: '模糊, 低质量, 文字错误, 人物变形, 扭曲, 重复, 水印',
    aspectRatio,
    style: style || '现代插画风格',
    usage: '作为内容封面，吸引点击'
  })
  
  // 2. 核心概念图
  prompts.push({
    scene: '核心概念图',
    prompt: generateConceptPrompt(baseTopic, style),
    negativePrompt: '模糊, 无关元素, 混乱背景, 低分辨率',
    aspectRatio: '1:1',
    style: style || '信息图表风格',
    usage: '解释核心概念，增强理解'
  })
  
  // 3. 步骤/流程图
  if (script && (script.includes('步骤') || script.includes('流程') || script.includes('首先'))) {
    prompts.push({
      scene: '步骤流程图',
      prompt: generateProcessPrompt(baseTopic, style),
      negativePrompt: '文字过多, 混乱, 不清晰, 颜色冲突',
      aspectRatio: '16:9',
      style: style || '扁平化设计',
      usage: '展示步骤流程，提升可读性'
    })
  }
  
  // 4. 对比图
  prompts.push({
    scene: '对比示意图',
    prompt: generateComparisonPrompt(baseTopic, style),
    negativePrompt: '不平衡, 模糊, 不相关对比, 复杂背景',
    aspectRatio: '16:9',
    style: style || '分屏对比风格',
    usage: '前后对比，突出效果'
  })
  
  // 5. 数据可视化
  prompts.push({
    scene: '数据可视化',
    prompt: generateDataVizPrompt(baseTopic, style),
    negativePrompt: '杂乱, 文字太小, 颜色过多, 不清晰',
    aspectRatio: '16:9',
    style: style || '现代数据图表',
    usage: '展示数据，增强说服力'
  })
  
  return prompts
}

// 生成封面提示词
function generateCoverPrompt(topic: string, style?: string): string {
  const styles: Record<string, string> = {
    '现代插画': '现代扁平插画风格, 明亮的配色, 简洁的构图',
    '3D渲染': '3D渲染风格, C4D质感, 柔和光影, 专业感',
    '摄影风格': '专业摄影风格, 景深效果, 自然光, 高质量',
    '手绘风格': '手绘插画风格, 温暖色调, 亲切感, 细节丰富',
    '极简风格': '极简主义, 大量留白, 几何图形, 高级感'
  }
  
  const selectedStyle = styles[style || '现代插画'] || styles['现代插画']
  
  return `一张关于"${topic}"的封面图, ${selectedStyle}, ` +
    `画面中央突出主题, 配色协调专业, ` +
    `适合作为知识类内容的封面, 高清质量, 4K分辨率`
}

// 生成概念图提示词
function generateConceptPrompt(topic: string, style?: string): string {
  return `信息图解释"${topic}"的核心概念, ` +
    `图标化设计, 简洁明了, 蓝紫色配色方案, ` +
    `中心是主题图标, 周围环绕关键要素, ` +
    `现代扁平风格, 适合社交媒体分享`
}

// 生成流程图提示词
function generateProcessPrompt(topic: string, style?: string): string {
  return `"${topic}"的步骤流程图, ` +
    `3-5个步骤的展示, 箭头连接, ` +
    `每个步骤配简单图标, 渐变色彩, ` +
    `扁平化设计, 清晰易读, 横向排版`
}

// 生成对比图提示词
function generateComparisonPrompt(topic: string, style?: string): string {
  return `"${topic}"前后对比图, ` +
    `分屏设计, 左侧"Before"右侧"After", ` +
    `视觉对比强烈, 同一视角, ` +
    `专业设计, 配色对比明显但和谐`
}

// 生成数据可视化提示词
function generateDataVizPrompt(topic: string, style?: string): string {
  return `关于"${topic}"的数据图表, ` +
    `柱状图或折线图, 渐变配色, ` +
    `数据趋势清晰, 专业的信息图表风格, ` +
    `简洁背景, 重点突出`
}

// 生成封面建议
function generateCoverSuggestion(
  script?: string,
  topic?: string,
  firstPrompt?: any
): {
  title: string
  subtitle: string
  colorScheme: string
  fontStyle: string
  layout: string
} {
  const baseTopic = topic || extractTopicFromScript(script) || '内容'
  
  return {
    title: `主标题：${baseTopic}`,
    subtitle: '副标题：一句话核心观点',
    colorScheme: '推荐配色：蓝色(专业) + 橙色(醒目)',
    fontStyle: '字体：粗体标题 + 细体副标题',
    layout: '布局：左图右文或居中构图，确保标题清晰可读'
  }
}

// 从脚本提取主题
function extractTopicFromScript(script?: string): string | null {
  if (!script) return null
  
  // 提取前20个字作为主题
  const cleanScript = script.replace(/[【】\[\]\(\)]/g, '').trim()
  return cleanScript.slice(0, 20) || null
}

// 获取平台推荐比例
function getPlatformAspectRatio(platform?: string): string {
  const ratios: Record<string, string> = {
    'xiaohongshu': '3:4',
    'douyin': '9:16',
    'bilibili': '16:9',
    'wechat': '2.35:1',
    'zhihu': '16:9'
  }
  return ratios[platform || ''] || '16:9'
}

// GET /api/images/styles - 获取支持的图片风格
export async function GET() {
  const styles = [
    { id: 'modern', name: '现代插画', desc: '扁平化设计，适合知识类内容', popular: true },
    { id: '3d', name: '3D渲染', desc: 'C4D质感，专业高端', popular: false },
    { id: 'photo', name: '摄影风格', desc: '真实照片感，亲近自然', popular: true },
    { id: 'handdrawn', name: '手绘风格', desc: '温暖手绘，亲切有趣', popular: false },
    { id: 'minimal', name: '极简风格', desc: '大量留白，高级感', popular: true },
    { id: 'infographic', name: '信息图表', desc: '数据可视化，信息密集', popular: false }
  ]
  
  return successResponse({ styles })
}
