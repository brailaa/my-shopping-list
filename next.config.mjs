/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty'],
  },
  //output: 'standalone',
  productionBrowserSourceMaps: false
};

export default nextConfig;
