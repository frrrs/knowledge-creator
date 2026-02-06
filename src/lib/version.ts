'use client'

// v0.1.5 - 新增版本信息显示

export const VERSION = '0.1.6'
export const BUILD_DATE = '2026-02-07'
export const ITERATION_COUNT = 6

export function VersionInfo() {
  return (
    <div className="text-center py-4 text-xs text-gray-400">
      <p>Knowledge Creator v{VERSION}</p>
      <p>Build {BUILD_DATE} · Iteration {ITERATION_COUNT}</p>
    </div>
  )
}
