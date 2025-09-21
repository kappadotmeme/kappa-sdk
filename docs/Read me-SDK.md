# Kappa SDK Documentation

Programmatic interface for creating and trading tokens on Sui using the Kappa Protocol.

## Installation

```bash
npm install kappa-create @mysten/sui @mysten/bcs
```

> **Note**: The SDK is distributed as pre-transpiled JavaScript with TypeScript definitions. No additional build configuration is required.

## Initialization

### Browser/React
```javascript
import { initKappa } from 'kappa-create';
import { SuiClient } from '@mysten/sui/client';

const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
initKappa({ client });
```

### Node.js/Server
```javascript
const { initKappa } = require('kappa-create');
const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
initKappa({ client, logger: console.log });
```

> **Note**: Requires Node.js 18 or higher due to package dependencies.

## Core Functions

### Create Token

Create and deploy a new token with bonding curve:

```javascript
const { createToken } = require('kappa-create/server'); // Server-only

const result = await createToken({
  signer,                              // Keypair or wallet signer
  name: 'My Token',                    // Token name
  symbol: 'MTK',                       // Token symbol
  description: 'An awesome token',     // Description
  icon: 'https://example.com/icon.png', // Icon URL
  twitter: 'https://twitter.com/token', // Optional
  website: 'https://mytoken.com',      // Optional
  telegram: 'https://t.me/mytoken',    // Optional
  tags: ['defi', 'meme'],             // Optional tags
  hasMaxBuy: true,                     // Enable max buy limit
  firstBuy: {
    suiInMist: 100_000_000,            // 0.1 SUI initial buy
    minTokensOut: 0                    // Min tokens (0 = any)
  }
});

console.log('Token deployed at:', result.coinAddress);
```

### Buy Tokens

Purchase tokens from a bonding curve:

```javascript
const { buyTokens } = require('kappa-create');

const result = await buyTokens({
  signer,                                    // Wallet signer
  contract: '0x123...::MyToken::MYTOKEN',  // Token contract
  suiInMist: 1_000_000_000,               // 1 SUI
  minTokensOut: 0,                        // Min tokens (0 = any)
  slippagePercent: 1                      // 1% slippage
});

console.log('Transaction:', result.digest);
console.log('Tokens received:', result.tokensOut);
```

### Sell Tokens

Sell tokens back to the bonding curve:

```javascript
const { sellTokens } = require('kappa-create');

const result = await sellTokens({
  signer,                                    // Wallet signer
  contract: '0x123...::MyToken::MYTOKEN',  // Token contract
  tokensIn: 1_000_000_000,                 // Amount to sell
  minSuiOut: 0,                            // Min SUI out
  slippagePercent: 1                       // 1% slippage
});

console.log('Transaction:', result.digest);
console.log('SUI received:', result.suiOut);
```

## Quote Functions

Get price quotes before trading:

```javascript
const { quoteBuy, quoteSell } = require('kappa-create');

// Quote buying tokens
const buyQuote = await quoteBuy({
  contract: '0x123...::MyToken::MYTOKEN',
  suiInMist: 1_000_000_000  // 1 SUI
});
console.log('Will receive:', buyQuote.tokensOut, 'tokens');

// Quote selling tokens  
const sellQuote = await quoteSell({
  contract: '0x123...::MyToken::MYTOKEN',
  tokensIn: 1_000_000_000
});
console.log('Will receive:', sellQuote.suiOut / 1e9, 'SUI');
```

## Market Data

Fetch trending tokens and market information:

```javascript
const { listCoins, getCoinInfo } = require('kappa-create');

// Get trending tokens
const trending = await listCoins({ 
  type: 'trending',
  limit: 50 
});

// Get specific token info
const info = await getCoinInfo('0x123...::MyToken::MYTOKEN');
console.log('Market cap:', info.marketCapInUsd);
console.log('24h volume:', info.volume24hInUsd);
```

## Advanced Usage

### Custom Module Configuration

Use your own Sui modules instead of default Kappa:

