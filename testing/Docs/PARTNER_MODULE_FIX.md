# Partner Module Trading Fix Summary

## Problem
- **DeployerWidget.tsx**: Partner module deployments were working ✅
- **Widget.tsx**: Default Kappa module buys/sells were working ✅  
- **Widget.tsx**: Partner module token buys/sells were NOT working ❌

## Root Cause
The API returns factory configuration without the `moduleName` field:

```json
{
  "name": "Patara",
  "address": "0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6",
  "configAddress": "0xad40a309c9172ccd67463faeedf3515509a1d89a6c8966336366c3f988016df8",
  // ... but no moduleName field!
}
```

Widget.tsx was looking for `factoryData.moduleName` but it wasn't provided by the API, so it always defaulted to `'kappadotmeme'` even for partner module tokens.

## Solution

### 1. Module Name Detection
Added logic to determine `moduleName` based on factory address:

```javascript
// Determine module name based on factory address
let moduleName = 'kappadotmeme'; // default
const factoryAddr = factoryData.address || factoryData.packageId || '';

if (factoryAddr === '0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6') {
  moduleName = 'kappadotmeme_partner';  // Partner module (Patara)
} else if (factoryAddr === '0x9329aacc5381a7c6e419a22b7813361c4efc46cf20846f8247bf4a7bd352857c') {
  moduleName = 'kappadotmeme';  // Default Kappa module
}
```

### 2. Improved Factory Data Extraction
Fixed API response structure handling:

```javascript
// Handle nested factory data structure
const factoryData = factoryJson?.data?.factory || factoryJson?.data || factoryJson;
```

### 3. Fallback Factory Address Resolution
Added fallback to use factory address from trending/search results when individual coin metadata fetch fails:

```javascript
// If we found the item and don't have a factory address yet, use the one from trending
if (item?.factoryAddress && !foundFactoryAddress) {
  foundFactoryAddress = item.factoryAddress;
  // ... fetch and configure module
}
```

## Module Configurations

### Default Kappa Module
- **Package ID**: `0x9329aacc5381a7c6e419a22b7813361c4efc46cf20846f8247bf4a7bd352857c`
- **Config ID**: `0x51246bdee8ba0ba1ffacc1d8cd41b2b39eb4630beddcdcc4c50287bd4d791a6c`
- **Module Name**: `kappadotmeme`

### Partner Module (Patara)
- **Package ID**: `0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6`
- **Config ID**: `0xad40a309c9172ccd67463faeedf3515509a1d89a6c8966336366c3f988016df8`
- **Module Name**: `kappadotmeme_partner`

## Testing
Created `test-factory-config.js` to verify:
1. Factory addresses are correctly returned by API ✅
2. Module names are correctly inferred ✅
3. Configuration is properly mapped ✅

## Result
Now all three scenarios work correctly:
- ✅ DeployerWidget.tsx: Partner module deployments
- ✅ Widget.tsx: Default Kappa module trading
- ✅ Widget.tsx: Partner module token trading

The widget now dynamically detects and configures the correct module based on the token's factory address.
