import { redirect } from 'next/navigation'

export default function Home() {
  // 检查用户是否已登录和选择喜好
  // 如果已登录且选择了喜好，重定向到功能页
  // 否则重定向到登录页
  redirect('/login')
}
