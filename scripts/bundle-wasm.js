#!/usr/bin/env node

/**
 * Script to bundle WASM file as base64 for inclusion in the NPM package
 * This allows the WASM to be loaded without requiring users to copy files
 */

const fs = require('fs');
const path = require('path');

const wasmPath = path.join(__dirname, '..', 'move-bytecode', 'move_bytecode.wasm');
const outputPath = path.join(__dirname, '..', 'src', 'wasm-base64.js');

try {
  // Read the WASM file
  const wasmBytes = fs.readFileSync(wasmPath);
  
  // Convert to base64
  const base64 = wasmBytes.toString('base64');
  
  // Generate the JS module
  const jsContent = `// Auto-generated file containing base64-encoded WASM
// Generated from move-bytecode/move_bytecode.wasm
// DO NOT EDIT MANUALLY

// Base64-encoded WASM content (${(wasmBytes.length / 1024).toFixed(2)} KB original size)
const WASM_BASE64 = '${base64}';

// Helper function to decode base64 to Uint8Array
function decodeWasmBase64() {
  if (typeof window !== 'undefined' && window.atob) {
    // Browser environment
    const binaryString = window.atob(WASM_BASE64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } else {
    // Node.js environment
    const buffer = Buffer.from(WASM_BASE64, 'base64');
    return new Uint8Array(buffer);
  }
}

// Export for both CommonJS and ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WASM_BASE64, decodeWasmBase64 };
} else if (typeof exports !== 'undefined') {
  exports.WASM_BASE64 = WASM_BASE64;
  exports.decodeWasmBase64 = decodeWasmBase64;
}
`;
  
  // Write the output file
  fs.writeFileSync(outputPath, jsContent);
  
  console.log(`✅ Successfully bundled WASM as base64`);
  console.log(`   Original size: ${(wasmBytes.length / 1024).toFixed(2)} KB`);
  console.log(`   Base64 size: ${(base64.length / 1024).toFixed(2)} KB`);
  console.log(`   Output: ${outputPath}`);
  
} catch (error) {
  console.error('❌ Failed to bundle WASM:', error.message);
  process.exit(1);
}
