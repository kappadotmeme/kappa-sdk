# Transaction Fix Documentation

## Problem
Transactions (Buy/Sell) were not working because the Widget component wasn't passing the correct network configuration to the `kappa-trade.js` module.

## What Gets Passed to Buy/Sell Functions

### Buy Function (`buyWeb3`)
When you click "Buy", the widget passes:
- **signer**: Your wallet connection object
- **token**: An object containing:
  - `publishedObject.packageId`: The package ID extracted from the contract address
  - `name`: The module name (with underscores replaced by spaces)
  - `sui`: Amount of SUI to spend (in lamports, e.g., `1 SUI = 1,000,000,000 lamports`)
  - `min_tokens`: Minimum tokens expected (after slippage calculation)

### Sell Function (`sellWeb3`)
When you click "Sell", the widget passes:
- **signer**: Your wallet connection object
- **token**: An object containing:
  - `publishedObject.packageId`: The package ID extracted from the contract address
  - `name`: The module name (with underscores replaced by spaces)
  - `sell_token`: Amount of tokens to sell
  - `min_sui`: Minimum SUI expected (after slippage calculation)

## The Fix

### 1. Updated Widget Component
The Widget now accepts a `network` prop with the correct contract addresses:

```typescript
<WidgetStandalone
  projectName="KAPPA"
  apiBase={API_BASE}
  network={{
    bondingContract: "0xa3c9483dcc4d9b96f83df045eecc327d567006ab3bcaeeec8c0ded313698e46a",
    CONFIG: "0x6cf2bc0c72ab45b9957448994bbba7de6567fdba921cedd749bbf57f152fc812",
    globalPauseStatusObjectId: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
    poolsId: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
    lpBurnManger: "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845",
    moduleName: "kappadotmeme",
  }}
/>
```

### 2. Network Configuration is Applied
Before executing trades, the widget now:
1. Imports the `kappa-trade.js` module
2. Sets the SUI client
3. **Sets the network configuration** (if provided)
4. Executes the trade

```javascript
// In onBuy and onSell functions
const trade = await import('../../kappa-trade.js');
trade.setSuiClient(client);

// NEW: Set network configuration if provided
if (network && trade.setNetworkConfig) {
  trade.setNetworkConfig(network);
}
```

## Important Contract Addresses

### Current Mainnet Configuration
These are the addresses currently being used:
- **bondingContract**: `0xa3c9483dcc4d9b96f83df045eecc327d567006ab3bcaeeec8c0ded313698e46a`
- **CONFIG**: `0x6cf2bc0c72ab45b9957448994bbba7de6567fdba921cedd749bbf57f152fc812`
- **globalPauseStatusObjectId**: `0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f`
- **poolsId**: `0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0`

## How to Customize

If you need to use different contract addresses:

1. **Update the NETWORK_CONFIG** in your page components:
```typescript
const NETWORK_CONFIG = {
  bondingContract: "YOUR_BONDING_CONTRACT_ADDRESS",
  CONFIG: "YOUR_CONFIG_ADDRESS",
  // ... other addresses
};
```

2. **Pass it to the Widget**:
```typescript
<WidgetStandalone 
  network={NETWORK_CONFIG}
  // ... other props
/>
```

## Debugging Transactions

If transactions still fail:

1. **Check Browser Console** - Look for error messages
2. **Verify Contract Addresses** - Ensure they match your deployment
3. **Check Wallet Connection** - Ensure wallet is connected to mainnet
4. **Verify Token Balance** - For sells, ensure you have tokens to sell
5. **Check SUI Balance** - For buys, ensure you have enough SUI + gas

## Transaction Flow

1. User enters amount and clicks Buy/Sell
2. Widget calculates slippage and minimum output
3. Widget imports `kappa-trade.js` module
4. Sets client and network configuration
5. Calls `buyWeb3` or `sellWeb3` with parameters
6. Module builds Sui transaction
7. Transaction is signed via wallet
8. Transaction is submitted to blockchain
9. Result (digest or error) is displayed

## Files Modified

- `/src/react/Widget.tsx` - Added network prop and configuration
- `/Testing/web-widget/app/page.tsx` - Added network configuration
- `/Testing/web-widget/app/default-token/page.tsx` - Added network configuration  
- `/Testing/web-widget/app/debug/page.tsx` - Added network configuration
