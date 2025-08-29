// @ts-nocheck
"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig, SuiClientProvider, WalletProvider, useConnectWallet, useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction, useSuiClient, useWallets } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useModuleConfig, preloadFactoryConfigs } from './hooks/useModuleConfig';

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

// ... (keep all the existing style constants and utility functions from original Widget.tsx)

const defaultTheme = {
  '--kappa-bg': '#0f1218',
  '--kappa-panel': '#0b0f16',
  '--kappa-input-bg': '#0b0d12',
  '--kappa-border': '#2a2f3a',
  '--kappa-text': '#e5e7eb',
  '--kappa-muted': '#9ca3af',
  '--kappa-accent': '#7aa6cc',
  '--kappa-primary': '#2563eb',
  '--kappa-text-on-primary': '#ffffff',
  '--kappa-success': '#10b981',
  '--kappa-chip-bg': '#151c26',
  '--kappa-chip-border': '#274057',
  '--kappa-status-ok-bg': '#151c26',
  '--kappa-status-ok-border': '#274057',
  '--kappa-status-err-bg': '#2a1515',
  '--kappa-status-err-border': '#7f1d1d',
  '--kappa-tab-active-bg': '#0f172a',
  '--kappa-error': '#f87171',
  '--kappa-avatar-bg': '#233B53',
} as const;

