# Kappa Web Widget Example (Next.js)

Minimal Next.js app that consumes the published SDK widget.

## Install & Run

```bash
npm install
npm i kappa-sdk
npm run dev
```

- Open http://localhost:3000
- Connect a wallet via the button
- Paste a token contract `0x...::Module::TOKEN` or search by name/symbol
- Enter SUI amount to buy or token units to sell

## Importing the widget

This example imports from the published package subpath:

```ts
import { WidgetStandalone, WidgetEmbedded } from 'kappa-sdk/react';
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

## Usage patterns

### Standalone (plug-and-play)

```tsx
import { WidgetStandalone } from 'kappa-sdk/react';

export default function Page() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
      <WidgetStandalone />
    </div>
  );
}
```

Optional props:

```tsx
<WidgetStandalone
  projectName="Kappa"
  logoUrl="https://your.cdn/logo.png"
  theme={{ '--kappa-primary': '#8b5cf6' }}
  defaultContract="0x...::My_Coin::MY_COIN"
  lockContract={false}
/>
```

### Integrated (reuse your app providers)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { WidgetEmbedded } from 'kappa-sdk/react';

const { networkConfig } = createNetworkConfig({ mainnet: { url: 'https://fullnode.mainnet.sui.io:443' } });
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <WidgetEmbedded defaultContract="0x...::My_Coin::MY_COIN" />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

### Default token examples

- Preload a default token but allow changes:

```tsx
<WidgetStandalone defaultContract="0x...::My_Coin::MY_COIN" />
```

- Lock to a single token (no search):

```tsx
<WidgetEmbedded defaultContract="0x...::My_Coin::MY_COIN" lockContract />
```
