# Kappa Trading Widget V2

A powerful, customizable trading interface for tokens on Sui using the Kappa protocol. Features wallet connection, real-time quotes, and comprehensive theming support.

## Installation

```bash
npm install kappa-create @tanstack/react-query @mysten/dapp-kit @mysten/sui
```

## Quick Start

```jsx
import { WidgetV2Standalone } from 'kappa-create/react';

function App() {
  return (
    <WidgetV2Standalone 
      projectName="My DEX"
      defaultContract="0xabc...::Token::TOKEN"
      lockContract={false}
    />
  );
}
```

## Widget Variants

### 1. Standalone (Recommended)
Includes all required providers (wallet, query client, SUI client). Perfect for quick integration.

```jsx
import { WidgetV2Standalone } from 'kappa-create/react';

function App() {
  return (
    <WidgetV2Standalone 
      projectName="My DEX"
      defaultContract="0xabc...::Token::TOKEN"
      lockContract={false}
      theme={customTheme}
      logoUrl="/logo.png"
    />
  );
}
```

### 2. Embedded
For apps with existing wallet/context providers.

```jsx
import { WidgetV2Embedded } from 'kappa-create/react';

// Inside your existing providers
function TradingSection({ selectedToken }) {
  return (
    <WidgetV2Embedded 
      defaultContract={selectedToken}
      lockContract={true}  // Lock to specific token
      theme={darkTheme}
    />
  );
}
```

## Props

```typescript
interface WidgetProps {
  theme?: Partial<ThemeTokens>;     // 100+ theming tokens
  defaultContract?: string;         // Initial token contract
  lockContract?: boolean;           // Lock token selection
  logoUrl?: string;                 // Brand logo URL
  projectName?: string;             // Display name
  apiBase?: string;                 // API endpoint
  network?: NetworkConfig;         // Custom network config
}
```

### Prop Details

- **theme**: Object with CSS variables for complete customization (see Theming section)
- **defaultContract**: Token contract address (e.g., `0x123...::Token::SYMBOL`)
- **lockContract**: When `true`, prevents users from changing the selected token
- **logoUrl**: URL to your logo (displays at 40x40px in header)
- **projectName**: Your project name shown in the header
- **apiBase**: API endpoint (defaults to `/api` for proxy or `https://api.kappa.fun`)
- **network**: Custom module configuration for third-party bonding curves

## Features

### Core Trading
- ✅ **Buy & Sell**: Seamless token trading with SUI
- ✅ **Real-time Quotes**: Live price calculations using bonding curve math
- ✅ **Slippage Protection**: Configurable slippage (0.5%, 1%, 2%, 5% presets)
- ✅ **Balance Display**: Shows SUI and token balances with auto-refresh

### User Experience
- ✅ **Quick Amounts**: 25%, 50%, 75%, MAX buttons for easy input
- ✅ **Smart MAX**: 97% for SUI (gas buffer), balance-1 for tokens
- ✅ **Token Search**: Search by name, symbol, or contract address
- ✅ **Trending Tokens**: Popular tokens displayed in selector
- ✅ **Token Avatars**: Automatic token image loading
- ✅ **Directional Swap**: Maintains SUI on one side during swaps

### Visual & Interaction
- ✅ **Hover Effects**: Interactive buttons with visual feedback
- ✅ **Loading States**: Skeleton loaders and smooth transitions
- ✅ **Error Handling**: Clear error messages and validation
- ✅ **Mobile Responsive**: Adapts to all screen sizes
- ✅ **Transaction Modal**: Shows transaction details and status
- ✅ **Animations**: Smooth transitions and micro-interactions

### Technical
- ✅ **Multi-Module Support**: Auto-detects bonding curve modules
- ✅ **Factory Config**: Automatic factory detection and configuration
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Performance**: Optimized with React hooks and memoization

## Theming

The widget supports 100+ CSS variables for complete customization.

### Basic Theme Example

```jsx
const myTheme = {
  // Base colors
  '--kappa-bg': '#ffffff',
  '--kappa-text': '#000000',
  '--kappa-primary': '#007bff',
  '--kappa-accent': '#6c757d',
  
  // Quick select buttons
  '--kappa-quick-bg': '#f8f9fa',
  '--kappa-quick-text': '#007bff',
  '--kappa-quick-max-text': '#dc3545',
  '--kappa-quick-hover-bg': 'rgba(0, 123, 255, 0.1)',
  
  // Shadows and radius
  '--kappa-shadow-lg': '0 10px 30px rgba(0,0,0,0.1)',
  '--kappa-radius-xl': '16px',
};

<WidgetV2Standalone theme={myTheme} />
```

