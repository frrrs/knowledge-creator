/** 任务难度等级 */
export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

/** 任务状态 */
export type TaskStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED'

/**
 * 任务 - 每日创作任务的核心数据结构
 */
export interface Task {
  /** 任务唯一标识 */
  id: string
  /** 任务标题 */
  title: string
  /** 所属领域 */
  domain: string
  /** 预计时长（分钟） */
  duration: number
  /** 难度等级 */
  difficulty: TaskDifficulty
  /** 当前状态 */
  status: TaskStatus
  /** 创建时间 ISO 字符串 */
  createdAt: string
  /** 关联的脚本（生成后填充） */
  script?: Script
  /** 用户反馈（完成后填充） */
  feedback?: Feedback
}

/** 脚本钩子结构 */
export interface ScriptHook {
  /** 在脚本中的位置 */
  position: number
  /** 钩子文本内容 */
  text: string
}

/**
 * 脚本 - AI 生成的口播稿
 */
export interface Script {
  /** 脚本唯一标识 */
  id: string
  /** 脚本正文内容 */
  content: string
  /** 互动点/钩子列表 */
  hooks?: ScriptHook[]
  /** 关键词标签 */
  keywords?: string[]
}

/**
 * 任务反馈 - 用户对任务和脚本的评价
 */
export interface Feedback {
  /** 反馈唯一标识 */
  id: string
  /** 评分（1-5） */
  rating?: number
  /** 文字评论 */
  comment?: string
  /** 是否跳过 */
  skipped: boolean
  /** 跳过原因 */
  reason?: string
}

/**
 * 用户设置
 */
export interface UserSettings {
  /** 每日推送时间（HH:mm 格式） */
  pushTime: string
  /** 时区 */
  timezone: string
}

/**
 * 用户 - 系统用户的核心信息
 */
export interface User {
  /** 用户唯一标识 */
  id: string
  /** 手机号（登录用） */
  phone?: string
  /** 微信号（可选绑定） */
  wechatId?: string
  /** 感兴趣的领域列表 */
  domains: string[]
  /** 用户设置 */
  settings?: UserSettings
}

/**
 * 选题建议 - AI 生成的选题推荐
 */
export interface TopicSuggestion {
  /** 选题标题 */
  title: string
  /** 所属领域 */
  domain: string
  /** 预计时长（分钟） */
  duration: number
  /** 难度等级 */
  difficulty: TaskDifficulty
  /** 标签列表 */
  tags: string[]
  /** 内容大纲 */
  outline: string
}
