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
  // 内存优化配置
  experimental: {
    optimizeCss: false,
    // 禁用某些内存密集型功能
    serverComponentsExternalPackages: [],
  },
  swcMinify: true,
  // 减少并行处理
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
      // 限制并行性
      minimizer: config.optimization?.minimizer || [],
    }
    // 限制内存使用
    config.performance = {
      hints: false,
    }
    return config
  },
  // 禁用源码映射以减少内存
  productionBrowserSourceMaps: false,
}

export default nextConfig
