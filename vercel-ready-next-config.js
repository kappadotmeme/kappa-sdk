/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { externalDir: true },
  transpilePackages: [
    'kappa-create',
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@tanstack/react-query',
  ],
  // Proxy configuration for Kappa API - works on both localhost and Vercel
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.kappa.fun/v1/:path*',
      },
    ];
  },
  // Add headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
