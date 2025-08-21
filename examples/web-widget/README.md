# Kappa Web Widget Example (Next.js)

Minimal Next.js app that consumes the published SDK widget.

## Install & Run

```bash
npm install
npm run dev
```

- Open http://localhost:3000
- Connect a wallet via the button
- Paste a token contract `0x...::Module::TOKEN` or search by name/symbol
- Enter SUI amount to buy or token units to sell

## Importing the widget

This example imports from the published package subpath:

```ts
import { WidgetStandalone } from 'kappa-sdk/react';
```

If you are developing locally against the workspace package, ensure your Next config allows external transpilation:

```js
// next.config.js
export default {
  experimental: { externalDir: true },
  transpilePackages: ['kappa-sdk', '@mysten/dapp-kit', '@mysten/sui', '@tanstack/react-query'],
};
```

Note: Token deployment (create/curve) is server-only: use `kappa-sdk/server` from a Node environment. Never ship private keys to the browser.
