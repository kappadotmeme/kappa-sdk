/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.kappa.fun/v1/:path*',
      },
    ];
  },
  transpilePackages: [
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@tanstack/react-query',
  ],
  webpack: (config, { isServer, webpack }) => {
    // const path = require('path');
    // Local alias to use SDK sources without publishing
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
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
  
  // No proxy needed - using direct API calls to api.kappa.fun
};

module.exports = nextConfig;


