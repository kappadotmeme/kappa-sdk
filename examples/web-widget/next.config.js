/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@tanstack/react-query',
  ],
};

export default nextConfig;


