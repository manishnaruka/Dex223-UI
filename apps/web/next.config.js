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
  async redirects() {
    return [
      {
        source: '/margin-swap/:path*',     // incoming path
        destination: '/swap',      // where to send them
        permanent: false,           // 307 if false, 308 if true
      },
      {
        source: '/margin-trading/:path*',
        destination: '/swap', // you can even use dynamic params
        permanent: false,
      },
    ]
  },
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
