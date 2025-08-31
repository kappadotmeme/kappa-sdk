# Widget API Fetch Debug Guide

## Quick Fix for Your Project

If the widget (v2.0.23) is not fetching data in your project, you need to add the proxy configuration to your `next.config.js`:

```javascript
// next.config.js
module.exports = {
  // ... your existing config ...
  
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.kappa.fun/v1/:path*',
      },
    ];
  },
}
```

## Why This Happens

The widget v2.0.23 has smart CORS handling:
- On localhost: Uses `/api` as base URL (requires proxy)
- On production: Also uses `/api` (Vercel handles the proxy)

Without the proxy configured, requests to `/api/v1/...` will fail with 404.

## Debug Steps

1. **Check Browser Console**
   - You should see: `[Widget] Running locally, using proxy: /api`
   - Check Network tab for failed requests to `/api/v1/coins/trending`

2. **Test Your Proxy**
   Visit these URLs directly in your browser:
   - `http://localhost:3000/api/v1/coins/trending?page=1&size=50`
   - Should return JSON data if proxy is working

3. **Alternative: Force Direct API**
   If you can't add the proxy, you can force the widget to use the API directly:
   ```jsx
   <WidgetStandalone 
     apiBase="https://api.kappa.fun"
     // ... other props
   />
   ```
   Note: This might cause CORS errors depending on your domain.

## Complete Working Example

```jsx
// pages/index.js or app/page.tsx
import { WidgetStandalone } from 'kappa-create/react';

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <WidgetStandalone
        defaultContract="0x4722649f9f874823aec93834eda3a5c769dfd9aad216bda9d45afa2e4c0a1451::Trolf::TROLF"
        projectName="My DEX"
      />
    </div>
  );
}
```

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.kappa.fun/v1/:path*',
      },
    ];
  },
  // If using TypeScript/modern features:
  transpilePackages: [
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@tanstack/react-query',
  ],
}
```

## Still Not Working?

If it's still not working after adding the proxy:

1. **Clear Next.js cache**: `rm -rf .next && npm run dev`
2. **Check port number**: Make sure you're on the right port
3. **Try incognito mode**: To avoid browser cache
4. **Check for errors**: Look for red errors in browser console

## Contact

If you're still having issues, the problem might be:
- Domain-specific CORS blocking
- Corporate firewall/proxy
- Browser extensions blocking requests

Try the widget at: https://kappa-sdk-example.vercel.app/
This deployed version has the proxy configured correctly.
