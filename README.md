# Kappa Partner SDK (Sui)

SDK for creating and trading tokens on Kappa’s Sui bonding curve. Exposes create/buy/sell and quoting math. The coin listing API is open for now; x-api-key is optional.

## Install

```bash
npm install @kappa/sdk @mysten/sui
```

## Quickstart (Node)

```js
const { initKappa, createToken, buyTokens, sellTokens, listCoins } = require('@kappa/sdk');
const { SuiClient, getFullnodeUrl, Ed25519Keypair } = require('@mysten/sui');

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
initKappa({ client, logger: console.log });

// Your signer: either a Keypair or a Uint8Array secret key (server-side only)
const signer = Ed25519Keypair.fromSecretKey(/* Uint8Array secret key */);

// Create + launch (optional first buy)
await createToken({
  signer,
  name: 'My Coin', symbol: 'MYC', description: '...', icon: 'https://...',
  maxTx: false,
  firstBuy: { suiInMist: 100_000_000, minTokensOut: 0 },
});

// Buy
await buyTokens({
  signer,
  contract: '0x...::My_Coin::MY_COIN',
  suiInMist: 50_000_000,
  minTokensOut: 0,
});

// Sell
await sellTokens({
  signer,
  contract: '0x...::My_Coin::MY_COIN',
  tokensIn: 1_000_000_000,
  minSuiOut: 0,
});

// Discovery (API key optional)
const coins = await listCoins();
```

## API

- initKappa({ client?, networkConfig?, logger? })
  - Inject your SuiClient, optional network constants, and optional logger.
- createToken({ signer|signerPrivateKey, name, symbol, description, icon, website?, twitter?, telegram?, tags?, maxTx?, firstBuy? })
  - Returns { success, digest, effects, objectChanges, treasuryCapObject, coinMetadataObject, publishedObject, curve }.
- buyTokens({ signer|signerPrivateKey, contract|packageId+name, suiInMist, minTokensOut? })
  - Returns { success, digest, effects, objectChanges }.
- sellTokens({ signer|signerPrivateKey, contract|packageId+name, tokensIn, minSuiOut? })
  - Returns { success, digest, effects, objectChanges }.
- listCoins({ apiBaseUrl?, apiKey?, signal?, timeoutMs? })
  - Fetches coin list from https://api.kappa.fun/v1/coins/. x-api-key is optional.

## Math helpers

Re-exported from math.js for pre-trade quoting:
- firstBuyMath(sui_in_mist)
- buyMath(curveState, sui_in_mist)
- sellMath(curveState, tokens_in)
- calculateSuiForTokens(curveState, desiredTokens)
- calculateSuiForFirstBuy(desiredTokens)
- calculatePriceImpact(curveState, suiAmount)
- simulateCurveAfterDevBuy(devBuySuiAmount)
- calculateSuiForBundledPurchase(tokenAmount, devBuySuiAmount)

## Network config

Defaults are for mainnet. Override via initKappa({ networkConfig }).

## Signers

Pass either:
- A Uint8Array secret key (server-side only), or
- A Keypair-like signer with signAndExecuteTransaction (e.g., Ed25519Keypair).

## Browser vs server

- Do not use custodial private keys in the browser. Prefer wallet adapters.
- Token creation (bytecode publish) should run server-side.

## Types

TypeScript declarations are provided at src/index.d.ts.

## File Structure

```
partner-sdk/
├── src/                # SDK entry and modules
│   ├── index.js
│   ├── index.d.ts
│   ├── api.js
│   ├── deploy.js
│   └── trade.js
├── kappa.js            # On-chain functions, client injection helpers
├── math.js             # Bonding curve math (re-exported)
└── move-bytecode/      # WASM for Move bytecode editing (token creation)
```

## License

MIT 