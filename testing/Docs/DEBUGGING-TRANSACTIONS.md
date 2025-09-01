# Debugging Transaction Issues

## Changes Made to Fix Gas Estimation

### 1. **Enhanced Type Argument Construction**
The widget now properly passes the module name and type name separately:
```javascript
// Before: Only passed 'name' which was reformatted
{
  name: "Module Name",  // Would become Module_Name::MODULE_NAME
}

// After: Passes exact module and type names
{
  name: "Module Name",     // For backward compatibility
  moduleName: "Module_Name",  // Exact module name from contract
  typeName: "TYPE_NAME",    // Exact type name from contract
}
```

### 2. **Network Configuration Support**
The trade module now uses the configured network module name:
```javascript
// Can be configured via network prop
network: {
  bondingContract: "0x...",
  moduleName: "kappadotmeme",  // The module containing buy/sell functions
}
```

### 3. **Enhanced Logging**
Added comprehensive logging to help debug issues:
- `[Widget]` logs show what parameters are being passed
- `[kappa-trade]` logs show transaction building details
- Network configuration changes are logged

## What to Check in Browser Console

When you click "Buy" or "Sell", you should see:

1. **Widget Logs:**
```
[Widget] Setting network config: {bondingContract: "0x...", ...}
[Widget] Buy params: {
  contract: "0xabc::Module_Name::TYPE_NAME",
  packageId: "0xabc",
  moduleName: "Module_Name",
  typeName: "TYPE_NAME",
  suiAmount: 10000000,
  minTokens: 95000,
  slippage: "1%"
}
```

2. **Trade Module Logs:**
```
[kappa-trade] setNetworkConfig called with: {...}
[kappa-trade] Network config updated: {...}
[kappa-trade] buyWeb3...
[kappa-trade] buyWeb3 typeArgument: 0xabc::Module_Name::TYPE_NAME
[kappa-trade] Transaction parameters: {
  bondingContract: "0xa3c9...",
  CONFIG: "0x6cf2...",
  tokenAMetadata: "0x...",
  tokenBMetadata: "0x...",
  suiForBuy: 10000000,
  maxTokens: 95000,
  typeArgument: "0xabc::Module_Name::TYPE_NAME"
}
```

## Common Issues and Solutions

### Issue: "Cannot estimate gas"
**Causes:**
1. Wrong contract addresses in network config
2. Token doesn't exist at the specified address
3. Incorrect type argument format
4. Module name mismatch

**Check:**
- The `typeArgument` in logs matches the actual token contract
- The `bondingContract` and `CONFIG` addresses are correct
- The `moduleName` in the move call target is correct

### Issue: "Module not found"
**Cause:** The module name in the transaction doesn't match the deployed contract

**Solution:** Update the `moduleName` in NETWORK_CONFIG:
```typescript
const NETWORK_CONFIG = {
  moduleName: "your_actual_module_name", // Not the token module, but the trading module
  // ... other config
};
```

### Issue: "Type argument error"
**Cause:** The type argument format is incorrect

**Check:** The contract address format should be:
```
packageId::moduleName::typeName
```
Example: `0xabc123::my_token::MY_TOKEN`

## Testing Steps

1. **Open Browser Console** (F12)
2. **Navigate to Debug Page**: http://localhost:3001/debug
3. **Connect Wallet**
4. **Select a Token** from the trending list
5. **Enter Amount** (e.g., 0.01)
6. **Click Buy**
7. **Check Console** for error messages

## Key Configuration Files

### `/Testing/web-widget/app/page.tsx`
```typescript
const NETWORK_CONFIG = {
  bondingContract: "0xa3c9483dcc4d9b96f83df045eecc327d567006ab3bcaeeec8c0ded313698e46a",
  CONFIG: "0x6cf2bc0c72ab45b9957448994bbba7de6567fdba921cedd749bbf57f152fc812",
  globalPauseStatusObjectId: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
  poolsId: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
  lpBurnManger: "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845",
  moduleName: "kappadotmeme",
};
```

## If Transactions Still Fail

1. **Verify Contract Addresses**: Ensure all addresses in NETWORK_CONFIG match your deployment
2. **Check Module Name**: The `moduleName` should be the module containing `buy` and `sell_` functions
3. **Verify Token Exists**: Try the token address in a Sui explorer
4. **Check Wallet Balance**: Ensure you have enough SUI for gas + trade amount
5. **Look for Specific Errors**: The console will show detailed error messages

## Files Modified
- `/src/react/Widget.tsx` - Enhanced parameter passing
- `/kappa-trade.js` - Improved type argument handling and logging
- All page components - Added network configuration
