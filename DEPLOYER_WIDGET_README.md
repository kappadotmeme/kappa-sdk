# Kappa Deployer Widget

A React component for deploying tokens on the Sui blockchain using the Kappa protocol.

## Installation

```bash
npm install kappa-create
# or
yarn add kappa-create
```

## Usage

The Deployer Widget comes in three variants:

### 1. Standalone Version (Recommended for quick integration)

Includes all necessary providers and wallet connection UI:

```jsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <DeployerWidgetStandalone
      network={{
        bondingContract: '0x860ca3287542b1eedc5880732b290d49f40f8dc3ad5365a4efb2692e533f3de9',
        CONFIG: '0x3e87697f5a0fa4f53c4121cec630f2e3399c47e66198339a895ad26e9ecb388a'
      }}
      onSuccess={(coinAddress) => {
        console.log('Token created:', coinAddress);
      }}
      defaultDevBuySui="0.1"
      logoUrl="https://yoursite.com/logo.png"
      projectName="Your Project"
    />
  );
}
```

### 2. Integrated Version (For apps with existing Sui providers)

Use this if your app already has `@mysten/dapp-kit` providers:

```jsx
import { DeployerWidgetIntegrated } from 'kappa-create/react';
import { WalletProvider, SuiClientProvider } from '@mysten/dapp-kit';

function App() {
  return (
    <WalletProvider>
      <SuiClientProvider>
        <DeployerWidgetIntegrated
          network={{
            bondingContract: '0x860ca3287542b1eedc5880732b290d49f40f8dc3ad5365a4efb2692e533f3de9',
            CONFIG: '0x3e87697f5a0fa4f53c4121cec630f2e3399c47e66198339a895ad26e9ecb388a'
          }}
          onSuccess={(coinAddress) => {
            console.log('Token created:', coinAddress);
          }}
        />
      </SuiClientProvider>
    </WalletProvider>
  );
}
```

### 3. Embedded Version (For advanced use cases)

Provides just the UI component without any wrapper:

```jsx
import { DeployerWidgetEmbedded } from 'kappa-create/react';

function App() {
  return (
    <DeployerWidgetEmbedded
      network={{
        bondingContract: '0x860ca3287542b1eedc5880732b290d49f40f8dc3ad5365a4efb2692e533f3de9',
        CONFIG: '0x3e87697f5a0fa4f53c4121cec630f2e3399c47e66198339a895ad26e9ecb388a'
      }}
      onSuccess={(coinAddress) => {
        console.log('Token created:', coinAddress);
      }}
    />
  );
}
```

## Props

All versions accept the following props:

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `network` | `{ bondingContract: string, CONFIG: string }` | Network configuration with contract addresses | Required |
| `onSuccess` | `(coinAddress: string) => void` | Callback when token is successfully created | - |
| `defaultDevBuySui` | `string` | Default amount of SUI for initial buy | `"0.1"` |
| `maxWidth` | `number` | Maximum width of the widget in pixels | `500` |
| `logoUrl` | `string` | URL of your project logo | Kappa logo |
| `projectName` | `string` | Name displayed in the widget header | `"Kappa Deployer"` |
| `theme` | `object` | Custom theme colors (see Theming section) | Default theme |

## Theming

Customize the widget appearance by passing a theme object:

```jsx
<DeployerWidgetStandalone
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

## TypeScript Support

The package includes TypeScript definitions. Import types as needed:

```typescript
import { 
  DeployerWidgetStandalone,
  DeployerWidgetProps 
} from 'kappa-create/react';

const config: DeployerWidgetProps = {
  network: {
    bondingContract: '0x...',
    CONFIG: '0x...'
  },
  onSuccess: (coinAddress: string) => {
    console.log(coinAddress);
  }
};
```

## Requirements

- React 16.8+ (for hooks support)
- Modern browser with Web3 wallet extension (Sui Wallet, Suiet, etc.)

## Network Configuration

The widget requires two contract addresses:

- `bondingContract`: The main bonding curve contract address
- `CONFIG`: The configuration object address

These addresses are specific to your deployment on Sui mainnet or testnet.

## Example Integration

```jsx
import React, { useState } from 'react';
import { DeployerWidgetStandalone } from 'kappa-create/react';

function TokenLauncher() {
  const [createdToken, setCreatedToken] = useState(null);

  return (
    <div>
      <h1>Launch Your Token</h1>
      
      <DeployerWidgetStandalone
        network={{
          bondingContract: '0x860ca3287542b1eedc5880732b290d49f40f8dc3ad5365a4efb2692e533f3de9',
          CONFIG: '0x3e87697f5a0fa4f53c4121cec630f2e3399c47e66198339a895ad26e9ecb388a'
        }}
        onSuccess={(coinAddress) => {
          setCreatedToken(coinAddress);
          // Redirect to token page
          window.location.href = `https://kappa.fun/coin/${coinAddress}`;
        }}
        defaultDevBuySui="0.5"
        logoUrl="/logo.png"
        projectName="My DeFi Project"
        theme={{
          '--kappa-primary': '#ff6b6b',
          '--kappa-bg': '#1a1a1a'
        }}
      />

      {createdToken && (
        <div>
          <h2>Token Created!</h2>
          <p>Address: {createdToken}</p>
        </div>
      )}
    </div>
  );
}
```

## License

MIT
