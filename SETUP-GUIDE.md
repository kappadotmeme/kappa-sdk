# Kappa Widget Setup Guide - CORS Solution

## Required Configuration

The Kappa Widget (v2.0.25+) requires a proxy configuration to avoid CORS issues. This works for:
- ✅ Local development (localhost)
- ✅ Vercel deployments
- ✅ Any Next.js production deployment

## Step 1: Install the Widget

```bash
npm install kappa-create@latest
```

## Step 2: Configure next.config.js (REQUIRED)

Your `next.config.js` MUST include the proxy configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config...
  
  // REQUIRED: Proxy configuration for Kappa API
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.kappa.fun/v1/:path*',
      },
    ];
  },
  
  // If using TypeScript/modern features
  transpilePackages: [
    'kappa-create',
    '@mysten/dapp-kit', 
    '@mysten/sui',
    '@tanstack/react-query',
  ],
};

module.exports = nextConfig;
```

## Step 3: Use the Widget

```jsx
import { WidgetV2Standalone } from 'kappa-create/react';

export default function MyPage() {
  return (
    <WidgetV2Standalone
      defaultContract="0x4722649f9f874823aec93834eda3a5c769dfd9aad216bda9d45afa2e4c0a1451::Trolf::TROLF"
      projectName="My DEX"
    />
  );
}
```

## How It Works

1. Widget makes requests to `/api/v1/*` (same origin, no CORS)
2. Next.js proxy forwards to `https://api.kappa.fun/v1/*`
3. API responds to your server (not browser)
4. Your server returns response to widget

## Deployment

### Vercel
The configuration works automatically on Vercel. Just:
1. Push your code with the `next.config.js` changes
2. Vercel auto-deploys with the proxy configured

### Other Platforms
Any platform that supports Next.js rewrites will work.

## Troubleshooting

### Still getting CORS errors?

1. **Check your next.config.js** - Make sure the rewrites section is present
2. **Clear cache and restart** - `rm -rf .next && npm run dev`
3. **Check browser console** - Look for "[Widget] Using proxy path: /api"
4. **Verify proxy works** - Visit `http://localhost:3000/api/v1/coins/trending?page=1&size=1`

### Force a specific API base (not recommended)

If you absolutely need to override:

```jsx
<WidgetV2Standalone
  apiBase="https://api.kappa.fun"  // Will cause CORS unless domain is whitelisted
  // ... other props
/>
```

## Why This Approach?

- **No CORS issues** - Browser only sees same-origin requests
- **Works everywhere** - Local, Vercel, any Next.js host
- **Consistent behavior** - Same setup for dev and production
- **No API changes needed** - Works with existing api.kappa.fun

## Support

If you're still having issues after following this guide, the problem might be:
- Missing or incorrect next.config.js setup
- Cached old version of the widget
- Corporate firewall/proxy blocking

Check the example at: https://github.com/kappadotmeme/kappa-sdk/tree/main/examples/web-widget
