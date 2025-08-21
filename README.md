# Kappa Partner SDK (Sui)

SDK for creating and trading tokens on Kappa’s Sui bonding curve. Exposes create/buy/sell and quoting math. The coin listing API is open for now; x-api-key is optional.

## Install

```bash
npm install kappa-sdk @mysten/sui
```

For the React widget in a Next/React app:

```bash
npm install kappa-sdk @tanstack/react-query @mysten/dapp-kit @mysten/sui react react-dom
```

## Quickstart (Node)

```js
const { initKappa, buyTokens, sellTokens, listCoins } = require('kappa-sdk');
const { createToken } = require('kappa-sdk/server'); // server-only
const { SuiClient, getFullnodeUrl, Ed25519Keypair } = require('@mysten/sui');

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });
initKappa({ client, logger: console.log });

// Your signer: either a Keypair or a Uint8Array secret key (server-side only)
const signer = Ed25519Keypair.fromSecretKey(/* Uint8Array secret key */);

// Create + launch (optional first buy) — server-only
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

### HTTP API schema

- Base URL: `https://api.kappa.fun`

- GET `/v1/coins?nameOrSymbol={q}`
  - **Query**: `nameOrSymbol` (string; case-insensitive)
  - **Response**: `{ data: Coin[] }`

- GET `/v1/coins/trending`
  - **Response**: `{ data: Coin[] }`

Type: `Coin` (fields are sourced from multiple backends; some are optional)

- `contractAddress` | `coinType` | `contract`: canonical coin type (e.g., `0x...::Module::TOKEN`)
- `symbol`: string (e.g., `PEPE`)
- `name`: string (e.g., `Pepe Coin`)
- `avatarUrl` | `icon` | `avatar` | `logo` | `image` | `img` | `iconUrl`: image URL (pick any present; `ipfs://` may appear)
- Bonding/curve identifier (one of):
  - `bondingContractAddress` | `bondingAddress` | `bondingContract` | `bonding` | `bonding_object` | `bondingObject`
  - `curve` | `curveId` | `curveAddress` | `curve_object` | `curveObject`
- Migration indicators (if present, treat as migrated and exclude for bonding-curve trading):
  - `pairAddress` | `pairContractAddress` | `pair` | `pair_object` | `pairObject` | `poolAddress` | `lpAddress`

Example response (truncated):

```json
{
  "data": [
    {
      "contractAddress": "0x...::My_Coin::MY_COIN",
      "symbol": "MYC",
      "name": "My Coin",
      "avatarUrl": "https://.../myc.png",
      "bondingContractAddress": "0x...",
      "curveId": "0x..."
    }
  ]
}
```

## React Web Widget

Two ready-to-use React components power an embeddable buy/sell widget on Sui:

- `WidgetStandalone`: includes its own providers (`QueryClientProvider`, `SuiClientProvider`, `WalletProvider`).
- `WidgetEmbedded`: uses providers from the host app (bring your own).

Import (CommonJS):

```js
const { WidgetStandalone, WidgetEmbedded } = require('kappa-sdk/react');
```

Import (ESM):

```js
import { WidgetStandalone, WidgetEmbedded } from 'kappa-sdk/react';
```

### Standalone usage (plug-and-play)

Minimal Next.js page:

```tsx
import { WidgetStandalone } from 'kappa-sdk/react';

export default function Page() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
      <WidgetStandalone />
    </div>
  );
}
```

Optional props (branding, theming, defaults):

```tsx
<WidgetStandalone
  projectName="Kappa"
  logoUrl="https://your.cdn/logo.png"
  theme={{ '--kappa-primary': '#8b5cf6' }}
  defaultContract="0x...::My_Coin::MY_COIN"   // preselect a token
  lockContract={false}                         // true disables search/changes
/>
```

### Integrated usage (reuse your app providers)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { WidgetEmbedded } from 'kappa-sdk/react';

