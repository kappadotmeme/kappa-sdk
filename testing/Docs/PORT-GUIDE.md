# Port Configuration Guide

## The Problem
You want to run multiple services but ports can conflict:
- **Main Platform** (API + Frontend): Wants port 3000
- **Widget Testing**: Also wants port 3000
- **Local API Server**: Running on port 4200

**⚠️ You cannot run two services on the same port simultaneously!**

## Solutions

### Solution 1: Proxy Mode (Recommended) ✅
**Use Next.js proxy to avoid CORS issues entirely**

1. **Configure API mode in `config/api.ts`:**
```typescript
mode: 'proxy'  // No CORS issues!
```

2. **Run services on different ports:**
- Main Platform: Port 3000
- Widget Testing: Port 3001 (or any available port)
- Local API: Port 4200

3. **Start the widget testing server:**
```bash
npm run dev:3001  # Runs on port 3001
# OR
npm run dev       # Runs on port 3000 (if main platform is not running)
```

**How it works:** The widget makes requests to `/api/v1/*` which Next.js proxies to `http://localhost:4200/v1/*`. No CORS issues!

### Solution 2: Direct Mode with CORS
**Use direct API calls (requires CORS configuration)**

1. **Configure API mode in `config/api.ts`:**
```typescript
mode: 'direct'  // Direct API calls
useProduction: false  // Use local API
```

2. **Ensure your API allows the origin:**
- Port 3000: Usually already configured ✅
- Port 3001: Needs to be added to CORS whitelist ❌

### Solution 3: Sequential Development
**Run one at a time**

1. **When working on the main platform:**
```bash
# Stop widget testing server
pkill -f "next dev"

# Start main platform on port 3000
cd /path/to/main-platform
npm run dev  # Uses port 3000
```

2. **When working on widget testing:**
```bash
# Stop main platform
# Then start widget testing
cd Testing/web-widget
npm run dev  # Uses port 3000
```

## Quick Commands

### Check what's running on ports:
```bash
lsof -i :3000  # Check port 3000
lsof -i :3001  # Check port 3001
lsof -i :4200  # Check port 4200
```

### Kill processes on specific ports:
```bash
kill -9 $(lsof -t -i:3000)  # Kill process on port 3000
kill -9 $(lsof -t -i:3001)  # Kill process on port 3001
```

### Test CORS configuration:
```bash
cd Testing/web-widget
node test-cors.js
```

## Recommended Setup

For development with all services running simultaneously:

| Service | Port | Configuration |
|---------|------|--------------|
| Main Platform | 3000 | Your existing setup |
| Widget Testing | 3001 | `npm run dev:3001` with proxy mode |
| Local API | 4200 | Your API server |

**In `config/api.ts`:**
```typescript
mode: 'proxy'  // ← Use this!
```

This way:
- ✅ No port conflicts
- ✅ No CORS issues
- ✅ Everything runs simultaneously
- ✅ Easy to switch between services

## Troubleshooting

### "Port already in use" error
```bash
# Find what's using the port
lsof -i :3000

# Kill it
pkill -f "next dev"
# OR
kill -9 $(lsof -t -i:3000)
```

### CORS errors in browser console
1. Check current mode in `config/api.ts`
2. If using 'direct' mode, switch to 'proxy'
3. If you must use 'direct', update your API's CORS settings

### API calls not working
1. Open browser console (F12)
2. Check Network tab for failed requests
3. Look for CORS errors or connection refused
4. Verify API is running: `curl http://localhost:4200/v1/coins/trending?page=1&size=1`
