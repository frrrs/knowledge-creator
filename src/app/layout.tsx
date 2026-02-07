import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "知识创作者工作台",
  description: "AI驱动的知识博主任务推送与脚本生成系统",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "知识创作者",
  },
  openGraph: {
    title: "知识创作者工作台",
    description: "AI驱动的知识博主任务推送与脚本生成系统",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "知识创作者工作台",
    description: "AI驱动的知识博主任务推送与脚本生成系统",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <noscript>
          <div style={{padding: '20px', textAlign: 'center', background: '#fef3c7'}}>
            ⚠️ 请启用 JavaScript 以使用本应用
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