### Theme Categories

#### Base Colors
- Background, panels, borders
- Text (primary, muted)
- States (primary, success, error, warning)
- Accent colors

#### Components
- Quick select buttons (including MAX)
- Token selection buttons
- Input fields
- Swap button
- Modals and overlays

#### Layout & Effects
- Shadows (sm, md, lg, xl, primary, danger)
- Border radius (sm, md, lg, xl, full)
- Spacing (xs, sm, md, lg, xl, 2xl)
- Transitions (fast, base, slow)

#### Typography
- Font family
- Font sizes (xs to 2xl)
- Font weights (normal, medium, semibold, bold)

See [THEMING.md](./THEMING.md) for complete token reference.

## Examples

### Fixed Token Trading

```jsx
// Lock to a specific token - users cannot change it
<WidgetV2Standalone 
  defaultContract="0x123...::PEPE::PEPE"
  lockContract={true}
  projectName="PEPE Trading"
/>
```

### Custom Branded Interface

```jsx
const brandTheme = {
  '--kappa-primary': '#ff6b35',
  '--kappa-bg': '#1a1a2e',
  '--kappa-panel': '#16213e',
  '--kappa-text': '#eee',
  '--kappa-accent': '#ff8c42',
};

<WidgetV2Standalone 
  theme={brandTheme}
  logoUrl="/brand-logo.png"
  projectName="My Brand DEX"
/>
```

### With Custom API Endpoint

```jsx
<WidgetV2Standalone 
  apiBase="https://my-api.example.com"
  defaultContract={tokenAddress}
/>
```

### Embedded in Existing App

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { WidgetV2Embedded } from 'kappa-create/react';

function App() {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider>
        <WalletProvider>
          <YourAppHeader />
          <WidgetV2Embedded 
            defaultContract={selectedToken}
            theme={appTheme}
          />
          <YourAppFooter />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

## Next.js Integration

### 1. Configure API Proxy (avoid CORS)

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
      { 
        source: '/api/v1/:path*', 
        destination: 'https://api.kappa.fun/v1/:path*' 
      },
    ];
  },
};
module.exports = nextConfig;
```

### 2. Create Trading Page

```tsx
// app/trade/page.tsx (App Router)
'use client';

import { WidgetV2Standalone } from 'kappa-create/react';

export default function TradePage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <WidgetV2Standalone 
        projectName="My DEX"
        // apiBase="/api" is default when using proxy
      />
    </div>
  );
}
```

## Advanced Configuration

### Custom Network/Module

```jsx
const customNetwork = {
  bondingContract: "0x1234...",
  CONFIG: "0x5678...",
  globalPauseStatusObjectId: "0x9abc...",
  poolsId: "0xdef0...",
  lpBurnManger: "0x1111...",
  moduleName: "my_custom_module"
};

<WidgetV2Standalone network={customNetwork} />
```

### Dynamic Theme Switching

```jsx
function ThemedWidget() {
  const [isDark, setIsDark] = useState(true);
  
  const theme = isDark ? darkTheme : lightTheme;
  
  return (
    <>
      <button onClick={() => setIsDark(!isDark)}>
        Toggle Theme
      </button>
      <WidgetV2Standalone theme={theme} />
    </>
  );
}
```

## Troubleshooting

### CORS Issues
- Use the Next.js proxy configuration shown above
- Or set `apiBase` to a proxied endpoint
- Ensure your domain is whitelisted if using direct API

### Token Not Loading
- Verify contract address format: `0x...::Module::SYMBOL`
- Check network configuration
- Ensure token exists on mainnet

### Wallet Connection Issues
- Ensure Sui wallet extension is installed
- Check wallet is on mainnet
- Verify wallet has SUI for gas

### Theme Not Applying
- CSS variables must start with `--kappa-`
- Pass theme as an object, not a string
- Check for typos in variable names

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Requirements

- React 18+
- Node.js 16+
- Sui wallet extension for Web3 features

## Related Documentation

- [SDK Documentation](./Read%20me-SDK.md) - Programmatic trading
- [Deployer Widget](./Read%20me-DEPLOYER.md) - Token creation interface
- [Theming Guide](./THEMING.md) - Complete theme customization

## Support

- **Documentation**: [https://docs.kappa.fun](https://docs.kappa.fun)
- **GitHub**: [https://github.com/kappa-labs/kappa-sdk](https://github.com/kappa-labs/kappa-sdk)
- **Website**: [https://kappa.fun](https://kappa.fun)

## License

MIT