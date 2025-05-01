const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  transpilePackages: [
    "@repo/ui"
  ],
  images: {
    dangerouslyAllowSVG: true,
    domains: ['ipfs.io', 'cloudflare-ipfs.com', 'gateway.pinata.cloud'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.coingecko.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**.github.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**.**',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**',
        port: ''
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig);
