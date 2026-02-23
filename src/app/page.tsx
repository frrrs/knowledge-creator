/**
 * 首页模块
 * 应用入口，根据用户认证状态进行页面重定向
 */

import { redirect } from 'next/navigation'

/**
 * 首页 - 应用入口
 * 根据用户状态重定向到相应页面
 * 未登录 → 登录页 / 已登录 → 功能页
 */
export default function HomePage() {
  // 检查用户是否已登录和选择喜好
  // 如果已登录且选择了喜好，重定向到功能页
  // 否则重定向到登录页
  redirect('/login')
}