const { networkConfig } = createNetworkConfig({ mainnet: { url: 'https://fullnode.mainnet.sui.io:443' } });
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <WidgetEmbedded
            projectName="Kappa"
            defaultContract="0x...::My_Coin::MY_COIN"
          />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

### Default token examples

- Preload a default token but allow users to change it:

```tsx
<WidgetStandalone defaultContract="0x...::My_Coin::MY_COIN" />
```

- Lock the widget to a single token (no search/input):

```tsx
<WidgetEmbedded defaultContract="0x...::My_Coin::MY_COIN" lockContract />
```

### Props reference

All widget props are optional:

- `projectName?: string` – label shown in the top-left of the widget
- `logoUrl?: string` – custom logo image URL
- `theme?: Record<'--kappa-*', string>` – override CSS variables (see Theming below)
- `defaultContract?: string` – preselected coin type `0x...::Module::TOKEN`
- `lockContract?: boolean` – when true, disables search/editing of the token field

### Next.js notes

If your app imports the widget from the SDK (outside your `app/` directory), Next may require these settings:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { externalDir: true },
  transpilePackages: [
    'kappa-sdk',
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@tanstack/react-query',
  ],
};
export default nextConfig;
```

### Widget features

- Token search with dropdown (by symbol/name), avatar preview, and contract address abbreviation
- Excludes migrated tokens (pair/pool addresses detected)
- Buy/Sell tabs, numeric-only inputs, quick-select chips, slippage presets
- Slippage icon button and settings panel with presets
- Balance chip with SUI or token balance; SUI loads immediately on wallet connect
- Theming via CSS variables; pass a `theme` prop to override `--kappa-*` tokens
- Wallet connect UI with dropdown, hover effects, and click-outside
- Transaction modal with blurred backdrop, amount summary, Suivision link, and close

### Theming

All colors are driven by CSS variables on the widget root. Override any subset:

```tsx
<WidgetStandalone
  theme={{
    '--kappa-bg': '#111318',
    '--kappa-primary': '#8b5cf6',
    '--kappa-accent': '#7aa6cc',
  }}
/>
```

Available tokens include:

`--kappa-bg`, `--kappa-panel`, `--kappa-input-bg`, `--kappa-border`, `--kappa-text`, `--kappa-muted`, `--kappa-accent`, `--kappa-primary`, `--kappa-text-on-primary`, `--kappa-success`, `--kappa-chip-bg`, `--kappa-chip-border`, `--kappa-status-ok-bg`, `--kappa-status-ok-border`, `--kappa-status-err-bg`, `--kappa-status-err-border`, `--kappa-tab-active-bg`, `--kappa-error`, `--kappa-avatar-bg`.

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
- Token creation (bytecode publish) should run server-side. Import from `kappa-sdk/server` only.

### Server-only entry quickstart

```js
// Node only
const { createToken } = require('kappa-sdk/server');
```

## Types

TypeScript declarations are provided at src/index.d.ts.

## File Structure

```
kappa-sdk/
├── src/                # SDK entry and modules
│   ├── index.js
│   ├── index.d.ts
│   ├── api.js
│   ├── deploy.js
│   └── trade.js
├── kappa.js            # On-chain functions, client injection helpers
├── kappa-trade.js      # Web3 trade helpers used by the widget
├── math.js             # Bonding curve math (re-exported)
├── src/react/         # React widget (Widget.tsx) and re-exports
└── move-bytecode/     # WASM for Move bytecode editing (token creation)
```

## License

MIT 

## Releases

Automated npm publish on semver tags via GitHub Actions.

Prereqs:
- Add `NPM_TOKEN` (automation token) to repo secrets.
- Ensure `package.json` version is updated.

Release steps:
1. Merge your changes to `main` (CI must be green).
2. Bump version in `package.json` (or use your chosen versioning tool).
3. Tag the commit, e.g. `git tag v1.3.0 && git push --tags`.
4. The `Release` workflow will publish to npm with provenance.

Example consumers can then install `kappa-sdk@^1.3.x` and import `kappa-sdk/react`.