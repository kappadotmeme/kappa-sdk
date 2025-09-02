'use client';

import { useEffect } from 'react';

// Set up polyfills immediately when this module loads
if (typeof window !== 'undefined') {
  if (!window.TextEncoder) {
    (window as any).TextEncoder = class TextEncoder {
      encode(str: string): Uint8Array {
        const buf = new ArrayBuffer(str.length * 3);
        const bufView = new Uint8Array(buf);
        let idx = 0;
        for (let i = 0; i < str.length; i++) {
          let charCode = str.charCodeAt(i);
          if (charCode < 0x80) {
            bufView[idx++] = charCode;
          } else if (charCode < 0x800) {
            bufView[idx++] = 0xc0 | (charCode >> 6);
            bufView[idx++] = 0x80 | (charCode & 0x3f);
          } else {
            bufView[idx++] = 0xe0 | (charCode >> 12);
            bufView[idx++] = 0x80 | ((charCode >> 6) & 0x3f);
            bufView[idx++] = 0x80 | (charCode & 0x3f);
          }
        }
        return bufView.slice(0, idx);
      }
    };
  }
  
  if (!window.TextDecoder) {
    (window as any).TextDecoder = class TextDecoder {
      decode(arr: Uint8Array): string {
        let str = '';
        for (let i = 0; i < arr.length; i++) {
          str += String.fromCharCode(arr[i]);
        }
        return str;
      }
    };
  }
  
  // Also set on globalThis and global
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.TextEncoder) (globalThis as any).TextEncoder = window.TextEncoder;
    if (!globalThis.TextDecoder) (globalThis as any).TextDecoder = window.TextDecoder;
  }
  
  if (typeof global !== 'undefined') {
    if (!(global as any).TextEncoder) (global as any).TextEncoder = window.TextEncoder;
    if (!(global as any).TextDecoder) (global as any).TextDecoder = window.TextDecoder;
  }
}

export default function PolyfillProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Re-ensure on mount in case something cleared them
    if (typeof window !== 'undefined') {
      if (!window.TextEncoder) {
        (window as any).TextEncoder = class TextEncoder {
          encode(str: string): Uint8Array {
            const buf = new ArrayBuffer(str.length * 3);
            const bufView = new Uint8Array(buf);
            let idx = 0;
            for (let i = 0; i < str.length; i++) {
              let charCode = str.charCodeAt(i);
              if (charCode < 0x80) {
                bufView[idx++] = charCode;
              } else if (charCode < 0x800) {
                bufView[idx++] = 0xc0 | (charCode >> 6);
                bufView[idx++] = 0x80 | (charCode & 0x3f);
              } else {
                bufView[idx++] = 0xe0 | (charCode >> 12);
                bufView[idx++] = 0x80 | ((charCode >> 6) & 0x3f);
                bufView[idx++] = 0x80 | (charCode & 0x3f);
              }
            }
            return bufView.slice(0, idx);
          }
        };
      }
      
      if (!window.TextDecoder) {
        (window as any).TextDecoder = class TextDecoder {
          decode(arr: Uint8Array): string {
            let str = '';
            for (let i = 0; i < arr.length; i++) {
              str += String.fromCharCode(arr[i]);
            }
            return str;
          }
        };
      }
      
      // Also set on globalThis and global
      if (typeof globalThis !== 'undefined') {
        if (!globalThis.TextEncoder) (globalThis as any).TextEncoder = window.TextEncoder;
        if (!globalThis.TextDecoder) (globalThis as any).TextDecoder = window.TextDecoder;
      }
      
      if (typeof global !== 'undefined') {
        if (!(global as any).TextEncoder) (global as any).TextEncoder = window.TextEncoder;
        if (!(global as any).TextDecoder) (global as any).TextDecoder = window.TextDecoder;
      }
    }
  }, []);
  
  return <>{children}</>;
}
