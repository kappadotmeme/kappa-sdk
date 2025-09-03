/**
 * Proxy configuration for Next.js to forward API requests
 * This allows the widget testing frontend to use the same origin
 * avoiding CORS issues
 */

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // Main platform API
      },
      {
        source: '/v1/:path*',
        destination: 'http://localhost:4200/v1/:path*', // Local API server
      },
    ];
  },
};
