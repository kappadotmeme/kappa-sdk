# Kappa Deployer Widget

A React component for launching tokens on Sui with the Kappa protocol. Supports default Kappa modules and third-party/partner modules via configuration. Provides Standalone, Embedded, and Integrated variants.

## Installation

```bash
npm install kappa-create @tanstack/react-query @mysten/dapp-kit @mysten/sui
```

## Quick Start

### Standalone (Recommended)
Includes wallet + client providers.

```jsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <DeployerWidgetStandalone
      onSuccess={(coinAddress) => {
        console.log('Token created:', coinAddress);
      }}
      projectName="My Platform"
      defaultDevBuySui="0.5"
    />
  );
}
```

### Integrated
Use when your app already mounts dapp-kit providers.

```jsx
import { DeployerWidgetIntegrated } from 'kappa-create/react';

export default function Page() {
  return (
    <DeployerWidgetIntegrated
      onSuccess={(addr) => console.log(addr)}
    />
  );
}
```

### Embedded
UI-only; bring your own providers.

```jsx
import { DeployerWidgetEmbedded } from 'kappa-create/react';

function Section() {
  return (
    <DeployerWidgetEmbedded defaultDevBuySui="1" />
  );
}
```

## Props

```ts
export interface ModuleConfig {
  bondingContract?: string;
  CONFIG?: string;
  globalPauseStatusObjectId?: string;
  poolsId?: string;
  moduleName?: string;
  lpBurnManger?: string;
}

export interface DeployerWidgetProps {
  network?: ModuleConfig;                // Optional; defaults to Kappa mainnet module
  onSuccess?: (coinAddress: string) => void;
  defaultDevBuySui?: string;             // Default: "5"
  maxWidth?: number;                     // Default: 500
  logoUrl?: string;                      // Brand logo in header
  projectName?: string;                  // Header title (default: "Kappa Deployer")
  theme?: Record<string, string>;        // CSS variables
}
```

## Theming

```jsx
<DeployerWidgetStandalone
  theme={{
    '--kappa-bg': '#0f1218',
    '--kappa-panel': '#1a1d24',
    '--kappa-input-bg': '#0b0d12',
    '--kappa-border': '#2a2f3a',
    '--kappa-text': '#ffffff',
    '--kappa-muted': '#9ca3af',
    '--kappa-accent': '#7aa6cc',
    '--kappa-primary': '#2563eb',
    '--kappa-text-on-primary': '#ffffff',
    '--kappa-success': '#10b981',
    '--kappa-error': '#ef4444',
    '--kappa-chip-bg': '#151c26',
    '--kappa-chip-border': '#274057'
  }}
/>
```

## Third-Party Modules

Provide your own module configuration to deploy with non-default factories.

```jsx
const myModuleConfig = {
  bondingContract: '0x044a2e...7999f6',
  CONFIG: '0xad40a3...6016df8',
  globalPauseStatusObjectId: '0xdaa462...67a3d8f',
  poolsId: '0xf699e7...87d198d0',
  moduleName: 'kappadotmeme_partner',
  lpBurnManger: '0x1d94aa...04f845',
};

<DeployerWidgetStandalone
  network={myModuleConfig}
  projectName="My DEX"
  onSuccess={(address) => window.location.href = `https://kappa.fun/coin/${address}`}
/>
```

If `network` is omitted, the widget uses Kappa mainnet defaults:

- `bondingContract`: `0x9329aacc5381a7c6e419a22b7813361c4efc46cf20846f8247bf4a7bd352857c`
- `CONFIG`: `0x51246bdee8ba0ba1ffacc1d8cd41b2b39eb4630beddcdcc4c50287bd4d791a6c`
- `globalPauseStatusObjectId`: `0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f`
- `poolsId`: `0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0`
- `moduleName`: `kappadotmeme`

## Notes

- Requires a Web3 wallet for signing (Sui Wallet, Suiet, etc.).
- Initial buy (`defaultDevBuySui`) must be ≥ 0.1 SUI.
- Host apps using the Embedded/Integrated variants must provide dapp-kit providers.

## Related Docs

- Trading widget: `./README_BUY_WIDGET.md`
- SDK usage: `./README_SDK.md`

## Requirements

- React 18+
- Node.js 16+
- Sui wallet extension

## License

MIT
