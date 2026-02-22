import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * 应用元数据配置
 * 定义 SEO 相关的标题、描述等信息
 */
export const metadata: Metadata = {
  title: "知识创作者工作台",
  description: "AI驱动的知识博主任务推送与脚本生成系统",
  keywords: ["知识博主", "内容创作", "AI脚本", "短视频", "口播"],
  authors: [{ name: "Knowledge Creator Team" }],
};

/**
 * 视口配置
 * 控制移动端缩放和主题色
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

/**
 * 根布局组件
 * 包裹所有页面的基础结构
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
