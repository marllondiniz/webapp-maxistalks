/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin')

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin()
module.exports = withNextIntl(nextConfig)


