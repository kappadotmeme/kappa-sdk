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
import { WidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <WidgetStandalone 
      projectName="My DEX"
      defaultContract="0xabc...::Token::TOKEN"
    />
  );
}
```

### 2) Embedded
Use when your app already provides wallet/context wrappers.

```jsx
import { WidgetEmbedded } from 'kappa-create/react';

function TradingSection({ selected }) {
  return (
    <WidgetEmbedded 
      defaultContract={selected}
      lockContract={false}
    />
  );
}
```

### 3) Integrated
Maximum control; render where you already manage providers.

```jsx
import { WidgetIntegrated } from 'kappa-create/react';

export default function Trading() {
  return <WidgetIntegrated defaultContract="0x...::Token::TOKEN" />;
}
```

## Props

```ts
// From kappa-create/react
export interface WidgetProps {
  theme?: Record<string, string>;
  defaultContract?: string;
  lockContract?: boolean;
  logoUrl?: string;
  projectName?: string;
}
```

- **theme**: CSS variable map for theming.
- **defaultContract**: Contract type, e.g. `0x...::Token::TOKEN`.
- **lockContract**: If true, hides contract switch/search.
- **logoUrl**: Brand logo in header.
- **projectName**: Title in header.

## Theming

Pass CSS variables to match your brand.

```jsx
<WidgetStandalone
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
import { WidgetStandalone } from 'kappa-create/react';

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <WidgetStandalone 
        projectName="My DEX"
        defaultContract="0xabc...::Token::TOKEN"
      />
    </main>
  );
}
```

### Custom layout with Embedded variant
```jsx
import { WidgetEmbedded } from 'kappa-create/react';

function TradingApp({ selectedToken, theme }) {
  return (
    <div className="trading-container">
      <header>My Header</header>
      <WidgetEmbedded 
        defaultContract={selectedToken}
        lockContract
        theme={theme}
      />
      <footer>My Footer</footer>
    </div>
  );
}
```

## Tips

- **Quote before trading**: Use SDK quote functions for pre-trade estimates.
- **Slippage**: Always set slippage in SDK trade calls.
- **Cache token info**: Cache results in your app for speed.

## Related Docs

- SDK usage: `./README_SDK.md`
- Deployer widget: `./README_DEPLOYER.md`

## Requirements

- React 18+
- Node.js 16+
- Sui wallet extension for Web3

## License

MIT
