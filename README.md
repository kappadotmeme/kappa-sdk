# Kappa Create SDK

Complete SDK and React components for creating and trading tokens on Sui with Kappa Protocol. Build token launchers, trading interfaces, and integrate bonding curves into your dApp.

[![npm version](https://img.shields.io/npm/v/kappa-create.svg)](https://www.npmjs.com/package/kappa-create)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 Docs

- **SDK**: [docs/Read me-SDK.md](./docs/Read%20me-SDK.md)
- **Trading Widget**: [docs/Read me-BUY_WIDGET.md](./docs/Read%20me-BUY_WIDGET.md)
- **Deployer Widget**: [docs/Read me-DEPLOYER.md](./docs/Read%20me-DEPLOYER.md)
- **Theming Guide**: [docs/THEMING.md](./docs/THEMING.md)

## 🚀 Features

- **Token Creation**: Deploy tokens with bonding curves on Sui
- **Trading SDK**: Buy/sell tokens programmatically  
- **React Widgets**: Pre-built, customizable UI components
- **Multi-Module Support**: Automatic detection of different bonding curve modules
- **Third-party Ready**: Use your own Sui modules
- **Advanced Theming**: 100+ CSS variables for complete customization
- **Smart Features**: Intelligent MAX button (97% SUI, balance-1 for tokens)
- **Token Search**: Search by name, symbol, or contract address
- **Real-time Quotes**: Live price calculations with slippage protection
- **TypeScript Support**: Complete type definitions

## 📦 Installation

```bash
npm install kappa-create
```

For React widgets:
```bash
npm install kappa-create @tanstack/react-query @mysten/dapp-kit @mysten/sui
```

## 🎯 Quick Start

### Trading Widget
Add a complete trading interface in one line:

```jsx
import { WidgetV2Standalone } from 'kappa-create/react';

function App() {
  return (
    <WidgetV2Standalone 
      defaultContract="0xabc...::Token::TOKEN"
      projectName="My DEX"
      lockContract={false}  // Optional: lock token selection
    />
  );
}
```

### Token Deployer Widget
Let users create tokens directly from your app:

```jsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <DeployerWidgetStandalone 
      onSuccess={(coinAddress) => {
        console.log('Token deployed:', coinAddress);
      }}
      projectName="My Platform"
    />
  );
}
```

### SDK Usage
Programmatic token operations:

```javascript
const { createToken, buyTokens, sellTokens } = require('kappa-create');

// Create a token
await createToken({
  signer,
  name: 'My Token',
  symbol: 'MTK',
  description: 'An awesome token',
  icon: 'https://example.com/icon.png'
});

// Trade tokens
await buyTokens({
  signer,
  contract: '0x...::Token::TOKEN',
  suiAmount: 1, // 1 SUI
  slippage: 1   // 1% slippage
});
```

## 📚 Documentation

- **[SDK Documentation](./docs/Read%20me-SDK.md)** - Programmatic token operations
- **[Trading Widget Guide](./docs/Read%20me-BUY_WIDGET.md)** - Buy/sell interface component
- **[Deployer Widget Guide](./docs/Read%20me-DEPLOYER.md)** - Token creation interface
- **[Theming Guide](./docs/THEMING.md)** - Complete theme customization
- **[WASM Bundling](./docs/WASM-BUNDLING.md)** - WASM bundling details

## 🎨 Customization

### Theming
Match your brand with 100+ customizable theme tokens:

```jsx
const theme = {
  // Base colors
  '--kappa-primary': '#007bff',
  '--kappa-bg': '#1a1b23',
  '--kappa-text': '#ffffff',
  '--kappa-accent': '#3b82f6',
  
  // Components
  '--kappa-quick-max-text': '#ef4444',
  '--kappa-token-button-hover-bg': 'rgba(37, 99, 235, 0.1)',
  
  // Effects
  '--kappa-shadow-lg': '0 10px 30px rgba(0,0,0,0.45)',
  '--kappa-radius-xl': '16px',
  
  // Typography
  '--kappa-font-family': 'Inter, system-ui, sans-serif',
  '--kappa-font-size-lg': '16px'
};

<WidgetV2Standalone theme={theme} />
```

See [docs/THEMING.md](./docs/THEMING.md) for all available tokens.

### Third-Party Modules
Use your own Sui modules:

```jsx
const config = {
  bondingContract: "0x1234...",
  CONFIG: "0x5678...",
  moduleName: "my_module"
};

<DeployerWidgetStandalone network={config} />
```

## 🏗️ Widget Variants

### Standalone (Recommended)
Includes all required providers - just drop in and use:
```jsx
import { WidgetV2Standalone, DeployerWidgetStandalone } from 'kappa-create/react';
```

### Embedded
For apps with existing wallet providers:
```jsx
import { WidgetV2Embedded, DeployerWidgetEmbedded } from 'kappa-create/react';
```

### Integrated
Maximum control with existing infrastructure:
```jsx
import { DeployerWidgetIntegrated } from 'kappa-create/react';
// Note: WidgetV2 only has Standalone and Embedded variants
```

## 💡 Examples

### Next.js Token Launcher
```jsx
// pages/launch.tsx
import { DeployerWidgetStandalone } from 'kappa-create/react';
import { useRouter } from 'next/router';

export default function LaunchPage() {
  const router = useRouter();
  
  return (
    <DeployerWidgetStandalone 
      onSuccess={(address) => {
        router.push(`/token/${address}`);
      }}
      projectName="My DEX"
      defaultDevBuySui="0.1"
    />
  );
}
```

### Custom Trading Interface
```jsx
import { WidgetV2Embedded } from 'kappa-create/react';

function TradingApp() {
  return (
    <div className="trading-container">
      <YourHeader />
      <WidgetV2Embedded 
        defaultContract={selectedToken}
        lockContract={true}  // Prevents changing the token
        theme={darkTheme}
      />
      <YourFooter />
    </div>
  );
}
```

### More Examples

- **Full Next.js example app**: [`examples/web-widget/`](./examples/web-widget/)
  - Trading widget and deployer widget pages

## ⚙️ Next.js / Vercel Integration

Add a proxy so the widget can call the Kappa API without CORS issues:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { externalDir: true },
  transpilePackages: [
    'kappa-create',
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@tanstack/react-query',
  ],
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: 'https://api.kappa.fun/v1/:path*' },
    ];
  },
};
module.exports = nextConfig;
```

Use the widget:

```tsx
import { WidgetV2Standalone } from 'kappa-create/react';

export default function App() {
  return (
    <WidgetV2Standalone
      projectName="My DEX"
      defaultContract="0x...::Token::SYMBOL"
      lockContract={false}  // Set to true to lock token selection
      // If you need to force the proxy path:
      // apiBase="/api"
    />
  );
}
```

## 🛠️ Requirements

- Node.js 16+
- React 18+ (for widgets)
- Sui Wallet extension (for Web3 features)

## 📄 License

MIT

## 🤝 Support

- **Documentation**: [https://docs.kappa.fun](https://docs.kappa.fun)
- **GitHub**: [https://github.com/kappa-labs/kappa-sdk](https://github.com/kappa-labs/kappa-sdk)
- **Website**: [https://kappa.fun](https://kappa.fun)

## 🌟 Built With Kappa

Join hundreds of projects using Kappa to power their token economies on Sui.

---

Made with ❤️ by the Kappa team