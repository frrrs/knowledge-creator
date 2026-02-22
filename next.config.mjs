/**
 * Next.js 配置文件
 * 针对 Vercel 部署环境优化，降低内存使用
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /** 构建时忽略 ESLint 错误（用于快速迭代） */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /** 构建时忽略 TypeScript 错误（生产环境应开启检查） */
  typescript: {
    ignoreBuildErrors: true,
  },

  /** 禁用图片优化（Vercel 免费版限制） */
  images: {
    unoptimized: true,
  },

  /** 启用 SWC 代码压缩 */
  swcMinify: true,

  /** 静态页面生成超时时间（秒） */
  staticPageGenerationTimeout: 120,

  /** 实验性功能配置 */
  experimental: {
    /** 禁用 CSS 优化以减少内存使用 */
    optimizeCss: false,
    /** 禁用 Worker 线程以降低内存占用 */
    workerThreads: false,
    /** 服务端组件外部包列表 */
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;