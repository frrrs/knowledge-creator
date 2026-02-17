/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 禁用 CSS 优化以减少内存使用
  experimental: {
    optimizeCss: false,
    // 禁用某些实验性功能以减少内存
    serverComponentsExternalPackages: [],
  },
  // 减少构建时的内存使用
  swcMinify: true,
  // 增加构建超时
  staticPageGenerationTimeout: 120,
  // 限制并发构建数
  experimental: {
    optimizeCss: false,
    workerThreads: false,
  },
};

export default nextConfig;