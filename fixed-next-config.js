/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { externalDir: true },
  transpilePackages: [
    'kappa-create',
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@tanstack/react-query',
  ],
  // ADD THIS: Proxy configuration for Kappa API
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.kappa.fun/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
