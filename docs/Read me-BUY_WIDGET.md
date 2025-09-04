# Kappa Trading Widget

Add a complete buy/sell interface for tokens on Sui using the Kappa protocol. Drop-in UI with wallet connection (Standalone) or integrate with your existing providers.

## Installation

```bash
npm install kappa-create @tanstack/react-query @mysten/dapp-kit @mysten/sui
```

## Widget Variants

### 1) Standalone (Recommended)
Includes wallet + client providers built-in.

```jsx
import { WidgetV2Standalone } from 'kappa-create/react';

function App() {
  return (
    <WidgetV2Standalone 
      projectName="My DEX"
      defaultContract="0xabc...::Token::TOKEN"
      lockContract={false}  // Optional: set to true to lock token selection
    />
  );
}
```

### 2) Embedded
Use when your app already provides wallet/context wrappers.

```jsx
import { WidgetV2Embedded } from 'kappa-create/react';

function TradingSection({ selected }) {
  return (
    <WidgetV2Embedded 
      defaultContract={selected}
      lockContract={false}  // Set to true to prevent token changes
    />
  );
}
```

### 3) Note on Variants
WidgetV2 currently supports two variants:
- **WidgetV2Standalone**: Includes all providers (recommended)
- **WidgetV2Embedded**: For apps with existing providers

There is no separate Integrated variant for WidgetV2.
```

## Props

```ts
// From kappa-create/react
export interface WidgetProps {
  theme?: Record<string, string>;
  defaultContract?: string;
  lockContract?: boolean;  // Lock token selection when true
  logoUrl?: string;
  projectName?: string;
  apiBase?: string;  // API endpoint configuration
  network?: any;  // Custom network configuration
}
```

- **theme**: CSS variable map for theming.
- **defaultContract**: Contract type, e.g. `0x...::Token::TOKEN`.
- **lockContract**: If true, prevents token selection changes (useful for fixed-token interfaces).
- **logoUrl**: Brand logo in header (40x40px).
- **projectName**: Title in header.
- **apiBase**: API endpoint (defaults to '/api' for proxy or 'https://api.kappa.fun').
- **network**: Custom module configuration for third-party bonding curves.

## Theming

Pass CSS variables to match your brand.

```jsx
<WidgetV2Standalone
  theme={{
    '--kappa-bg': '#0f1218',
    '--kappa-panel': '#1a1d24',
    '--kappa-border': '#2a2f3a',
    '--kappa-text': '#ffffff',
    '--kappa-muted': '#9ca3af',
    '--kappa-primary': '#2563eb',
    '--kappa-success': '#10b981',
    '--kappa-error': '#ef4444',
    '--kappa-accent': '#7aa6cc'
  }}
/>
```

Common variables:
- `--kappa-bg`, `--kappa-panel`, `--kappa-border`
- `--kappa-text`, `--kappa-muted`
- `--kappa-primary`, `--kappa-success`, `--kappa-error`
- `--kappa-accent`

## Examples

### Minimal Next.js page
```jsx
import { WidgetV2Standalone } from 'kappa-create/react';

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <WidgetV2Standalone 
        projectName="My DEX"
        defaultContract="0xabc...::Token::TOKEN"
        lockContract={false}
      />
    </main>
  );
}
```

### Custom layout with Embedded variant
```jsx
import { WidgetV2Embedded } from 'kappa-create/react';

function TradingApp({ selectedToken, theme }) {
  return (
    <div className="trading-container">
      <header>My Header</header>
      <WidgetV2Embedded 
        defaultContract={selectedToken}
        lockContract={true}  // Locks the token selection
        theme={theme}
      />
      <footer>My Footer</footer>
    </div>
  );
}
```

## Features

- **Smart Token Detection**: Automatically loads token metadata and factory configurations
- **Dynamic Module Support**: Auto-detects and uses appropriate bonding curve modules
- **Built-in Slippage Control**: Configurable slippage settings (0.5%, 1%, 2%, 5% presets)
- **Real-time Quotes**: Live price calculations using bonding curve math
- **Balance Display**: Shows SUI and token balances
- **Quick Amount Selection**: 25%, 50%, 75%, MAX buttons for easy input
- **Token Search**: Search by name, symbol, or contract address
- **Trending Tokens**: Shows popular tokens when opening selector
- **Skeleton Loading**: Smooth loading animations for better UX
- **Mobile Responsive**: Adapts to mobile screens automatically

## Tips

- **Lock Contract**: Use `lockContract={true}` for single-token interfaces
- **Custom Theme**: Match your brand with CSS variables
- **API Proxy**: Configure `apiBase` to avoid CORS issues
- **Network Config**: Pass custom module config for third-party curves

## Related Docs

- SDK usage: `./README_SDK.md`
- Deployer widget: `./README_DEPLOYER.md`

## Requirements

- React 18+
- Node.js 16+
- Sui wallet extension for Web3

## License

MIT
