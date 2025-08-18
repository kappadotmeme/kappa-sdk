"use client";
import { useEffect, useMemo, useState } from 'react';
import { createClient, SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { ConnectButton, createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

export default function Page() {
  const [contract, setContract] = useState('');
  const [suiIn, setSuiIn] = useState('0');
  const [tokensIn, setTokensIn] = useState('0');
  const client = useMemo(() => new SuiClient({ url: networkConfig.mainnet.url }), []);

  const onBuy = async () => {
    try {
      const sdk = await import('../../../src/index.js');
      sdk.initKappa({ client });
      const res = await sdk.buyTokens({
        signer: (window as any).__walletSigner,
        contract,
        suiInMist: Math.floor(parseFloat(suiIn) * 1e9),
        minTokensOut: 0,
      });
      alert('Buy submitted: ' + (res?.digest || 'ok'));
    } catch (e: any) {
      alert('Buy failed: ' + (e?.message || String(e)));
    }
  };

  const onSell = async () => {
    try {
      const sdk = await import('../../../src/index.js');
      sdk.initKappa({ client });
      const res = await sdk.sellTokens({
        signer: (window as any).__walletSigner,
        contract,
        tokensIn: Math.floor(parseFloat(tokensIn)),
        minSuiOut: 0,
      });
      alert('Sell submitted: ' + (res?.digest || 'ok'));
    } catch (e: any) {
      alert('Sell failed: ' + (e?.message || String(e)));
    }
  };

  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
      <WalletProvider autoConnect>
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
          <div style={{ width: 360, background: '#111827', borderRadius: 16, padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Kappa Trade</h2>
              <ConnectButton onConnect={(w) => ((window as any).__walletSigner = (w as any).account)} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Token contract (0x..::Module::TOKEN)</label>
              <input value={contract} onChange={(e) => setContract(e.target.value)} placeholder="0x...::My_Coin::MY_COIN" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #374151', background: '#0b0d12', color: '#e5e7eb' }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Buy: SUI amount</label>
              <input value={suiIn} onChange={(e) => setSuiIn(e.target.value)} placeholder="0.1" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #374151', background: '#0b0d12', color: '#e5e7eb' }} />
              <button onClick={onBuy} style={{ marginTop: 8, width: '100%', padding: 10, borderRadius: 8, background: '#2563eb', color: 'white', border: 'none' }}>Buy</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <label>Sell: token amount (smallest units)</label>
              <input value={tokensIn} onChange={(e) => setTokensIn(e.target.value)} placeholder="1000000000" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #374151', background: '#0b0d12', color: '#e5e7eb' }} />
              <button onClick={onSell} style={{ marginTop: 8, width: '100%', padding: 10, borderRadius: 8, background: '#10b981', color: 'white', border: 'none' }}>Sell</button>
            </div>
          </div>
        </div>
      </WalletProvider>
    </SuiClientProvider>
  );
}


