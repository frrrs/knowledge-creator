/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreDuringBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 内存优化
  experimental: {
    optimizeCss: false,
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
}

export default nextConfig
