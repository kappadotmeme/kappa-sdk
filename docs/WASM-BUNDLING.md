# WASM Bundling in Kappa SDK

The Kappa SDK includes WebAssembly (WASM) modules for Move bytecode compilation. This document explains how WASM is bundled and loaded.

## Overview

The SDK automatically bundles the `move_bytecode.wasm` file as base64 within the NPM package, eliminating the need for users to manually copy WASM files to their public folders.

## How It Works

### 1. Build Process
During the build process (`npm run build:wasm`), the WASM file is:
- Read from `move-bytecode/move_bytecode.wasm`
- Converted to base64
- Saved as `src/wasm-base64.js`
- Included in the NPM package

### 2. Loading Priority
The WASM loader tries multiple sources in this order:

1. **Global Override (Highest Priority)**
   - `window.KAPPA_WASM_BASE64` - Base64 encoded WASM
   - `window.KAPPA_WASM_URL` - URL to WASM file

2. **Bundled Base64 (Default)**
   - Automatically loaded from the NPM package
   - No user configuration needed
   - This is the primary loading method

3. **File System (Node.js Fallback)**
   - Only used if bundled base64 is not available
   - Looks in node_modules for the WASM file

## Usage

### Default (No Configuration Needed)
```javascript
import { DeployerWidgetStandalone } from 'kappa-create/react';

// WASM loads automatically from bundled base64
<DeployerWidgetStandalone />
```

### Custom WASM URL
If you need to serve the WASM from a CDN or custom location:

```javascript
// Set before importing the widget
window.KAPPA_WASM_URL = 'https://cdn.example.com/move_bytecode.wasm';

import { DeployerWidgetStandalone } from 'kappa-create/react';
```

### Custom Base64 WASM
For advanced use cases with modified WASM:

```javascript
// Set before importing the widget
window.KAPPA_WASM_BASE64 = 'AGFzbQEAAAAB...'; // Your base64 WASM

import { DeployerWidgetStandalone } from 'kappa-create/react';
```

## Next.js Configuration

For Next.js apps, the bundled WASM works automatically. No special configuration needed:

```javascript
// pages/deploy.tsx or app/deploy/page.tsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

export default function DeployPage() {
  return <DeployerWidgetStandalone />;
}
```

## Troubleshooting

### WASM Loading Errors

If you see WASM loading errors:

1. **Check Console Logs**
   - Look for `[WASM Loader]` messages
   - These show which loading method is being attempted

2. **Verify Package Installation**
   ```bash
   ls node_modules/kappa-create/src/wasm-base64.js
   ```

3. **Use Global Override**
   If the bundled WASM is not loading, you can override with a URL:
   ```javascript
   window.KAPPA_WASM_URL = 'https://cdn.jsdelivr.net/npm/kappa-create/move-bytecode/move_bytecode.wasm';
   ```

### Bundle Size Considerations

The base64-encoded WASM adds ~450KB to the bundle. If this is a concern:

1. **Serve WASM Separately**
   - Host the WASM file on a CDN
   - Use `window.KAPPA_WASM_URL` to point to it

2. **Lazy Load the Widget**
   ```javascript
   const DeployerWidget = dynamic(
     () => import('kappa-create/react').then(mod => mod.DeployerWidgetStandalone),
     { ssr: false }
   );
   ```

## Development

### Updating the WASM File

1. Replace `move-bytecode/move_bytecode.wasm` with your new file
2. Run `npm run build:wasm`
3. Test the widget
4. Commit both the `.wasm` and generated `wasm-base64.js`

### Testing WASM Loading

```javascript
// Test different loading methods
import { setWasmUrl, setWasmBase64 } from 'kappa-create/src/wasm-loader';

// Test URL loading
setWasmUrl('https://example.com/test.wasm');

// Test base64 loading
setWasmBase64('AGFzbQEAAAAB...');
```

## Technical Details

- **Original WASM Size**: ~336 KB
- **Base64 Size**: ~449 KB
- **Compression**: The base64 is further compressed by gzip in production
- **Loading Time**: Typically < 100ms from bundled base64
- **Memory Usage**: WASM is loaded once and cached

## Browser Support

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

All modern browsers that support WebAssembly.

## Security

The bundled WASM is:
- Included at build time
- Integrity verified by NPM
- Not modifiable at runtime (unless using overrides)

For maximum security, use Subresource Integrity (SRI) when serving from CDN:

```html
<script>
  window.KAPPA_WASM_URL = 'https://cdn.example.com/move_bytecode.wasm';
  // Verify the WASM integrity yourself after loading
</script>
```
