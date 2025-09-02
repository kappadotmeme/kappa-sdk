// Polyfill for TextEncoder/TextDecoder
// This file is imported at the top of the app to ensure these are available

/* global window */
if (typeof window !== 'undefined') {
  // Ensure TextEncoder is available on all global objects
  if (!global.TextEncoder && window.TextEncoder) {
    global.TextEncoder = window.TextEncoder;
  }
  if (!global.TextDecoder && window.TextDecoder) {
    global.TextDecoder = window.TextDecoder;
  }
  if (!globalThis.TextEncoder && window.TextEncoder) {
    globalThis.TextEncoder = window.TextEncoder;
  }
  if (!globalThis.TextDecoder && window.TextDecoder) {
    globalThis.TextDecoder = window.TextDecoder;
  }
  
  // Also ensure it's available as a global constructor
  if (!global.TextEncoder) {
    global.TextEncoder = TextEncoder;
  }
  if (!global.TextDecoder) {
    global.TextDecoder = TextDecoder;
  }
}