```javascript
const { setNetworkConfig } = require('kappa-create');

setNetworkConfig({
  bondingContract: "0x1234...abcd",      // Your package ID
  CONFIG: "0x5678...efgh",               // Your CONFIG object
  globalPauseStatusObjectId: "0x9abc...", // Pause status
  poolsId: "0xdef0...mnop",              // Pools object
  moduleName: "my_custom_module"         // Module name
});

// Now all operations use your module
await createToken({ ... });
```

### Web3 Integration

For browser wallets (React/Next.js):

```javascript
import { buyWeb3, sellWeb3 } from 'kappa-create';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

function TradingComponent() {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  
  const handleBuy = async () => {
    const signer = {
      address: currentAccount.address,
      signAndExecuteTransaction: signAndExecute
    };
    
    const result = await buyWeb3(signer, {
      publishedObject: { packageId: '0x123...' },
      name: 'MyToken',
      sui: 1_000_000_000,
      min_tokens: 0
    });
  };
}
```

### Signer Types

The SDK supports multiple signer types:

```javascript
// 1. Keypair (Node.js)
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const keypair = Ed25519Keypair.deriveKeypair(mnemonicPhrase);

// 2. Wallet Signer (Browser)
const walletSigner = {
  address: account.address,
  signAndExecuteTransaction: async (args) => {
    // Wallet signing logic
  }
};

// 3. Custom Signer
const customSigner = {
  getPublicKey: () => publicKey,
  signAndExecuteTransaction: async (transaction) => {
    // Custom signing logic
  }
};
```

## Error Handling

```javascript
try {
  const result = await buyTokens({
    signer,
    contract: tokenContract,
    suiInMist: amount
  });
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('Insufficient balance')) {
    console.error('Not enough SUI');
  } else if (error.message.includes('slippage')) {
    console.error('Price changed too much');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## Math Utilities

Calculate bonding curve prices:

```javascript
const { buyMath, sellMath, firstBuyMath } = require('kappa-create/math');

// Calculate tokens from SUI
const curve = { 
  virtual_sui_reserve: '1900000000000',
  virtual_coin_reserve: '876800000000000000' 
};
const tokensOut = buyMath(curve, suiInMist);

// Calculate SUI from tokens
const suiOut = sellMath(curve, tokensIn);

// Calculate initial buy
const initialTokens = firstBuyMath(suiInMist);
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { 
  createToken,
  buyTokens,
  sellTokens,
  CreateTokenParams,
  BuyTokensParams,
  SellTokensParams,
  TokenInfo,
  QuoteResult
} from 'kappa-create';

const params: CreateTokenParams = {
  signer: mySigner,
  name: 'Token',
  symbol: 'TKN',
  description: 'Description',
  icon: 'https://...'
};

const result = await createToken(params);
```

> **Build Note**: All TypeScript code is pre-transpiled to JavaScript in the published package, so you can use the SDK in plain JavaScript projects without any TypeScript tooling.

## Migration from v1

```javascript
// Old (v1)
const kappa = new KappaSDK(client);
await kappa.buy(contract, amount);

// New (v2)
import { initKappa, buyTokens } from 'kappa-create';
initKappa({ client });
await buyTokens({ signer, contract, suiInMist: amount });
```

## Best Practices

1. **Always use slippage protection** in production
2. **Quote before trading** to show users expected amounts
3. **Handle errors gracefully** - network issues are common
4. **Cache token info** to reduce API calls
5. **Use TypeScript** for better development experience

## Package Structure

The SDK exports from multiple entry points:
- Main SDK functions: `kappa-create`
- Server-only functions: `kappa-create/server`
- React components: `kappa-create/react`
- Math utilities: `kappa-create/math`

All exports are pre-compiled CommonJS modules compatible with Node.js 18+.

## Support

- GitHub Issues: [https://github.com/kappa-labs/kappa-sdk](https://github.com/kappa-labs/kappa-sdk)
- Discord: [https://discord.gg/kappa](https://discord.gg/kappa)
