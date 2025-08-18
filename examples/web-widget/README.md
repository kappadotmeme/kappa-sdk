# Kappa Web Widget (Example)

Minimal Next.js widget to buy/sell tokens using the Kappa SDK and Sui wallet (no private keys).

## Run

```bash
npm install
npm run dev
```

- Open http://localhost:3000
- Connect a wallet via the button
- Paste a token contract 0x...::Module::TOKEN
- Enter SUI amount to buy or token units to sell

Note: For production, wire a real wallet adapter signer and proper slippage handling.
