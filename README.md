# Kappa Create SDK

Complete SDK and React components for creating and trading tokens on Sui with Kappa Protocol. Build token launchers, trading interfaces, and integrate bonding curves into your dApp.

[![npm version](https://img.shields.io/npm/v/kappa-create.svg)](https://www.npmjs.com/package/kappa-create)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 Docs

- **SDK**: [README_SDK.md](./README_SDK.md)
- **Trading Widget**: [README_BUY_WIDGET.md](./README_BUY_WIDGET.md)
- **Deployer Widget**: [README_DEPLOYER.md](./README_DEPLOYER.md)

## 🚀 Features

- **Token Creation**: Deploy tokens with bonding curves on Sui
- **Trading SDK**: Buy/sell tokens programmatically  
- **React Widgets**: Pre-built, customizable UI components
- **Multi-Module Support**: Automatic detection of different bonding curve modules
- **Third-party Ready**: Use your own Sui modules
- **Full Theming**: Match your brand identity
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
import { WidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <WidgetStandalone 
      defaultContract="0xabc...::Token::TOKEN"
      projectName="My DEX"
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

- **[SDK Documentation](./README_SDK.md)** - Programmatic token operations
- **[Trading Widget Guide](./README_BUY_WIDGET.md)** - Buy/sell interface component
- **[Deployer Widget Guide](./README_DEPLOYER.md)** - Token creation interface

## 🎨 Customization

### Theming
Match your brand with custom themes:

```jsx
const theme = {
  '--kappa-primary': '#007bff',
  '--kappa-bg': '#1a1b23',
  '--kappa-text': '#ffffff'
};

<WidgetStandalone theme={theme} />
```

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
import { WidgetStandalone, DeployerWidgetStandalone } from 'kappa-create/react';
```

### Embedded
For apps with existing wallet providers:
```jsx
import { WidgetEmbedded, DeployerWidgetEmbedded } from 'kappa-create/react';
```

### Integrated
Maximum control with existing infrastructure:
```jsx
import { WidgetIntegrated, DeployerWidgetIntegrated } from 'kappa-create/react';
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
import { WidgetEmbedded } from 'kappa-create/react';

function TradingApp() {
  return (
    <div className="trading-container">
      <YourHeader />
      <WidgetEmbedded 
        defaultContract={selectedToken}
        lockContract={true}
        theme={darkTheme}
      />
      <YourFooter />
    </div>
  );
}
```

### More Examples

- Multi-module integration example: [`examples/multi-module-integration.tsx`](./examples/multi-module-integration.tsx)
- Third-party embed (vanilla HTML): [`examples/third-party-integration.html`](./examples/third-party-integration.html)
- Full test app with routes and helpers: [`testing/web-widget`](./testing/web-widget)

## 🛠️ Requirements

- Node.js 16+
- React 18+ (for widgets)
- Sui Wallet extension (for Web3 features)

## 📄 License

MIT

## 🤝 Support

- **Documentation**: [https://docs.kappa.fun](https://docs.kappa.fun)
- **GitHub**: [https://github.com/kappadotmeme/kappa-sdk](https://github.com/kappa-labs/kappa-sdk)
- **Website**: [https://kappa.fun](https://kappa.fun)

## 🌟 Built With Kappa

Join hundreds of projects using Kappa to power their token economies on Sui.

---

Made with ❤️ by the Kappa team