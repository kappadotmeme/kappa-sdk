/* global window */
// WASM Loader for move_bytecode
// This module handles loading the WASM file in both browser and Node.js environments

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Import the bundled base64 WASM
let BUNDLED_WASM_BASE64;

// Try to import the wasm-base64 module statically
// This will be bundled by webpack for browser environments
try {
  const wasmBase64 = require('./wasm-base64.js');
  if (wasmBase64 && wasmBase64.WASM_BASE64) {
    BUNDLED_WASM_BASE64 = wasmBase64.WASM_BASE64;
    if (!isBrowser) {
      console.log('[WASM Loader] Bundled WASM loaded successfully');
    }
  }
} catch (e) {
  // If static import fails, only try dynamic loading in Node.js
  if (!isBrowser) {
    try {
      // Use eval to prevent webpack from analyzing these requires
      const wasmModule = eval("require('./wasm-base64.js')");
      if (wasmModule && wasmModule.WASM_BASE64) {
        BUNDLED_WASM_BASE64 = wasmModule.WASM_BASE64;
        console.log('[WASM Loader] Bundled WASM loaded via fallback');
      }
    } catch (fallbackError) {
      console.log('[WASM Loader] Bundled WASM not available, will use fallback methods');
    }
  }
}

/**
 * Load WASM bytes from various sources
 * Priority order:
 * 1. Global override (KAPPA_WASM_URL or KAPPA_WASM_BASE64)
 * 2. Bundled base64 (automatically included)
 * 3. Package path (for Node.js fallback)
 */
async function loadWasmBytes() {
  // Check for global overrides
  if (typeof globalThis !== 'undefined') {
    // Check for base64 override
    if (globalThis.KAPPA_WASM_BASE64) {
      console.log('[WASM Loader] Using global base64 override');
      const base64 = globalThis.KAPPA_WASM_BASE64;
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    
    // Check for URL override
    if (globalThis.KAPPA_WASM_URL) {
      console.log('[WASM Loader] Using global URL override:', globalThis.KAPPA_WASM_URL);
      const response = await fetch(globalThis.KAPPA_WASM_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM from ${globalThis.KAPPA_WASM_URL}`);
      }
      return new Uint8Array(await response.arrayBuffer());
    }
  }
  
  // Try to use bundled base64 WASM
  if (BUNDLED_WASM_BASE64) {
    console.log('[WASM Loader] Using bundled WASM');
    try {
      if (isBrowser && typeof atob !== 'undefined') {
        // Browser environment
        const binaryString = atob(BUNDLED_WASM_BASE64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      } else if (!isBrowser) {
        // Node.js environment
        const buffer = Buffer.from(BUNDLED_WASM_BASE64, 'base64');
        return new Uint8Array(buffer);
      }
    } catch (e) {
      console.error('[WASM Loader] Failed to decode bundled WASM:', e);
    }
  }
  
  // Try to load from package in Node.js only as last resort
  if (!isBrowser && typeof eval !== 'undefined') {
    try {
      // Use eval to prevent webpack from analyzing these requires
      const fs = eval("require('fs')");
      const path = eval("require('path')");
      
      // Try to find __dirname or use process.cwd()
      const baseDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
      
      // Try multiple potential paths
      const possiblePaths = [
        path.join(baseDir, '..', 'move-bytecode', 'move_bytecode.wasm'),
        path.join(baseDir, '..', '..', 'move-bytecode', 'move_bytecode.wasm'),
        path.join(process.cwd(), 'node_modules', 'kappa-create', 'move-bytecode', 'move_bytecode.wasm'),
      ];
      
      for (const wasmPath of possiblePaths) {
        try {
          if (fs.existsSync(wasmPath)) {
            console.log('[WASM Loader] Loading from Node.js path:', wasmPath);
            const bytes = fs.readFileSync(wasmPath);
            return new Uint8Array(bytes);
          }
        } catch (e) {
          // Continue to next path
        }
      }
      
      throw new Error('Could not find move_bytecode.wasm in Node.js environment');
    } catch (e) {
      console.error('[WASM Loader] Node.js loading failed:', e);
      throw e;
    }
  }
  
  // In browser, if bundled WASM is not available, throw error
  if (isBrowser) {
    throw new Error(
      'Could not load bundled move_bytecode.wasm. ' +
      'The WASM file should be automatically bundled with the package. ' +
      'If you see this error, you can work around it by:\n' +
      '1. Setting window.KAPPA_WASM_URL to the URL of the WASM file\n' +
      '2. Setting window.KAPPA_WASM_BASE64 to the base64-encoded WASM content'
    );
  }
  
  throw new Error('Could not load WASM in current environment');
}

// Export a function to set the WASM programmatically
function setWasmBase64(base64) {
  if (typeof globalThis !== 'undefined') {
    globalThis.KAPPA_WASM_BASE64 = base64;
  }
}

// Export a function to set the WASM URL programmatically
function setWasmUrl(url) {
  if (typeof globalThis !== 'undefined') {
    globalThis.KAPPA_WASM_URL = url;
  }
}

module.exports = { loadWasmBytes, setWasmBase64, setWasmUrl };
