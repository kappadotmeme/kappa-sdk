# NPM Package Usage Guide

## For Third-Party Developers

### Quick Start

```bash
npm install kappa-sdk
```

### Import Methods

#### ES Modules (Recommended)
```javascript
import { DeployerWidgetStandalone } from 'kappa-sdk/react';
```

#### CommonJS
```javascript
const { DeployerWidgetStandalone } = require('kappa-sdk/react');
```

#### Dynamic Import (Next.js)
```javascript
const DeployerWidget = dynamic(
  () => import('kappa-sdk/react').then(mod => mod.DeployerWidgetStandalone),
  { ssr: false }
);
```

### Available Exports

From `kappa-sdk/react`:
- `DeployerWidgetStandalone` - Complete widget with wallet connection
- `DeployerWidgetEmbedded` - Widget UI only (no wrapper)
- `DeployerWidgetIntegrated` - For apps with existing Sui providers
- `WidgetStandalone` - Trading widget standalone version
- `WidgetEmbedded` - Trading widget embedded version

### Minimal Example

```jsx
import React from 'react';
import { DeployerWidgetStandalone } from 'kappa-sdk/react';

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
    />
  );
}

export default App;
```

### Build Configuration

#### Webpack 5
If you encounter polyfill issues:

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false
    }
  }
};
```

#### Vite
```javascript
// vite.config.js
export default {
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['kappa-sdk']
  }
};
```

### TypeScript Support

The package includes TypeScript definitions:

```typescript
import { 
  DeployerWidgetStandalone,
  DeployerWidgetProps,
  DeployerIntegratedProps 
} from 'kappa-sdk/react';

const props: DeployerWidgetProps = {
  network: {
    bondingContract: '0x...',
    CONFIG: '0x...'
  },
  onSuccess: (coinAddress: string) => {
    // Handle success
  }
};
```

### Peer Dependencies

Make sure you have these installed:
```json
{
  "react": ">=16.8.0",
  "react-dom": ">=16.8.0"
}
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### CDN Usage

For non-React apps or quick prototypes:

```html
<script src="https://unpkg.com/kappa-sdk@latest/dist/kappa-deployer.min.js"></script>
```

### Support

- GitHub: https://github.com/kappadotmeme/kappa-sdk
- Documentation: https://docs.kappa.fun
- Discord: https://discord.gg/kappa
