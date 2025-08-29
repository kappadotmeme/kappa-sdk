/**
 * Multi-Module Integration Examples (Updated)
 *
 * These examples demonstrate how to integrate the Kappa trading widget with
 * dynamic module resolution, aligned with src/react/Widget.tsx behavior.
 */

import React, { useEffect, useState } from 'react';
import { WidgetStandalone, WidgetEmbedded } from 'kappa-create/react';
import { useModuleConfig, preloadFactoryConfigs, clearModuleConfigCache } from 'kappa-create/react/hooks';

// ============================================================================
// Example 1: Simple Token Trading Page
// ============================================================================
export function SimpleTradingPage() {
  return (
    <WidgetStandalone
      projectName="My DEX"
      // The widget auto-detects factory/module based on the token
    />
  );
}

// ============================================================================
// Example 2: Token List with Preloading
// ============================================================================
export function TokenListWithTrading() {
  const [tokens, setTokens] = useState([] as any[]);
  const [selectedToken, setSelectedToken] = useState(null as any);
  const apiBase = 'https://api.kappa.fun';

  useEffect(() => {
    fetch(`${apiBase}/v1/coins/trending?page=1&size=50`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data?.coins || [];
        setTokens(list);
        preloadFactoryConfigs(list, apiBase);
      });
  }, [apiBase]);

  return (
    <div>
      <div className="token-list">
        {tokens.map((token) => (
          <button key={token.address} onClick={() => setSelectedToken(token)}>
            {token.symbol || token.name}
          </button>
        ))}
      </div>

      {selectedToken && (
        <WidgetEmbedded
          defaultContract={selectedToken.address}
        />
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Custom Trading Interface with Module Indicator
// ============================================================================
export function CustomTradingInterface({ tokenAddress }: { tokenAddress: string }) {
  const [tokenData, setTokenData] = useState(null as any);
  const apiBase = 'https://api.kappa.fun';

  useEffect(() => {
    fetch(`${apiBase}/v1/coins/${encodeURIComponent(tokenAddress)}`)
      .then((res) => res.json())
      .then((data) => setTokenData(data?.data || null));
  }, [tokenAddress]);

  const { config, loading } = useModuleConfig(tokenData?.factoryAddress, apiBase);

  return (
    <div className="trading-interface">
      <div className="module-indicator">
        {loading ? 'Loading module…' : (config?.moduleName || 'kappadotmeme')}
      </div>

      <WidgetEmbedded
        defaultContract={tokenAddress}
        // Optional: force a specific module if you already resolved it
        // network={config || undefined}
      />
    </div>
  );
}

// ============================================================================
// Example 4: Utility – Clear Cache
// ============================================================================
export function ClearCacheButton() {
  return (
    <button onClick={() => clearModuleConfigCache()}>
      Clear module config cache
    </button>
  );
}


