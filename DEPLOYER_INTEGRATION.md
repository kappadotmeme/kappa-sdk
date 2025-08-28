# Kappa Deployer Widget Integration Guide

The Kappa Deployer Widget allows third-party projects to integrate a fully-featured token deployment interface into their applications. This guide covers how to use the widget with custom module configurations, theming, and branding.

## Installation

```bash
npm install kappa-create
# or
yarn add kappa-create
```

## Quick Start

### Using Default Configuration (Kappa Module)

```jsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <DeployerWidgetStandalone 
      onSuccess={(coinAddress) => {
        console.log('Coin deployed at:', coinAddress);
      }}
    />
  );
}
```

### Using Custom Module Configuration

For third-party projects with their own Sui modules:

```jsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

const myModuleConfig = {
  bondingContract: "0x1234...abcd",  // Your package ID
  CONFIG: "0x5678...efgh",           // Your CONFIG object
  globalPauseStatusObjectId: "0x9abc...ijkl",
  poolsId: "0xdef0...mnop",
  moduleName: "my_custom_module",    // Your module name
  lpBurnManger: "0xqrst...uvwx"      // Optional
};

function App() {
  return (
    <DeployerWidgetStandalone 
      network={myModuleConfig}
      projectName="My Project"
      logoUrl="https://myproject.com/logo.png"
      onSuccess={(coinAddress) => {
        console.log('Coin deployed at:', coinAddress);
      }}
    />
  );
}
```

## Widget Variants

### 1. Standalone Widget
Includes all required providers (wallet, query client, etc.):

```jsx
import { DeployerWidgetStandalone } from 'kappa-create/react';

<DeployerWidgetStandalone {...props} />
```

### 2. Embedded Widget
For apps that already have wallet providers set up:

```jsx
import { DeployerWidgetEmbedded } from 'kappa-create/react';

// Wrap with your existing providers
<WalletProvider>
  <DeployerWidgetEmbedded {...props} />
</WalletProvider>
```

### 3. Integrated Widget
For maximum integration with existing app infrastructure:

```jsx
import { DeployerWidgetIntegrated } from 'kappa-create/react';

<DeployerWidgetIntegrated {...props} />
```

## Configuration Options

### Module Configuration

```typescript
interface ModuleConfig {
  bondingContract?: string;           // Package ID of your module
  CONFIG?: string;                    // CONFIG object ID
  globalPauseStatusObjectId?: string; // Global pause status object
  poolsId?: string;                   // Pools object ID
  moduleName?: string;                // Module name (default: "kappadotmeme")
  lpBurnManger?: string;              // LP burn manager object (optional)
}
```

If not provided, the widget uses the default Kappa module configuration.

### Props Reference

```typescript
interface DeployerWidgetProps {
  // Module configuration
  network?: ModuleConfig;
  
  // Callback when deployment succeeds
  onSuccess?: (coinAddress: string) => void;
  
  // Default SUI amount for developer buy (default: "5")
  defaultDevBuySui?: string;
  
  // UI customization
  maxWidth?: number;          // Max width in pixels
  logoUrl?: string;           // Your project logo
  projectName?: string;       // Your project name
  theme?: Partial<Theme>;     // Custom theme colors
}
```

## Theming

Customize the widget appearance to match your brand:

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
  '--kappa-chip-bg': '#2a2b37',
  '--kappa-chip-border': '#3a3b47',
  '--kappa-avatar-bg': '#3a3b47'
};

<DeployerWidgetStandalone
  theme={customTheme}
  logoUrl="/my-logo.png"
  projectName="My DEX"
/>
```

### Available Theme Variables

- `--kappa-bg`: Main background color
- `--kappa-panel`: Panel/card background
- `--kappa-input-bg`: Input field background
- `--kappa-border`: Border color
- `--kappa-text`: Primary text color
- `--kappa-muted`: Secondary/muted text
- `--kappa-accent`: Accent color for links
- `--kappa-primary`: Primary button color
- `--kappa-text-on-primary`: Text on primary buttons
- `--kappa-success`: Success state color
- `--kappa-error`: Error state color
- `--kappa-chip-bg`: Chip/tag background
- `--kappa-chip-border`: Chip/tag border
- `--kappa-avatar-bg`: Avatar placeholder background

## Complete Example

```jsx
import React from 'react';
import { DeployerWidgetStandalone } from 'kappa-create/react';

function MyTokenLauncher() {
  // Custom module configuration
  const moduleConfig = {
    bondingContract: "0x32fb837874e2d42a77b77a058e170024daadc54245b29b5b8a684b0540010fbb",
    CONFIG: "0x93fbfbbe2f65326332a68ee930c069f8e3816f03c8a9f978ec5ce9c82cdae4b0",
    globalPauseStatusObjectId: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
    poolsId: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
    moduleName: "kappadotmeme"
  };

  // Custom theme
  const theme = {
    '--kappa-bg': '#0a0e1a',
    '--kappa-primary': '#ff6b35',
    '--kappa-accent': '#4ecdc4'
  };

  // Handle successful deployment
  const handleSuccess = (coinAddress) => {
    console.log('Token deployed successfully!');
    console.log('Contract address:', coinAddress);
    
    // Redirect to token page, save to database, etc.
    window.location.href = `/token/${coinAddress}`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Launch Your Token</h1>
      
      <DeployerWidgetStandalone
        network={moduleConfig}
        theme={theme}
        logoUrl="/logo.svg"
        projectName="My DEX"
        defaultDevBuySui="10"
        maxWidth={600}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default MyTokenLauncher;
```

## TypeScript Support

The package includes full TypeScript definitions:

```typescript
import { 
  DeployerWidgetStandalone, 
  DeployerWidgetProps,
  ModuleConfig 
} from 'kappa-create/react';

const config: ModuleConfig = {
  bondingContract: "0x...",
  // ... other config
};

const props: DeployerWidgetProps = {
  network: config,
  onSuccess: (address: string) => console.log(address),
  // ... other props
};
```

## Default Configuration

When no `network` prop is provided, the widget uses the default Kappa module configuration on Sui mainnet:

- **bondingContract**: `0x32fb837874e2d42a77b77a058e170024daadc54245b29b5b8a684b0540010fbb`
- **CONFIG**: `0x93fbfbbe2f65326332a68ee930c069f8e3816f03c8a9f978ec5ce9c82cdae4b0`
- **globalPauseStatusObjectId**: `0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f`
- **poolsId**: `0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0`
- **moduleName**: `kappadotmeme`

## Requirements

- React 18+
- Sui wallet (e.g., Sui Wallet, Suiet, etc.)
- Node.js 16+

## Support

For issues or questions, please visit: https://github.com/kappadotmeme/Kappa-SDK-v2

## License

MIT
