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
  // 禁用静态优化以减少内存使用
  experimental: {
    optimizeCss: false,
  },
  // 减少构建时的内存使用
  swcMinify: true,
};

export default nextConfig;
