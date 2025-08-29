// API Configuration for Proxy Mode
// This configuration uses relative URLs that go through Next.js proxy
// to avoid CORS issues entirely

export const API_CONFIG_PROXY = {
  // When true, uses relative URLs (proxied through Next.js)
  // When false, uses direct URLs (subject to CORS)
  useProxy: true,
  
  // Direct API URLs (subject to CORS)
  production: 'https://api.kappa.fun',
  local: 'http://localhost:4200',
  
  // Proxied API URL (no CORS issues)
  proxied: '/api', // Will be proxied to localhost:4200
  
  // Get the current API base URL
  getApiBase: function() {
    if (this.useProxy) {
      return this.proxied;
    }
    // If not using proxy, check for production/local
    const useProduction = false; // Change this to switch between production/local
    return useProduction ? this.production : this.local;
  }
};

// Export the current API base for convenience
export const API_BASE = API_CONFIG_PROXY.getApiBase();

// Helper function to build API URLs
export function buildApiUrl(path: string): string {
  const base = API_CONFIG_PROXY.getApiBase();
  // Ensure no double slashes
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return base + cleanPath;
}

console.log('[API Config] Using:', API_CONFIG_PROXY.useProxy ? 'Proxy Mode (no CORS)' : 'Direct Mode', '- Base:', API_BASE);
