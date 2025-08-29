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
  "address": "0xf1ba7eae2494f147cf4a67e8f87b894382ebe9261c5f1cd7c13fdacce82ebc37",
  "configAddress": "0x9b0fb19055c8b77f76203635ef6c4b4dac9928031d42c7e42131491adc3f87ae",
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

if (factoryAddr === '0xf1ba7eae2494f147cf4a67e8f87b894382ebe9261c5f1cd7c13fdacce82ebc37') {
  moduleName = 'kappadotmeme_partner';  // Partner module (Patara)
} else if (factoryAddr === '0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc') {
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
- **Package ID**: `0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc`
- **Config ID**: `0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c`
- **Module Name**: `kappadotmeme`

### Partner Module (Patara)
- **Package ID**: `0xf1ba7eae2494f147cf4a67e8f87b894382ebe9261c5f1cd7c13fdacce82ebc37`
- **Config ID**: `0x9b0fb19055c8b77f76203635ef6c4b4dac9928031d42c7e42131491adc3f87ae`
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
