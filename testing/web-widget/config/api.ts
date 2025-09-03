// API Configuration
// Change this to switch between local and production environments

export const API_CONFIG = {
  // Choose your API mode:
  // 'proxy' - Use Next.js proxy (no CORS issues, works on any port)
  // 'direct' - Direct API calls (subject to CORS restrictions)
  mode: 'direct' as 'proxy' | 'direct',  // Changed to 'direct' to use the production API directly
  
  // Toggle this to switch between environments (only for 'direct' mode)
  useProduction: true, // Set to true to use live API
  
  // API Base URLs
  production: 'https://api.kappa.fun',
  local: 'http://localhost:4200',
  
  // Get the current API base URL
  getApiBase: function() {
    if (this.mode === 'proxy') {
      // Use relative URL that Next.js will proxy
      return '/api';
    }
    // Direct mode
    return this.useProduction ? this.production : this.local;
  }
};

// Export the current API base for convenience
export const API_BASE = API_CONFIG.getApiBase();

// Log the current configuration (commented out to reduce console noise)
// if (typeof window !== 'undefined') {
//   console.log(`[API Config] Mode: ${API_CONFIG.mode}, Base: ${API_BASE}`);
// }

// Helper function to build API URLs
export function buildApiUrl(path: string): string {
  const base = API_CONFIG.getApiBase();
  // Ensure no double slashes
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return base + cleanPath;
}
