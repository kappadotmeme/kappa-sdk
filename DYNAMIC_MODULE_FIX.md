# Dynamic Module Configuration Fix for Widget.tsx

## Problem
The widget was using a static network configuration passed as a prop, which meant all tokens (regardless of which module created them) were using the same Package ID and Config ID. This caused gas estimation errors for tokens from partner modules.

## Solution
Implemented dynamic module configuration that:
1. Fetches token metadata to get the `factoryAddress`
2. Uses the factory address to fetch the correct module configuration
3. Applies that configuration to the trading functions

## Changes Made to Widget.tsx

### 1. Added State Variables
```typescript
// Dynamic module configuration
const [dynamicModuleConfig, setDynamicModuleConfig] = useState<any>(null);
const [factoryAddress, setFactoryAddress] = useState<string | null>(null);
```

### 2. Token Metadata Fetching
When a token contract is entered, the widget now:
- Fetches token metadata from `/v1/coins/{tokenAddress}`
- Extracts the `factoryAddress` field
- Fetches factory configuration from `/v1/coins/factories/{factoryAddress}`
- Stores the module configuration for use in transactions

### 3. Dynamic Configuration in Buy/Sell
Both `onBuy` and `onSell` functions now:
```typescript
// Use dynamic module config if available, otherwise fall back to prop
const configToUse = dynamicModuleConfig || network;
if (configToUse && trade.setNetworkConfig) {
  console.log('[Widget] Setting network config (dynamic or prop):', configToUse);
  console.log('[Widget] Factory address:', factoryAddress);
  trade.setNetworkConfig(configToUse);
}
```

### 4. Search Result Enhancement
When selecting a token from search results, the widget now stores the `factoryAddress` if available.

### 5. Clear Function Update
The `clearContract` function now also clears the dynamic module configuration.

## How It Works

### For Default Module (Kappa) Tokens
1. User selects token: `0xabc123::Token::TOKEN`
2. Widget fetches metadata → `factoryAddress: "0x9329..."`
3. Widget fetches factory config → Gets Kappa module IDs
4. Transaction uses Kappa Package ID and Config ID ✅

### For Partner Module Tokens
1. User selects token: `0xdef456::PartnerToken::PTOKEN`
2. Widget fetches metadata → `factoryAddress: "0x044a..."`
3. Widget fetches factory config → Gets Partner module IDs
4. Transaction uses Partner Package ID and Config ID ✅

## Testing

### Console Logs to Verify
When selecting a token, you should see:
```
[Widget] Fetching token metadata for: 0xdef456::PartnerToken::PTOKEN
[Widget] Token metadata: {factoryAddress: "0x044a...", ...}
[Widget] Token factory address: 0x044a...
[Widget] Factory configuration: {address: "0x044a...", configAddress: "0xad40...", ...}
[Widget] Set dynamic module config: {bondingContract: "0x044a...", CONFIG: "0xad40...", ...}
```

When executing a buy:
```
[Widget] Setting network config (dynamic or prop): {bondingContract: "0x044a...", CONFIG: "0xad40...", ...}
[Widget] Factory address: 0x044a...
```

## API Requirements

Your API must return:

### Token Metadata (`/v1/coins/{address}`)
```json
{
  "data": {
    "address": "0xdef456::PartnerToken::PTOKEN",
    "factoryAddress": "0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6",
    "name": "Partner Token",
    "symbol": "PTOKEN"
  }
}
```

### Factory Configuration (`/v1/coins/factories/{factoryAddress}`)
```json
{
  "data": {
    "name": "Patara",
    "address": "0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6",
    "configAddress": "0xad40a309c9172ccd67463faeedf3515509a1d89a6c8966336366c3f988016df8",
    "pauseStatusAddress": "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
    "poolsAddress": "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
    "lpBurnManagerAddress": "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845",
    "moduleName": "kappadotmeme_partner"
  }
}
```

## Benefits

1. **Automatic Module Detection**: No manual configuration needed
2. **Multi-Module Support**: Works with unlimited partner modules
3. **Backward Compatible**: Falls back to prop-based config if API doesn't return factory data
4. **Zero Downtime**: Existing tokens continue working
