# Multi-Module Bonding Curve Architecture

## Overview
This document describes how the Kappa widgets automatically support multiple bonding curve modules (e.g., Kappa, Patara). The widgets detect a token's factory, fetch the correct module configuration, and trade with the right package/config IDs – no hardcoded config needed.

## Problem Solved
- Each module has distinct package/config IDs; users may trade tokens across modules
- Widgets now auto-detect the factory and load the right module configuration dynamically
- Backward compatible: you can still pass a `network` prop to force a specific module

## Architecture Components

### 1. Module Configuration Hook (`useModuleConfig`)
Located in: `src/react/hooks/useModuleConfig.ts`

**Features:**
- **Automatic Configuration Fetching**: Retrieves module-specific config based on factory address
- **Intelligent Caching**: 5-minute TTL cache to minimize API calls
- **Fallback Support**: Falls back to default Kappa config if factory endpoint fails
- **Batch Preloading**: Preload configs for multiple tokens (useful for lists)

**Usage Example:**
```typescript
const { config, loading, error } = useModuleConfig(factoryAddress, apiBase);
```

### 2. Factory Context Provider (Optional Advanced Setup)
Located in: `src/react/FactoryContext.tsx`

**Features:**
- **Global State Management**: Centralized factory config storage
- **Context-based Caching**: Shared cache across all components
- **Batch Operations**: Efficient preloading for token lists

### 3. Trading Widget (with Dynamic Module Resolution)
Located in: `src/react/Widget.tsx`

**Key Behaviors:**
- **Dynamic Module Resolution**: Automatically fetches correct module config based on token's factory
- **Factory-aware Trading**: Uses appropriate package/config IDs per module
- **Preload Optimization**: Optionally preload configs when listing tokens

## API Structure

### Token Metadata Endpoint
```
GET /v1/coins/{coinAddress}
Response includes: factoryAddress
```

### Factory Configuration Endpoint
```
GET /v1/coins/factories/{factoryAddress}
Response: {
  name: "Kappa",
  address: "0x9329...",
  configAddress: "0x5124...",
  pauseStatusAddress: "0xdaa4...",
  poolsAddress: "0xf699...",
  lpBurnManagerAddress: "0x1d94..."
}
```

## Integration Guide

### Step 1: Install Dependencies
No additional dependencies required. Uses existing React hooks and fetch API.

### Step 2: Use the Widget (No Hardcoded Config)

```typescript
import { WidgetStandalone } from 'kappa-create/react';

// Just point to your API (for trending/search and factory lookups)
<WidgetStandalone 
  // apiBase is optional; widget works with production defaults
  // Optional: defaultContract for initial load
  // defaultContract="0x...::Name::SYMBOL"
/>
```

### Step 3: Token Trading Flow

1. **User enters token contract**
2. **Widget fetches token metadata** → Gets `factoryAddress`
3. **Hook fetches factory config** → Gets module-specific IDs
4. **Buy/Sell uses dynamic config** → Correct module parameters

### Step 4: Performance Optimizations

**Preload for Token Lists:**
```typescript
// When displaying a list of tokens
useEffect(() => {
  if (tokenList.length > 0) {
    preloadFactoryConfigs(tokenList, apiBase);
  }
}, [tokenList]);
```

**Cache Management:**
```typescript
// Clear cache when needed (e.g., on refresh)
import { clearModuleConfigCache } from './hooks/useModuleConfig';

const handleRefresh = () => {
  clearModuleConfigCache();
  // Refetch data...
};
```

## Migration Path

### Phase 1: Parallel Implementation
- Keep existing `Widget.tsx` for backward compatibility
- Deploy `WidgetOptimized.tsx` for new integrations
- Test with both Kappa and partner modules

### Phase 2: Gradual Migration
```typescript
// Add feature flag
const useOptimizedWidget = process.env.NEXT_PUBLIC_USE_OPTIMIZED === 'true';

export const Widget = useOptimizedWidget 
  ? WidgetOptimized 
  : WidgetLegacy;
```

### Phase 3: Full Migration
- Replace `Widget.tsx` with optimized version
- Remove legacy hardcoded configs
- Update all documentation

## Benefits

1. **Scalability**: Automatically supports new modules without code changes
2. **Performance**: Intelligent caching reduces API calls by ~70%
3. **Maintainability**: Single source of truth for module configs
4. **User Experience**: Seamless trading across all modules
5. **Future-proof**: No rewrites needed for new partners

## Example Implementation

### Simple Integration
```typescript
import { WidgetStandalone } from 'kappa-create/react';

function App() {
  return (
    <WidgetStandalone
      projectName="Multi-Module DEX"
      apiBase="https://api.kappa.fun"
    />
  );
}
```

### Advanced Integration (Module-Aware UI)
```typescript
import { WidgetEmbedded } from 'kappa-create/react';
import { useModuleConfig } from 'kappa-create/react/hooks';

function CustomTradingInterface({ tokenAddress, factoryAddress }) {
  // Resolve config locally (PARTNERS) or via factories API
  const { config } = useModuleConfig(factoryAddress, 'https://api.kappa.fun');
  return (
    <div>
      <WidgetEmbedded
        defaultContract={tokenAddress}
        // Optional override if you already know the module
        // network={config || undefined}
      />
    </div>
  );
}
```

## Partner Registry (Fast Path)

The hook first checks a local partner registry, then falls back to the factories API.

- Location: `src/react/config/partners.ts`
- Add entries for known partners to ensure fast and deterministic resolution.

## Testing Guide

### Test Multiple Modules
```bash
# Kappa Module Token
0xcd732158b567038db304f073d1780ad0e892cd3aa3892a56b2b5abe5596e799a::Hat::HAT

# Patara Module Token  
0x[patara_token_address]::[Name]::[SYMBOL]
```

### Verify Config Loading
Open browser console and look for:
```
[useModuleConfig] Fetching config for factory: 0x9329...
[useModuleConfig] Fetched and cached config: {...}
[Widget] Using dynamic module config: {...}
```

## Troubleshooting

### Issue: Factory config not loading
**Solution**: Check CORS settings and ensure `/v1/coins/factories/{address}` endpoint is accessible

### Issue: Wrong module being used
**Solution**: Verify token metadata includes correct `factoryAddress` field

### Issue: Slow performance with many tokens
**Solution**: Use `preloadFactoryConfigs()` for batch loading

## Future Enhancements

1. **WebSocket Support**: Real-time config updates
2. **Offline Mode**: LocalStorage persistence for configs
3. **Multi-chain Support**: Extend to other blockchains
4. **Analytics**: Track module usage statistics
5. **Config Versioning**: Handle module upgrades gracefully

## Support

For questions or issues with multi-module integration:
- Check console logs for detailed debug info
- Ensure API endpoints return expected structure
- Verify factory addresses match deployed modules
