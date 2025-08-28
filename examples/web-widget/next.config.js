/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  transpilePackages: [
    'kappa-create',
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@tanstack/react-query',
  ],
  webpack: (config, { isServer, webpack }) => {
    const path = require('path');
    // Local alias to use SDK sources without publishing
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'kappa-create/react': path.resolve(__dirname, '../../src/react'),
      'kappa-create': path.resolve(__dirname, '../../src'),
    };
    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Only on client-side, provide fallbacks for Node.js modules and polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
      };
      
      // Inject a script that sets up TextEncoder before any modules load
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `
            if (typeof globalThis !== 'undefined' && typeof window !== 'undefined') {
              if (!globalThis.TextEncoder && window.TextEncoder) {
                globalThis.TextEncoder = window.TextEncoder;
              }
              if (!globalThis.TextDecoder && window.TextDecoder) {
                globalThis.TextDecoder = window.TextDecoder;
              }
            }
          `,
          raw: true,
          entryOnly: false,
          test: /\.(js|mjs|jsx|ts|tsx)$/,
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;


