/**
 * 健康检查 API 路由
 * 提供系统和依赖服务的状态检查端点
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/** 健康状态 */
type HealthStatus = 'ok' | 'error'

/** 服务状态 */
interface ServiceStatus {
  database: 'connected' | 'disconnected'
  api: 'running' | 'stopped'
}

/** 健康检查响应 */
interface HealthResponse {
  status: HealthStatus
  timestamp: string
  services?: ServiceStatus
  error?: string
}

/**
 * 健康检查端点
 * @returns 系统和依赖服务的状态
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`

    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: HealthResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    }

    return NextResponse.json(response, { status: 500 })
  }
}