// Enhanced widget component with multi-module support
export function WidgetEmbeddedOptimized(props: {
  theme?: Partial<Record<keyof typeof defaultTheme, string>>,
  defaultContract?: string,
  lockContract?: boolean,
  logoUrl?: string,
  projectName?: string,
  apiBase?: string,
  network?: {
    bondingContract?: string,
    CONFIG?: string,
    globalPauseStatusObjectId?: string,
    poolsId?: string,
    lpBurnManger?: string,
    moduleName?: string,
  },
  // New prop for default factory if known
  defaultFactory?: string,
}) {
  const [contract, setContract] = useState(props.defaultContract || '');
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [suiIn, setSuiIn] = useState('');
  const [tokensIn, setTokensIn] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isPrimaryDisabled, setIsPrimaryDisabled] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [quoteTokens, setQuoteTokens] = useState(0);
  const [quoteSui, setQuoteSui] = useState(0);
  const [curveData, setCurveData] = useState<any>(null);
  const [trendingCoins, setTrendingCoins] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  
  const apiBase = props.apiBase || 'https://api.kappa.fun';
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const signer = currentAccount?.address || null;
  
  // NEW: Get dynamic module config based on token's factory
  const currentTokenFactory = tokenData?.factoryAddress || props.defaultFactory;
  const { config: moduleConfig, loading: configLoading } = useModuleConfig(currentTokenFactory, apiBase);
  
  // Fetch token metadata with factory information
  useEffect(() => {
    if (!contract) {
      setTokenData(null);
      setCurveData(null);
      return;
    }
    
    let cancelled = false;
    const fetchTokenData = async () => {
      try {
        console.log('[Widget] Fetching token data for:', contract);
        const response = await fetch(`${apiBase}/v1/coins/${encodeURIComponent(contract)}`);
        
        if (!response.ok) {
          console.error('[Widget] Failed to fetch token data:', response.statusText);
          return;
        }
        
        const json = await response.json();
        const data = json?.data || json;
        
        if (!cancelled) {
          setTokenData(data);
          console.log('[Widget] Token data with factory:', data.factoryAddress);
          
          // Fetch bonding curve data
          const curveAddress = data.curveAddress || data.bondingCurveObjectId;
          if (curveAddress) {
            const curveRes = await fetch(`${apiBase}/v1/coins/bonding-curve/${curveAddress}`);
            if (curveRes.ok) {
              const curveJson = await curveRes.json();
              setCurveData(curveJson?.data || curveJson);
            }
          }
        }
      } catch (err) {
        console.error('[Widget] Error fetching token data:', err);
      }
    };
    
    fetchTokenData();
    return () => { cancelled = true; };
  }, [contract, apiBase]);
  
  // Preload factory configs for search results
  useEffect(() => {
    if (searchResults.length > 0) {
      preloadFactoryConfigs(searchResults, apiBase);
    }
  }, [searchResults, apiBase]);
  
  // Enhanced buy function with dynamic module config
  const onBuy = async () => {
    try {
      if (!signer) {
        alert('Connect wallet first');
        return;
      }
      
      if (configLoading) {
        alert('Loading module configuration, please wait...');
        return;
      }
      
      if (!moduleConfig) {
        alert('Unable to load module configuration');
        return;
      }
      
      setTxOpen(true);
      setTxLoading(true);
      setTxDigest(null);
      setTxError(null);
      
      const tradeMod = await import('../../kappa-trade.js');
      const trade = (tradeMod as any).default || tradeMod as any;
      trade.setSuiClient(client);
      
      // Use dynamic module config
      console.log('[Widget] Using dynamic module config:', moduleConfig);
      trade.setNetworkConfig(moduleConfig);
      
      const [pkg, mod, typeName] = contract.split('::');
      const slip = Math.max(0, Math.min(100, Number(slippage) || 0));
      const minOut = Math.floor(Math.max(0, quoteTokens) * (1 - slip / 100));
      
      const tradeParams = {
        publishedObject: { packageId: pkg },
        name: (mod || '').replaceAll('_', ' '),
        sui: Math.floor(parseFloat(suiIn) * 1e9),
        min_tokens: minOut,
        moduleName: mod || '',
        typeName: typeName || '',
      };
      
      console.log('[Widget] Buy params with factory:', {
        factory: currentTokenFactory,
        moduleConfig,
        ...tradeParams
      });
      
      const res = await (trade as any).buyWeb3(signer as any, tradeParams);
      if (res?.success) {
        setTxDigest(res?.digest || null);
      } else {
        setTxError(res?.error || 'unknown error');
      }
    } catch (e: any) {
      console.error('[Widget] Buy error:', e);
      alert('Buy failed: ' + (e?.message || String(e)));
    } finally {
      setTxLoading(false);
    }
  };
  
  // Enhanced sell function with dynamic module config
  const onSell = async () => {
    try {
      if (!signer) {
        alert('Connect wallet first');
        return;
      }
      
      if (configLoading) {
        alert('Loading module configuration, please wait...');
        return;
      }
      
      if (!moduleConfig) {
        alert('Unable to load module configuration');
        return;
      }
      
      setTxOpen(true);
      setTxLoading(true);
      setTxDigest(null);
      setTxError(null);
      
      const tradeMod = await import('../../kappa-trade.js');
      const trade = (tradeMod as any).default || tradeMod as any;
      trade.setSuiClient(client);
      
      // Use dynamic module config
      console.log('[Widget] Using dynamic module config for sell:', moduleConfig);
      trade.setNetworkConfig(moduleConfig);
      
      const [pkg, mod, typeName] = contract.split('::');
      const slip = Math.max(0, Math.min(100, Number(slippage) || 0));
      const minOut = Math.floor(Math.max(0, quoteSui) * (1 - slip / 100) * 1e9);
      
      const tradeParams = {
        publishedObject: { packageId: pkg },
        name: (mod || '').replaceAll('_', ' '),
        token_amount: Math.floor(parseFloat(tokensIn)),
        min_sui: minOut,
        moduleName: mod || '',
        typeName: typeName || '',
      };
      
      console.log('[Widget] Sell params with factory:', {
        factory: currentTokenFactory,
        moduleConfig,
        ...tradeParams
      });
      
      const res = await (trade as any).sellWeb3(signer as any, tradeParams);
      if (res?.success) {
        setTxDigest(res?.digest || null);
      } else {
        setTxError(res?.error || 'unknown error');
      }
    } catch (e: any) {
      console.error('[Widget] Sell error:', e);
      alert('Sell failed: ' + (e?.message || String(e)));
    } finally {
      setTxLoading(false);
    }
  };
  
  // Rest of the component remains the same...
  // (Include all the UI rendering logic, search functionality, etc. from the original Widget.tsx)
  
  return (
    <div>
      {/* Module Config Status Indicator */}
      {currentTokenFactory && (
        <div style={{
          padding: '8px 12px',
          marginBottom: 10,
          borderRadius: 8,
          background: 'var(--kappa-chip-bg)',
          border: '1px solid var(--kappa-chip-border)',
          fontSize: 12,
          color: 'var(--kappa-muted)',
        }}>
          Factory: {currentTokenFactory.slice(0, 6)}...{currentTokenFactory.slice(-4)}
          {configLoading && ' (Loading config...)'}
          {moduleConfig && !configLoading && ' ✓'}
        </div>
      )}
      
      {/* Rest of the UI from original Widget.tsx */}
      {/* ... */}
    </div>
  );
}

// Standalone version with providers
export function WidgetStandaloneOptimized(props: Parameters<typeof WidgetEmbeddedOptimized>[0]) {
  const queryClient = useMemo(() => new QueryClient(), []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect={false}>
          <WidgetEmbeddedOptimized {...props} />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
