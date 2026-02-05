export interface Task {
  id: string
  title: string
  domain: string
  duration: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED'
  createdAt: string
  script?: Script
  feedback?: Feedback
}

export interface Script {
  id: string
  content: string
  hooks?: Array<{ position: number; text: string }>
  keywords?: string[]
}

export interface Feedback {
  id: string
  rating?: number
  comment?: string
  skipped: boolean
  reason?: string
}

export interface User {
  id: string
  phone?: string
  wechatId?: string
  domains: string[]
  settings?: UserSettings
}

export interface UserSettings {
  pushTime: string
  timezone: string
}

export interface TopicSuggestion {
  title: string
  domain: string
  duration: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  outline: string
}
