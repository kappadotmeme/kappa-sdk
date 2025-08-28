# Kappa Create SDK (Sui)

Complete SDK and React components for creating and trading tokens on Sui with Kappa Protocol. Includes customizable DeployerWidget and TradeWidget with full theming support.

## Features

- 🚀 **Token Creation**: Deploy tokens with bonding curves on Sui
- 💱 **Trading SDK**: Buy/sell tokens programmatically  
- 🎨 **React Widgets**: Pre-built, customizable UI components
- 🎯 **Third-party Support**: Use your own Sui modules
- 🌈 **Full Theming**: Match your brand identity
- 📦 **TypeScript Ready**: Full type definitions included

## Install

```bash
npm install kappa-create @mysten/sui @mysten/bcs
```

For React widgets in a Next/React app:

```bash
npm install kappa-create @tanstack/react-query @mysten/dapp-kit @mysten/sui react react-dom
```

## Quick Start

### React Widgets

#### Trade Widget
```jsx
import { WidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <WidgetStandalone 
      defaultContract="0xabc...::my_token::MY_TOKEN"
      theme={{ '--kappa-primary': '#ff6b35' }}
      logoUrl="/logo.png"
      projectName="My DEX"
    />
  );
}
```

#### Deployer Widget
```jsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <DeployerWidgetStandalone 
      onSuccess={(coinAddress) => {
        console.log('Token deployed:', coinAddress);
      }}
      theme={{ '--kappa-primary': '#007bff' }}
      projectName="My Platform"
    />
  );
}
```

### SDK Usage (Node.js)

```js
const { initKappa, buyTokens, sellTokens } = require('kappa-create');
const { createToken } = require('kappa-create/server'); // server-only
const { SuiClient, getFullnodeUrl, Ed25519Keypair } = require('@mysten/sui');

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
initKappa({ client, logger: console.log });

// Your signer
const signer = Ed25519Keypair.fromSecretKey(/* Uint8Array secret key */);

// Create token (server-only)
await createToken({
  signer,
  name: 'My Coin', 
  symbol: 'MYC', 
  description: 'My awesome token',
  icon: 'https://example.com/icon.png',
  firstBuy: { suiInMist: 100_000_000, minTokensOut: 0 },
});

// Buy tokens
await buyTokens({
  signer,
  contract: '0x...::My_Coin::MY_COIN',
  suiInMist: 50_000_000,
  minTokensOut: 0,
});

// Sell tokens
await sellTokens({
  signer,
  contract: '0x...::My_Coin::MY_COIN',
  tokensIn: 1_000_000_000,
  minSuiOut: 0,
});
```

## Third-Party Module Integration

Use your own Sui modules with custom configuration:

```jsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

const myModuleConfig = {
  bondingContract: "0x1234...abcd",  // Your package ID
  CONFIG: "0x5678...efgh",           // Your CONFIG object
  globalPauseStatusObjectId: "0x9abc...ijkl",
  poolsId: "0xdef0...mnop",
  moduleName: "my_custom_module",    // Your module name
};

<DeployerWidgetStandalone 
  network={myModuleConfig}
  projectName="My Protocol"
  onSuccess={(address) => console.log(address)}
/>
```

## Widget Theming

Customize widgets to match your brand:

```jsx
const customTheme = {
  '--kappa-bg': '#1a1b23',
  '--kappa-panel': '#252631',
  '--kappa-input-bg': '#1f2029',
  '--kappa-border': '#3a3b47',
  '--kappa-text': '#ffffff',
  '--kappa-muted': '#a0a0a0',
  '--kappa-accent': '#00d4ff',
  '--kappa-primary': '#007bff',
  '--kappa-text-on-primary': '#ffffff',
  '--kappa-success': '#28a745',
  '--kappa-error': '#dc3545',
};

<WidgetStandalone theme={customTheme} />
```

## Widget Variants

### Standalone
Includes all required providers:
```jsx
import { WidgetStandalone, DeployerWidgetStandalone } from 'kappa-create/react';
```

### Embedded
For apps with existing wallet providers:
```jsx
import { WidgetEmbedded, DeployerWidgetEmbedded } from 'kappa-create/react';
```

### Integrated
Maximum integration with existing infrastructure:
```jsx
import { DeployerWidgetIntegrated } from 'kappa-create/react';
```

## API Reference

### Widget Props

#### Trade Widget
```typescript
interface WidgetProps {
  theme?: Partial<WidgetTheme>;
  defaultContract?: string;
  lockContract?: boolean;
  logoUrl?: string;
  projectName?: string;
}
```

#### Deployer Widget
```typescript
interface DeployerWidgetProps {
  network?: ModuleConfig;
  onSuccess?: (coinAddress: string) => void;
  defaultDevBuySui?: string;
  theme?: Partial<WidgetTheme>;
  maxWidth?: number;
  logoUrl?: string;
  projectName?: string;
}
```

### SDK Functions

#### initKappa(options)
Initialize the SDK with a Sui client.

#### createToken(params) 
Create and launch a new token (server-only).

#### buyTokens(params)
Buy tokens from a bonding curve.

#### sellTokens(params)
Sell tokens back to a bonding curve.

#### listCoins(options)
List trending/all coins from Kappa API.

#### quoteBuy(contract, suiInMist)
Get quote for buying tokens.

#### quoteSell(contract, tokensIn)
Get quote for selling tokens.

## Examples

### Next.js Integration
```jsx
// pages/launch.tsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

export default function LaunchPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Launch Your Token</h1>
      <DeployerWidgetStandalone 
        onSuccess={(address) => {
          router.push(`/token/${address}`);
        }}
      />
    </div>
  );
}
```

### Custom Wallet Integration
```jsx
import { DeployerWidgetEmbedded } from 'kappa-create/react';
import { WalletProvider } from '@mysten/dapp-kit';

function App() {
  return (
    <WalletProvider>
      <DeployerWidgetEmbedded 
        network={customConfig}
        theme={customTheme}
      />
    </WalletProvider>
  );
}
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { 
  DeployerWidgetStandalone, 
  DeployerWidgetProps,
  ModuleConfig,
  WidgetTheme 
} from 'kappa-create/react';
```

## Documentation

- [Deployer Widget Integration Guide](./DEPLOYER_INTEGRATION.md)
- [API Documentation](https://docs.kappa.meme)
- [Example App](./examples/web-widget)

## Requirements

- Node.js 16+
- React 18+ (for widgets)
- Sui wallet (for Web3 features)

## License

MIT

## Support

- GitHub: https://github.com/kappa-labs/kappa-create
- Discord: https://discord.gg/kappa
- Website: https://kappa.meme