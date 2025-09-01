// @ts-nocheck
"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig, SuiClientProvider, WalletProvider, useConnectWallet, useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction, useSuiClient, useWallets } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Default API base URL for Kappa API
const DEFAULT_API_BASE = 'https://api.kappa.fun';

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 12,
  color: 'var(--kappa-muted)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 10,
  borderRadius: 10,
  border: '1px solid var(--kappa-border)',
  background: 'var(--kappa-input-bg)',
  color: 'var(--kappa-text)',
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
};

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 10,
  background: 'var(--kappa-primary)',
  color: 'var(--kappa-text-on-primary)',
  border: 'none',
  cursor: 'pointer',
};

const successBtn: React.CSSProperties = {
  ...primaryBtn,
  background: 'var(--kappa-success)',
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: 10,
  border: '1px solid var(--kappa-border)',
  background: active ? 'var(--kappa-tab-active-bg)' : 'var(--kappa-panel)',
  color: active ? 'var(--kappa-text)' : 'var(--kappa-muted)',
  borderRadius: 10,
  cursor: 'pointer',
});

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

// Inline SVG fallbacks so assets work even if host app doesn't serve them from /public
const DEFAULT_LOGO_DATA = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.1268 21.8877C13.7496 26.7985 8.64625 34.9674 7.14173 38.4375C9.30824 36.7042 13.3404 35.107 15.0856 34.5257C8.44164 42.5177 6.5002 50.6145 6.35938 53.6633C8.52589 50.582 11.234 48.7284 12.3173 48.1868C8.80272 57.1417 10.4914 65.0772 11.7757 67.9261C12.0164 66.1929 13.4403 63.5125 14.1227 62.3895C14.6523 64.9893 16.4301 68.0862 17.2521 69.3103L19.4788 66.1207C17.9863 63.9061 17.7733 60.0629 17.8539 58.4176C14.9171 53.9401 16.3097 47.5645 17.3725 44.937C18.3354 40.1225 22.1063 35.9905 23.872 34.5257C24.333 36.9329 26.3154 42.3011 30.5521 44.5157C30.2151 42.59 31.3742 39.2198 31.9965 37.7755C33.3 39.9624 37.3405 44.7204 43.0698 46.261C41.9624 43.6612 42.6088 39.5207 43.0698 37.7755C45.0353 39.5412 49.9906 43.1436 54.0829 43.4325C53.0237 42.3733 52.1968 38.9394 51.9164 37.3542C53.7218 38.8383 58.6567 41.928 63.9526 42.4094C62.3157 40.3873 61.0242 37.2736 60.5824 35.97C67.2746 38.8106 70.954 45.2981 71.9567 48.1868C75.4231 60.0304 71.5956 67.7251 69.2485 70.0927C71.6076 69.9964 75.0463 66.5215 76.4702 64.7967C76.6628 80.1068 65.4715 87.1034 59.8519 88.6886C58.9154 90.2316 57.8731 91.4942 57.2725 92.1189C66.5644 91.2042 73.7825 84.0751 76.2295 80.6243C76.2776 82.0205 75.5675 84.0546 75.2064 84.8972C81.7541 81.3826 84.3539 72.8008 84.8354 68.9492C85.3566 70.3731 86.4001 73.8961 86.4001 76.5922C91.0701 69.7075 90.5129 60.3638 89.6499 56.5519C90.6128 57.4342 92.8996 60.0063 94.344 63.232C95.8365 52.4957 89.2286 41.266 85.7381 36.9931C87.8649 37.8561 92.4423 39.8818 93.7422 41.0854C90.3239 31.9861 81.8865 24.6957 78.0951 22.1886C80.7431 17.3741 78.4562 10.7542 67.8042 7.74515C59.2825 5.33791 51.6155 5.01654 48.8472 5.15737C21.212 6.98687 19.5186 17.0732 22.1268 21.8877Z" fill="#141315"/></svg>`);
const TRIP_ICON_DATA = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg width="226" height="226" viewBox="0 0 226 226" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M119.76 9C109.345 9 107.088 17.3321 107.262 21.4982C104.138 60.5551 90.0758 54.8268 67.1624 70.9703C48.8317 83.8851 42.8604 106.555 42.166 116.276V154.812C42.5132 157.937 45.4989 164.394 54.6642 165.228C63.8296 166.061 66.8153 158.631 67.1624 154.812V126.691C67.1624 116.276 68.5511 111.589 69.2455 110.548L137.986 214.7C140.416 216.436 146.943 218.866 153.608 214.7C160.274 210.534 158.816 202.201 157.254 198.556L118.718 139.19H159.337L175.48 161.062C178.605 165.748 185.375 167.311 193.186 162.103C199.435 157.937 198.289 149.084 196.831 147.001C191.971 140.058 181.104 124.921 176.522 119.922C171.939 114.922 166.627 113.673 164.544 113.673L126.008 113.152L102.574 79.8232C125.487 66.9084 131.347 43.3701 132.258 21.4982C132.432 17.3321 130.175 9 119.76 9Z" fill="white" stroke="white"/><circle cx="48.4119" cy="41.2869" r="19.2888" fill="white" stroke="white"/></svg>`);

const abbreviateContract = (val: string) => {
  if (!val || val.length <= 20) return val;
  const head = val.slice(0, 5);
  const tail = val.slice(-12);
  return `${head}...${tail}`;
};

const sanitizeDecimalInput = (raw: string): string => {
  let v = String(raw || '').replace(/[^0-9.]/g, '');
  const firstDot = v.indexOf('.');
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
  }
  return v;
};

function AmountRow(props: {
  mode: 'buy' | 'sell';
  suiIn: string;
  tokensIn: string;
  onSuiChange: (v: string) => void;
  onTokensChange: (v: string) => void;
  tokenSymbol: string;
  tokenAvatarUrl: string;
}) {
  const { mode, suiIn, tokensIn, onSuiChange, onTokensChange, tokenSymbol, tokenAvatarUrl } = props;
  const SUI_LOGO_URL = 'https://strapi-dev.scand.app/uploads/sui_c07df05f00.png';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px', alignItems: 'center', border: '1px solid var(--kappa-border)', background: 'var(--kappa-panel)', borderRadius: 10 }}>
      <input
        placeholder="0"
        value={mode === 'buy' ? suiIn : tokensIn}
        onChange={(e) => {
          const v = sanitizeDecimalInput(e.target.value);
          if (mode === 'buy') onSuiChange(v); else onTokensChange(v);
        }}
        inputMode="decimal"
        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--kappa-text)', fontSize: 18, height: 44, padding: '0 10px' }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--kappa-border)', height: '100%' }}>
        {mode === 'sell' ? (
          tokenAvatarUrl ? (
            <img src={tokenAvatarUrl} alt="token" crossOrigin="anonymous" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--kappa-avatar-bg)' }} />
          )
        ) : (
          <img src={SUI_LOGO_URL} alt="SUI" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
        )}
      </div>
    </div>
  );
}

function SlippagePanel(props: { slippage: string; setSlippage: (v: string) => void; onClose: () => void }) {
  const { slippage, setSlippage, onClose } = props;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  return (
    <div style={{ paddingTop: 8, paddingLeft: 4, paddingRight: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <h3 style={{ margin: 0, color: '#e5e7eb' }}>Slippage Settings</h3>
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={labelStyle}>Max slippage (%)</label>
        <input value={slippage} onChange={(e) => setSlippage(e.target.value)} placeholder="1" style={inputStyle} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, justifyContent: 'center' }}>
          {['0.5', '1', '2', '5', '10', '20', '25'].map((v, i) => (
            <button
              key={v}
              onClick={() => setSlippage(v)}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--kappa-chip-border)',
                background: slippage === v ? 'var(--kappa-chip-bg)' : (hoverIdx===i ? 'var(--kappa-panel)' : 'transparent'),
                color: 'var(--kappa-text)',
                cursor: 'pointer',
                transition: 'background 120ms ease'
              }}
            >
              {v}%
            </button>
          ))}
        </div>
        <p style={{ marginTop: 12, color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>Lower slippage gives better price protection but may cause failures. 1–2% is typical; increase for volatile moves.</p>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--kappa-border)', background: 'var(--kappa-panel)', color: 'var(--kappa-text)', cursor: 'pointer', marginBottom: 10 }}>Save & Return</button>
      </div>
    </div>
  );
}

function ContractInput(props: {
  contract: string;
  setContract: (v: string) => void;
  tokenSymbol: string;
  tokenName: string;
  tokenAvatarUrl: string;
  onClear: () => void;
  searchResults: any[];
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  onSelectResult: (item: any) => void;
  isSearching: boolean;
  inputFocused: boolean;
  setInputFocused: (v: boolean) => void;
  setHasUserInteracted: (v: boolean) => void;
  locked?: boolean;
}) {
  const { contract, setContract, tokenSymbol, tokenName, tokenAvatarUrl, onClear, searchResults, showSearch, setShowSearch, onSelectResult, isSearching, inputFocused, setInputFocused, setHasUserInteracted, locked } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const showCA = !!contract && contract.includes('::');
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && rootRef.current.contains(e.target)) return;
      setShowSearch(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [setShowSearch]);
  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <input
        value={showCA ? '' : contract}
        onChange={(e) => { if (!locked) { setContract(e.target.value); } }}
        onFocus={() => { if (!locked) { setInputFocused(true); setHasUserInteracted(true); } }}
        onBlur={() => { if (!locked) { setInputFocused(false); setShowSearch(false); } }}
        placeholder={showCA ? '' : "Insert name, symbol or contract address"}
        title={contract}
        style={{ ...inputStyle, paddingRight: (tokenSymbol || tokenName) ? 220 : 10, paddingLeft: showCA ? 170 : 10, opacity: locked ? 0.85 : 1 }}
        disabled={!!locked}
      />
      {showCA && (
        <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          {tokenAvatarUrl ? (
            <img src={tokenAvatarUrl} alt="token" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--kappa-avatar-bg)' }} />
          )}
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{abbreviateContract(contract)}</span>
        </div>
      )}
      <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 8, alignItems: 'center', maxWidth: 220 }}>
        {(tokenSymbol || tokenName) && (
          <span
            title={`${tokenSymbol ? `$${tokenSymbol}` : ''}${tokenName ? (tokenSymbol ? ' | ' : '') + tokenName : ''}`}
            style={{ fontSize: 12, color: '#e5e7eb', fontWeight: 500, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}
          >
            {tokenSymbol ? `$${tokenSymbol}` : ''}{tokenName ? (tokenSymbol ? ' | ' : '') + tokenName : ''}
          </span>
        )}
        {(tokenSymbol || tokenName) && !locked && (
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => { onClear(); setShowSearch(false); setInputFocused(false); }}
            title="Clear"
            style={{ border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 14 }}
          >
            🗑
          </button>
        )}
      </div>
      {!locked && showSearch && inputFocused && searchResults.length > 0 && (
        <div className="kappa-dropdown" style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 6, background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 10, maxHeight: 262, overflowY: 'auto', zIndex: 5, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', scrollbarWidth: 'thin' }}>
          {(!contract || String(contract).trim()==='') && (
            <div style={{ position: 'sticky', top: 0, background: 'var(--kappa-panel)', padding: '8px 12px', borderBottom: '1px solid var(--kappa-border)', color: '#9ca3af', fontSize: 12, zIndex: 1 }}>
              Trending on Kappa
            </div>
          )}
          {isSearching ? (
            <div style={{ padding: 10, color: '#9ca3af', fontSize: 12 }}>Searching…</div>
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((item: any) => (
              <button key={String(item.guid || item.contractAddress || item.address || item.coinType || item.contract || item.id || item.name || item.symbol)}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onSelectResult(item); }}
                style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer', gap: 10 }}
              >
                {item.avatarUrl ? (
                  <img src={String(item.avatarUrl)} alt="token" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--kappa-avatar-bg)' }} />
                )}
                <span style={{ color: '#e5e7eb', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ${String(item.symbol || '').toUpperCase()} {String(item.name || '') ? '| ' + String(item.name) : ''}
                </span>
                <span style={{ color: '#6b7280', fontSize: 12 }}>{abbreviateContract(String(item.address || item.contractAddress || item.coinType || item.contract || ''))}</span>
              </button>
            ))
          ) : (
            <div style={{ padding: 10, color: '#9ca3af', fontSize: 12 }}>No results</div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickSelectRow(props: { values: string[]; onPick: (v: string) => void }) {
  const { values, onPick } = props;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
      {values.map((v, i) => (
        <button
          key={v}
          onClick={() => onPick(v)}
          onMouseEnter={() => setHoverIdx(i)}
          onMouseLeave={() => setHoverIdx(null)}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid var(--kappa-chip-border)',
            background: hoverIdx===i ? 'var(--kappa-panel)' : 'var(--kappa-chip-bg)',
            color: v === 'MAX' ? '#f87171' : 'var(--kappa-accent)',
            minWidth: 54,
            textAlign: 'center',
            transition: 'background 120ms ease'
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function TradePanelView(props: {
  contract: string;
  setContract: (v: string) => void;
  tokenSymbol: string;
  tokenName: string;
  tokenAvatarUrl: string;
  clearContract: () => void;
  searchResults: any[];
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  onSelectResult: (item: any) => void;
  isSearching: boolean;
  inputFocused: boolean;
  setInputFocused: (v: boolean) => void;
  setHasUserInteracted: (v: boolean) => void;
  mode: 'buy' | 'sell';
  setMode: (m: 'buy' | 'sell') => void;
  suiBalance: number;
  tokenBalance: number;
  setView: (v: 'trade' | 'slippage') => void;
  maxBuys: string[];
  maxSells: string[];
  handleQuick: (v: string) => void;
  amountProps: {
    mode: 'buy' | 'sell';
    suiIn: string;
    tokensIn: string;
    onSuiChange: (v: string) => void;
    onTokensChange: (v: string) => void;
    tokenSymbol: string;
    tokenAvatarUrl: string;
  };
  youReceive: string;
  onPrimary: () => void;
  primaryLabel: string;
  statusText: string;
  hasError: boolean;
  isPrimaryDisabled: boolean;
  locked?: boolean;
}) {
  const {
    contract, setContract, tokenSymbol, tokenName, tokenAvatarUrl, clearContract,
    searchResults, showSearch, setShowSearch, onSelectResult, isSearching, inputFocused, setInputFocused, setHasUserInteracted,
    mode, setMode,
    suiBalance, tokenBalance, setView, maxBuys, maxSells, handleQuick,
    amountProps, youReceive, onPrimary, primaryLabel, statusText, hasError, isPrimaryDisabled, locked
  } = props;

  return (
    <div style={{ paddingLeft: 4, paddingRight: 4 }}>
      <div className="kappa-tabs" style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          style={{
            ...tabBtn(mode === 'buy'),
            background: mode === 'buy' ? 'rgba(16,185,129,0.15)' : 'var(--kappa-panel)',
            borderColor: 'rgba(16,185,129,0.35)'
          }}
          onClick={() => setMode('buy')}
        >
          Buy
        </button>
        <button
          style={{
            ...tabBtn(mode === 'sell'),
            background: mode === 'sell' ? 'rgba(248,113,113,0.15)' : 'var(--kappa-panel)',
            borderColor: 'rgba(248,113,113,0.35)'
          }}
          onClick={() => setMode('sell')}
        >
          Sell
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Select a coin</label>
        <ContractInput
          contract={contract}
          setContract={setContract}
          tokenSymbol={tokenSymbol}
          tokenName={tokenName}
          tokenAvatarUrl={tokenAvatarUrl}
          onClear={clearContract}
          searchResults={searchResults}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          onSelectResult={onSelectResult}
          isSearching={isSearching}
          inputFocused={inputFocused}
          setInputFocused={setInputFocused}
          setHasUserInteracted={setHasUserInteracted}
          locked={locked}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--kappa-chip-border)', background: 'var(--kappa-chip-bg)' }}>
          {(mode === 'buy') ? (
            (() => { const SUI_LOGO_URL = 'https://strapi-dev.scand.app/uploads/sui_c07df05f00.png'; return <img src={SUI_LOGO_URL} alt="SUI" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 18, height: 18, borderRadius: '50%' }} /> })()
          ) : (
            tokenAvatarUrl ? (
              <img src={tokenAvatarUrl} alt="token" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 18, height: 18, borderRadius: 6, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--kappa-avatar-bg)' }} />
            )
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: 'var(--kappa-muted)', fontSize: 12 }}>Balance</span>
            <span style={{ color: 'var(--kappa-text)', fontWeight: 600, fontSize: 13 }}>
              {mode === 'buy'
                ? `${suiBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} SUI`
                : `${tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${tokenSymbol}`}
            </span>
          </div>
        </div>
        <button onClick={() => setView('slippage')} title="Slippage settings" style={{ padding: 6, borderRadius: 8, border: '1px solid var(--kappa-border)', background: 'var(--kappa-panel)', color: 'var(--kappa-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
          <img src={'data:image/svg+xml;utf8,<svg width="226" height="226" viewBox="0 0 226 226" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M119.76 9C109.345 9 107.088 17.3321 107.262 21.4982C104.138 60.5551 90.0758 54.8268 67.1624 70.9703C48.8317 83.8851 42.8604 106.555 42.166 116.276V154.812C42.5132 157.937 45.4989 164.394 54.6642 165.228C63.8296 166.061 66.8153 158.631 67.1624 154.812V126.691C67.1624 116.276 68.5511 111.589 69.2455 110.548L137.986 214.7C140.416 216.436 146.943 218.866 153.608 214.7C160.274 210.534 158.816 202.201 157.254 198.556L118.718 139.19H159.337L175.48 161.062C178.605 165.748 185.375 167.311 193.186 162.103C199.435 157.937 198.289 149.084 196.831 147.001C191.971 140.058 181.104 124.921 176.522 119.922C171.939 114.922 166.627 113.673 164.544 113.673L126.008 113.152L102.574 79.8232C125.487 66.9084 131.347 43.3701 132.258 21.4982C132.432 17.3321 130.175 9 119.76 9Z" fill="white" stroke="white"/><circle cx="48.4119" cy="41.2869" r="19.2888" fill="white" stroke="white"/></svg>'} alt="slip" style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <AmountRow {...amountProps} />
      </div>

      <div className="kappa-quick">
        <QuickSelectRow values={(mode === 'buy' ? maxBuys : maxSells)} onPick={handleQuick} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ color: 'var(--kappa-accent)', fontSize: 13 }}>You receive:</span>
        <span style={{ color: 'var(--kappa-text)', fontSize: 13 }}>{youReceive}</span>
      </div>

      <div style={{ marginTop: 10, border: `1px dotted ${hasError ? 'var(--kappa-status-err-border)' : 'var(--kappa-status-ok-border)'}`, background: hasError ? 'var(--kappa-status-err-bg)' : 'var(--kappa-status-ok-bg)', borderRadius: 6, padding: 6, color: hasError ? 'var(--kappa-error)' : 'var(--kappa-text)', fontSize: 12 }}>
        {statusText}
      </div>

      <div style={{ height: 8 }} />
      <button className="kappa-primary-btn" onClick={onPrimary} disabled={isPrimaryDisabled} style={{ ...primaryBtn, marginTop: 14, opacity: isPrimaryDisabled ? 0.6 : 1, cursor: isPrimaryDisabled ? 'not-allowed' : 'pointer' }}>{primaryLabel}</button>
      <div style={{ height: 26 }} />
    </div>
  );
}

function TransactionModal(props: {
  open: boolean;
  loading: boolean;
  digest: string | null;
  error: string | null;
  spentLabel: string;
  forLabel: string;
  onClose: () => void;
}) {
  const { open, loading, digest, error, spentLabel, forLabel, onClose } = props;
  if (!open) return null;
  const statusText = loading ? 'Submitting…' : (error ? `Failed: ${error}` : 'Submitted');
  const explorer = digest ? `https://suivision.xyz/txblock/${digest}?network=mainnet` : '';
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 50, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderRadius: 16 }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 12, padding: 16, color: 'var(--kappa-text)', boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Transaction</h3>
        <div style={{ fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: 'var(--kappa-muted)' }}>Amount spent</span> ➜ <span style={{ fontWeight: 600 }}>{spentLabel}</span>
        </div>
        <div style={{ fontSize: 13, marginBottom: 12 }}>
          <span style={{ color: 'var(--kappa-muted)' }}>For</span> ➜ <span style={{ fontWeight: 600 }}>{forLabel}</span>
        </div>
        <div style={{ fontSize: 13, marginBottom: 12, color: error ? '#f87171' : 'var(--kappa-muted)' }}>{statusText}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {digest ? (
            <a href={explorer} target="_blank" rel="noreferrer" style={{ color: 'var(--kappa-accent)', textDecoration: 'underline', fontSize: 13 }}>View transaction</a>
          ) : <span />}
          <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--kappa-border)', background: 'var(--kappa-panel)', color: 'var(--kappa-text)', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function WalletControls() {
  const account = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const addressShort = account?.address ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}` : '';
  const [open, setOpen] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [hoverDisconnect, setHoverDisconnect] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && rootRef.current.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);
  if (!account) {
    return (
      <div ref={rootRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--kappa-border)', background: btnHover ? 'var(--kappa-chip-bg)' : 'var(--kappa-panel)', color: 'var(--kappa-text)', cursor: 'pointer', transition: 'background 120ms ease' }}
        >
          Connect
        </button>
        {open && (
          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 10, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', zIndex: 9999, width: 'max-content', minWidth: 140, maxWidth: 260, overflow: 'hidden' }}>
            {(wallets || []).length > 0 ? (
              (wallets || []).map((w, i) => (
                <button
                  key={w.name}
                  onClick={() => connect({ wallet: w })}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: hoverIdx===i ? 'var(--kappa-chip-bg)' : 'transparent', color: 'var(--kappa-text)', border: 'none', cursor: 'pointer', padding: '10px 14px', width: '100%', textAlign: 'left', transition: 'background 120ms ease', whiteSpace: 'nowrap' }}
                >
                  {w.icon && <img src={w.icon} alt={w.name} style={{ width: 18, height: 18 }} />}
                  <span style={{ fontSize: 13 }}>{w.name}</span>
                </button>
              ))
            ) : (
              <div style={{ padding: '10px 12px', color: 'var(--kappa-text)', fontSize: 12 }}>
                No wallets found. Install a wallet to continue.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--kappa-border)', background: btnHover ? 'var(--kappa-chip-bg)' : 'var(--kappa-panel)', color: 'var(--kappa-text)', cursor: 'pointer', transition: 'background 120ms ease' }}
      >
        {addressShort}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 10, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', zIndex: 9999, width: 'max-content', minWidth: 140, maxWidth: 240, overflow: 'hidden' }}>
          <button
            onClick={() => disconnect()}
            onMouseEnter={() => setHoverDisconnect(true)}
            onMouseLeave={() => setHoverDisconnect(false)}
            style={{ display: 'block', background: hoverDisconnect ? 'var(--kappa-chip-bg)' : 'transparent', color: 'var(--kappa-text)', border: 'none', cursor: 'pointer', padding: '10px 14px', width: '100%', textAlign: 'center', transition: 'background 120ms ease', whiteSpace: 'nowrap' }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export function WidgetEmbedded(props: { 
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
  }
}) {
  // Extract props with default API base URL pointing to production Kappa API
  const { theme, defaultContract, lockContract, logoUrl, projectName, network, apiBase: propsApiBase } = props || {} as any;
  
  // ALWAYS use the proxy path to avoid CORS issues
  // The proxy should be configured in next.config.js to forward to api.kappa.fun
  let apiBase = '/api';
  
  // Allow override via props if needed
  if (propsApiBase) {
    apiBase = propsApiBase;
    console.log('[Widget] Using provided apiBase:', apiBase);
  } else {
    // Always use proxy path for consistent behavior
    apiBase = '/api';
    console.log('[Widget] Using proxy path:', apiBase);
    console.log('[Widget] Make sure your next.config.js has:');
    console.log('async rewrites() { return [{ source: "/api/v1/:path*", destination: "https://api.kappa.fun/v1/:path*" }]; }');
  }
  
  // Debug logging to ensure correct API is being used
  if (typeof window !== 'undefined') {
    console.log('[Widget] Final API Base:', apiBase);
    console.log('[Widget] Props received:', { defaultContract, lockContract, projectName });
  }
  
  const [contract, setContract] = useState('');
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [slippage, setSlippage] = useState('1');
  const [view, setView] = useState<'trade' | 'slippage'>('trade');

  const [showSearch, setShowSearch] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [dropdownTitle, setDropdownTitle] = useState<string | undefined>(undefined);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const [suiIn, setSuiIn] = useState('0');
  const [tokensIn, setTokensIn] = useState('0');
  const [quoteTokens, setQuoteTokens] = useState<number>(0);
  const [quoteSui, setQuoteSui] = useState<number>(0);
  const quoteTokensRef = useRef<number>(0);
  const quoteSuiRef = useRef<number>(0);
  const [statusText, setStatusText] = useState<string>('Ready to trade');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPrimaryDisabled, setIsPrimaryDisabled] = useState<boolean>(false);
  const [txOpen, setTxOpen] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const [curve, setCurve] = useState<any>(null);
  const lastCurveRef = useRef<any>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenAvatarUrl, setTokenAvatarUrl] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const [tokenDecimals, setTokenDecimals] = useState<number>(9);

  const [suiBalance, setSuiBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  
  // Dynamic module configuration
  const [dynamicModuleConfig, setDynamicModuleConfig] = useState<any>(null);
  const [factoryAddress, setFactoryAddress] = useState<string | null>(null);
  // initialize default contract if provided
  useEffect(() => {
    if (defaultContract && !contract) {
      setContract(defaultContract);
    }
  }, [defaultContract]);


  const client = useMemo(() => new SuiClient({ url: networkConfig.mainnet.url }), []);
  const suiClientHook = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const signer = useMemo(() => (
    account ? {
      address: account.address,
      signAndExecuteTransaction: (args: any) => signAndExecuteTransaction(args),
    } : null
  ), [account, signAndExecuteTransaction]);

  // Try to normalize any curve-shaped object into the format math.js expects
  const normalizeCurveObject = (raw: any): any | null => {
    if (!raw) return null;
    // Prefer common paths
    const node = raw?.content?.fields ? raw : raw?.data?.content?.fields ? raw.data : raw;
    const direct = node?.content?.fields;
    const tryBuild = (sui: any, coin: any) => {
      if (sui == null || coin == null) return null;
      return { content: { fields: { virtual_sui_reserve: String(sui), virtual_coin_reserve: String(coin) } } };
    };
    if (direct?.virtual_sui_reserve != null && direct?.virtual_coin_reserve != null) {
      return tryBuild(direct.virtual_sui_reserve, direct.virtual_coin_reserve);
    }
    // Some nodes may nest under different keys; do a shallow search
    const fields = direct || node?.content || node?.fields || node;
    const candidates: any[] = [];
    if (fields && typeof fields === 'object') {
      for (const key of Object.keys(fields)) {
        const val: any = (fields as any)[key];
        if (val && typeof val === 'object') candidates.push(val);
      }
    }
    for (const c of candidates) {
      const f = c?.fields || c;
      if (f?.virtual_sui_reserve != null && f?.virtual_coin_reserve != null) {
        return tryBuild(f.virtual_sui_reserve, f.virtual_coin_reserve);
      }
    }
    // Deep search (limited) as final fallback
    const seen = new Set<any>();
    const stack: any[] = [node];
    let depth = 0;
    while (stack.length && depth < 2000) {
      depth++;
      const cur = stack.pop();
      if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
      seen.add(cur);
      const maybeFields = (cur as any)?.fields || cur;
      if (maybeFields && typeof maybeFields === 'object') {
        if (maybeFields.virtual_sui_reserve != null && maybeFields.virtual_coin_reserve != null) {
          return tryBuild(maybeFields.virtual_sui_reserve, maybeFields.virtual_coin_reserve);
        }
      }
      for (const k of Object.keys(cur)) {
        const v = (cur as any)[k];
        if (v && typeof v === 'object') stack.push(v);
      }
    }
    return null;
  };

  // Initialize default contract once
  useEffect(() => {
    if (defaultContract && !contract) {
      setContract(String(defaultContract));
    }
  }, [defaultContract]);

  // Token + balances loader
  useEffect(() => {
    let abort = false;
    async function load() {
      try {
        setCurve(null);
        setTokenSymbol('');
        setTokenName('');
        setIsVerified(false);
        if (!contract || !contract.includes('::')) {
          // Don't show search/trending unless user has actually interacted with the input
          if (!inputFocused || !hasUserInteracted) {
            // console.log('[Widget] Not showing search - inputFocused:', inputFocused, 'hasUserInteracted:', hasUserInteracted);
            setShowSearch(false);
            setSearchResults([]);
            return;
          }
          // Empty input: show trending list instead of "No results"
          if (!contract && inputFocused && hasUserInteracted) {
            console.log('[Widget] Fetching trending coins from:', `${apiBase}/v1/coins/trending?page=1&size=50`);
            setShowSearch(true);
            setIsSearching(true);
            try {
              let json: any = null;
              try {
                const res = await fetch(`${apiBase}/v1/coins/trending?page=1&size=50`);
                json = await res.json();
                console.log('[Widget] Trending response:', json);
              } catch (err) {
                console.error('[Widget] Error fetching trending coins:', err);
                json = { data: { coins: [] } };
              }
              // New API structure: data.coins array with "address" field
              const all: any[] = (json?.data?.coins || json?.data || []) as any[];
              const isMigratedCoin = (item: any): boolean => {
                const fields = [item?.pairAddress, item?.pairContractAddress, item?.pair, item?.pair_object, item?.pairObject, item?.poolAddress, item?.lpAddress];
                return fields.some((v) => !!(typeof v === 'string' ? v.trim() : v));
              };
              // Normalize to use "address" as the standard contract identifier
              const normalizedList = all.map((c: any) => ({
                ...c,
                contractAddress: c.address || c.contractAddress,  // Use address as primary
                coinType: c.address || c.coinType,
                contract: c.address || c.contract,
              }));
              const list = normalizedList.filter((c) => !isMigratedCoin(c));
              console.log('[Widget] Normalized trending list:', list.slice(0, 3));
              setSearchResults(list.slice(0, 100));
              console.log('[Widget] Set search results, count:', list.length);
            } catch {
              setSearchResults([]);
            } finally {
              setIsSearching(false);
            }
            return;
          }
          if (contract && inputFocused && hasUserInteracted) {
            console.log('[Widget] Searching for:', contract, 'from:', `${apiBase}/v1/coins?nameOrSymbol=${contract.trim().toLowerCase()}`);
            setShowSearch(true);
            setIsSearching(true);
          } else {
            setShowSearch(false);
            setSearchResults([]);
            return;
          }
          try {
            const res = await fetch(`${apiBase}/v1/coins?nameOrSymbol=` + contract.trim().toLowerCase());
            const json = await res.json();
            console.log('[Widget] Search response:', json);
            // New API structure: data.coins array with "address" field
            const all: any[] = (json?.data?.coins || json?.data || []) as any[];
            const isMigratedCoin = (item: any): boolean => {
              const fields = [item?.pairAddress, item?.pairContractAddress, item?.pair, item?.pair_object, item?.pairObject, item?.poolAddress, item?.lpAddress];
              return fields.some((v) => !!(typeof v === 'string' ? v.trim() : v));
            };
            // Normalize to use "address" as the standard contract identifier
            const normalizedAll = all.map((c: any) => ({
              ...c,
              contractAddress: c.address || c.contractAddress,  // Use address as primary
              coinType: c.address || c.coinType,
              contract: c.address || c.contract,
            }));
            const list = (normalizedAll || []).filter((c) => !isMigratedCoin(c));
            const qStr = contract.trim().toLowerCase();
            const bySymbol = list.filter((c) => String(c.symbol || '').toLowerCase().includes(qStr));
            const byName = list.filter((c) => String(c.name || '').toLowerCase().includes(qStr));
            const merged: any[] = [];
            const seen = new Set<string>();
            for (const it of bySymbol.concat(byName)) {
              const key = String(it.contractAddress || it.coinType || it.contract || it.address || it.guid || '');
              if (!seen.has(key)) { seen.add(key); merged.push(it); }
            }
            console.log('[Widget] Search results merged:', merged.slice(0, 3));
            setSearchResults(merged.slice(0, 100));
            console.log('[Widget] Set search results for query, count:', merged.length);
          } catch {
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
          return;
        }
        const normalized = contract.trim();
        const [pkg, mod, sym] = normalized.split('::');
        
        // First, try to fetch specific token metadata to get factory address
        let tokenMetadata: any = null;
        let foundFactoryAddress: string | null = null;
        
        try {
          console.log('[Widget] Fetching token metadata for:', normalized);
          const metaRes = await fetch(`${apiBase}/v1/coins/${encodeURIComponent(normalized)}`);
          if (metaRes.ok) {
            const metaJson = await metaRes.json();
            tokenMetadata = metaJson?.data || metaJson;
            console.log('[Widget] Token metadata:', tokenMetadata);
            
            // Store factory address if available
            if (tokenMetadata?.factoryAddress) {
              foundFactoryAddress = tokenMetadata.factoryAddress;
              setFactoryAddress(tokenMetadata.factoryAddress);
              console.log('[Widget] Token factory address from metadata:', tokenMetadata.factoryAddress);
              
              // Fetch factory configuration
              try {
                const factoryRes = await fetch(`${apiBase}/v1/coins/factories`);
                if (factoryRes.ok) {
                  const factoryJson = await factoryRes.json();
                  const factories = factoryJson?.data?.factories || [];
                  console.log('[Widget] Available factories:', factories);
                  
                  // Find the matching factory by packageID
                  const matchingFactory = factories.find((f: any) => 
                    f.packageID === tokenMetadata.factoryAddress
                  );
                  
                  if (matchingFactory) {
                    console.log('[Widget] Found matching factory:', matchingFactory);
                    
                    const moduleConfig = {
                      bondingContract: matchingFactory.packageID,
                      CONFIG: matchingFactory.configObjectID,
                      globalPauseStatusObjectId: matchingFactory.pauseStatusObjectID,
                      poolsId: matchingFactory.poolsObjectID,
                      lpBurnManger: matchingFactory.lpBurnManagerObjectID,
                      moduleName: matchingFactory.packageName, // Use packageName from API
                    };
                    
                    setDynamicModuleConfig(moduleConfig);
                    console.log('[Widget] Set dynamic module config from factory:', moduleConfig);
                  } else {
                    console.warn('[Widget] No matching factory found for:', tokenMetadata.factoryAddress);
                  }
                }
              } catch (factoryErr) {
                console.error('[Widget] Error fetching factory config:', factoryErr);
              }
            }
          }
        } catch (metaErr) {
          console.warn('[Widget] Could not fetch token metadata:', metaErr);
        }
        
        // Continue with existing trending fetch logic
        const res = await fetch(`${apiBase}/v1/coins/trending?page=1&size=50`);
        const json = await res.json();
        // New API structure: data.coins array with "address" field
        const listAll = (json?.data?.coins || json?.data || []) as any[];
        // Normalize to use "address" as the standard contract identifier
        const normalizedListAll = listAll.map((c: any) => ({
          ...c,
          contractAddress: c.address || c.contractAddress,  // Use address as primary
          coinType: c.address || c.coinType,
        }));
        const list = normalizedListAll.filter((c) => !([c?.pairAddress, c?.pairContractAddress, c?.pair, c?.pair_object, c?.pairObject, c?.poolAddress, c?.lpAddress].some((v: any) => !!(typeof v === 'string' ? v.trim() : v))));
        let item = list.find((c: any) => (c.contractAddress || c.address || '').toLowerCase() === normalized.toLowerCase());
        if (!item && pkg) {
          item = list.find((c: any) => (c.contractAddress || '').toLowerCase().startsWith(`${pkg}::`));
        }
        
        // If we found the item and don't have a factory address yet, use the one from trending
        if (item?.factoryAddress && !foundFactoryAddress) {
          foundFactoryAddress = item.factoryAddress;
          setFactoryAddress(item.factoryAddress);
          console.log('[Widget] Token factory address from trending:', item.factoryAddress);
          
          // Try to fetch factory configuration if we haven't already
          if (!dynamicModuleConfig && item.factoryAddress) {
            try {
              const factoryRes = await fetch(`${apiBase}/v1/coins/factories`);
              if (factoryRes.ok) {
                const factoryJson = await factoryRes.json();
                const factories = factoryJson?.data?.factories || [];
                
                // Find the matching factory by packageID
                const matchingFactory = factories.find((f: any) => 
                  f.packageID === item.factoryAddress
                );
                
                if (matchingFactory) {
                  console.log('[Widget] Found matching factory from trending:', matchingFactory);
                  
                  const moduleConfig = {
                    bondingContract: matchingFactory.packageID,
                    CONFIG: matchingFactory.configObjectID,
                    globalPauseStatusObjectId: matchingFactory.pauseStatusObjectID,
                    poolsId: matchingFactory.poolsObjectID,
                    lpBurnManger: matchingFactory.lpBurnManagerObjectID,
                    moduleName: matchingFactory.packageName, // Use packageName from API
                  };
                  
                  setDynamicModuleConfig(moduleConfig);
                  console.log('[Widget] Set dynamic module config from trending:', moduleConfig);
                } else {
                  console.warn('[Widget] No matching factory found for trending item:', item.factoryAddress);
                }
              }
            } catch (factoryErr) {
              console.error('[Widget] Error fetching factory config from trending:', factoryErr);
            }
          }
        }
        // If still not found, try matching by symbol or name as a last resort
        if (!item && (sym || mod)) {
          const ql = (s: string) => String(s||'').trim().toLowerCase();
          const symL = ql(sym);
          const modL = ql(mod).replaceAll('_',' ');
          item = list.find((c: any) => ql(c.symbol) === symL || ql(c.name) === modL);
        }
        const coinType = normalized;
        if (item?.symbol) setTokenSymbol(String(item.symbol).toUpperCase()); else { const seg = normalized.split('::')[2]; if (seg) setTokenSymbol(seg.toUpperCase()); }
        {
          const avatarCandidates = [
            item?.avatarUrl,
            item?.icon,
            item?.avatar,
            item?.logo,
            item?.image,
            item?.img,
            item?.iconUrl,
            item?.avatar_url,
            item?.imageUrl,
            item?.logoUrl,
            item?.logoURI,
          ];
          let avatar = avatarCandidates.find((v: any) => typeof v === 'string' && v.trim().length > 0);
          let picked = '';
          if (avatar) {
            avatar = String(avatar).trim();
            if (avatar.startsWith('ipfs://')) {
              const cid = avatar.replace('ipfs://', '').replace(/^ipfs\//, '');
              picked = `https://ipfs.io/ipfs/${cid}`;
            } else if (/^https?:\/\//i.test(avatar)) {
              picked = avatar;
            }
          }
          if (picked) {
            setTokenAvatarUrl(picked);
          }
        }
        // Always fetch coin metadata to get decimals (and optional icon fallback)
        try {
          const meta: any = await client.getCoinMetadata({ coinType });
          if (meta && typeof meta.decimals === 'number') setTokenDecimals(Number(meta.decimals));
          const mUrl = String(meta?.iconUrl || '').trim();
          if (!tokenAvatarUrl && mUrl && /^https?:\/\//i.test(mUrl)) setTokenAvatarUrl(mUrl);
        } catch {}
        if (item?.name) setTokenName(String(item.name));
        setIsVerified(!!item);
        {
          const candidateIds = [
            item?.curveAddress,           // New API uses this field
            item?.bondingContractAddress,
            item?.bondingAddress,
            item?.bondingContract,
            item?.bondingCurveObjectId,
            item?.bondingObjectId,
            item?.curveObjectId,
            item?.bonding,
            item?.bonding_object,
            item?.bondingObject,
            item?.curve,
            item?.curveId,
            item?.curve_object,
            item?.curveObject,
          ];
          const bondingId = candidateIds
            .map((v: any) => (typeof v === 'string' ? v.trim() : ''))
            .find((v: string) => v && v.startsWith('0x'));
          if (bondingId) {
            const obj = await client.getObject({ id: bondingId, options: { showContent: true } });
            const norm = normalizeCurveObject(obj);
            if (!abort) { setCurve(norm); if (norm) lastCurveRef.current = norm; }
          }
        }
        if (account?.address) {
          const bal = await suiClientHook.getBalance({ owner: account.address });
          setSuiBalance(Math.max(0, Number(bal.totalBalance || 0)) / 1e9);
          const tbal = await suiClientHook.getBalance({ owner: account.address, coinType });
          const scale = Math.pow(10, tokenDecimals || 9);
          setTokenBalance(Math.max(0, Number(tbal.totalBalance || 0)) / scale);
        }
      } catch {}
    }
    load();
    return () => { abort = true; };
  }, [contract, account?.address, client, suiClientHook, inputFocused, hasUserInteracted, apiBase]);

  // Quotes
  useEffect(() => {
    async function computeQuotes() {
      try {
        const mathMod = await import('../../math.js');
        const buyMath = (mathMod as any).buyMath || (mathMod as any).default?.buyMath;
        const sellMath = (mathMod as any).sellMath || (mathMod as any).default?.sellMath;
        const suiMist = Math.max(0, Math.floor(Number(suiIn) * 1e9));
        const tokensAmt = Math.max(0, Math.floor(Number(tokensIn)));
        const usableCurve = normalizeCurveObject(curve) || lastCurveRef.current || null;
        if (usableCurve && suiMist > 0 && typeof buyMath === 'function') {
          const q = buyMath(usableCurve, suiMist);
          quoteTokensRef.current = q;
          setQuoteTokens(q);
        } else if (suiMist > 0) {
          // Preserve last non-zero during transient reloads
          setQuoteTokens(quoteTokensRef.current || 0);
        } else {
          quoteTokensRef.current = 0;
          setQuoteTokens(0);
        }
        if (usableCurve && tokensAmt > 0 && typeof sellMath === 'function') {
          const qS = sellMath(usableCurve, tokensAmt);
          quoteSuiRef.current = qS;
          setQuoteSui(qS);
        } else if (tokensAmt > 0) {
          setQuoteSui(quoteSuiRef.current || 0);
        } else {
          quoteSuiRef.current = 0;
          setQuoteSui(0);
        }
      } catch {
        setQuoteTokens(0); setQuoteSui(0);
      }
    }
    computeQuotes();
  }, [curve, suiIn, tokensIn]);

  // Always load SUI balance when wallet connects
  useEffect(() => {
    let cancelled = false;
    async function loadSuiBalance() {
      try {
        if (!account?.address) { setSuiBalance(0); return; }
        const bal = await suiClientHook.getBalance({ owner: account.address });
        if (!cancelled) setSuiBalance(Math.max(0, Number(bal.totalBalance || 0)) / 1e9);
      } catch {}
    }
    loadSuiBalance();
    return () => { cancelled = true; };
  }, [account?.address, suiClientHook]);

  const maxBuys = ['5','10','15','20','50','MAX'];
  const maxSells = ['1/4','1/2','3/4','MAX'];

  const handleQuick = (val: string) => {
    if (mode === 'buy') {
      if (val === 'MAX') setSuiIn(String(Math.max(0, Math.floor(suiBalance*100)/100)));
      else setSuiIn(val);
    } else {
      const bal = tokenBalance;
      const scale = Math.pow(10, tokenDecimals || 9);
      if (val === 'MAX') setTokensIn(String(Math.floor(bal*scale)));
      else if (val === '1/2') setTokensIn(String(Math.floor(bal*scale/2)));
      else if (val === '1/4') setTokensIn(String(Math.floor(bal*scale/4)));
      else if (val === '3/4') setTokensIn(String(Math.floor(bal*scale*3/4)));
    }
  };

  const clearContract = () => {
    setContract('');
    setTokenSymbol('');
    setTokenName('');
    setTokenAvatarUrl('');
    setIsVerified(false);
    setCurve(null);
    setQuoteSui(0);
    setQuoteTokens(0);
    setStatusText('Ready to trade');
    setHasError(false);
    setIsPrimaryDisabled(false);
    // Clear dynamic module config
    setDynamicModuleConfig(null);
    setFactoryAddress(null);
  };

  const onBuy = async () => {
    try {
      if (!signer) { alert('Connect wallet first'); return; }
      setTxOpen(true); setTxLoading(true); setTxDigest(null); setTxError(null);
      const tradeMod = await import('../../kappa-trade.js');
      const trade = (tradeMod as any).default || tradeMod as any;
      trade.setSuiClient(client);
      
      // Use dynamic module config if available, otherwise fall back to prop
      // Dynamic config from API takes precedence over static network prop
      const configToUse = dynamicModuleConfig || network;
      if (configToUse && trade.setNetworkConfig) {
        console.log('[Widget] Setting network config:', dynamicModuleConfig ? 'Dynamic from API' : 'Static from prop');
        console.log('[Widget] Config being used:', configToUse);
        console.log('[Widget] Factory address:', factoryAddress);
        trade.setNetworkConfig(configToUse);
      } else {
        console.log('[Widget] No network config available, using defaults');
      }
      
      const [pkg, mod, typeName] = contract.split('::');
      const slip = Math.max(0, Math.min(100, Number(slippage) || 0));
      const minOut = Math.floor(Math.max(0, quoteTokens) * (1 - slip / 100));
      
      const tradeParams = {
        publishedObject: { packageId: pkg },
        name: (mod || '').replaceAll('_', ' '), // This is what the trade module uses to construct type argument
        sui: Math.floor(parseFloat(suiIn) * 1e9),
        min_tokens: minOut,
        // Add these for better type argument construction if needed
        moduleName: mod || '',
        typeName: typeName || '',
      };
      
      console.log('[Widget] Buy params:', {
        contract,
        packageId: pkg,
        moduleName: mod,
        typeName,
        suiAmount: tradeParams.sui,
        minTokens: tradeParams.min_tokens,
        slippage: slip + '%'
      });
      
      const res = await (trade as any).buyWeb3(signer as any, tradeParams);
      if (res?.success) { setTxDigest(res?.digest || null); } else { setTxError(res?.error || 'unknown error'); }
    } catch (e: any) { 
      console.error('[Widget] Buy error:', e);
      alert('Buy failed: ' + (e?.message || String(e))); 
    }
    finally { setTxLoading(false); }
  };

  const onSell = async () => {
    try {
      if (!signer) { alert('Connect wallet first'); return; }
      setTxOpen(true); setTxLoading(true); setTxDigest(null); setTxError(null);
      const tradeMod = await import('../../kappa-trade.js');
      const trade = (tradeMod as any).default || tradeMod as any;
      trade.setSuiClient(client);
      
      // Use dynamic module config if available, otherwise fall back to prop
      // Dynamic config from API takes precedence over static network prop
      const configToUse = dynamicModuleConfig || network;
      if (configToUse && trade.setNetworkConfig) {
        console.log('[Widget] Setting network config for sell:', dynamicModuleConfig ? 'Dynamic from API' : 'Static from prop');
        console.log('[Widget] Config being used:', configToUse);
        console.log('[Widget] Factory address:', factoryAddress);
        trade.setNetworkConfig(configToUse);
      } else {
        console.log('[Widget] No network config available, using defaults');
      }
      
      const [pkg, mod, typeName] = contract.split('::');
      const slip = Math.max(0, Math.min(100, Number(slippage) || 0));
      const minSui = Math.floor(Math.max(0, quoteSui) * (1 - slip / 100));
      
      const tradeParams = {
        publishedObject: { packageId: pkg },
        name: (mod || '').replaceAll('_', ' '), // This is what the trade module uses to construct type argument
        sell_token: String(Math.floor(parseFloat(tokensIn))),
        min_sui: minSui,
        // Add these for better type argument construction if needed
        moduleName: mod || '',
        typeName: typeName || '',
      };
      
      console.log('[Widget] Sell params:', {
        contract,
        packageId: pkg,
        moduleName: mod,
        typeName,
        sellAmount: tradeParams.sell_token,
        minSui: tradeParams.min_sui,
        slippage: slip + '%'
      });
      
      const res = await (trade as any).sellWeb3(signer as any, tradeParams);
      if (res?.success) { setTxDigest(res?.digest || null); } else { setTxError(res?.error || 'unknown error'); }
    } catch (e: any) { 
      console.error('[Widget] Sell error:', e);
      alert('Sell failed: ' + (e?.message || String(e))); 
    }
    finally { setTxLoading(false); }
  };

  // validation for balances and inputs
  useEffect(() => {
    const suiInNum = Math.max(0, Number(suiIn));
    const tokensInNum = Math.max(0, Number(tokensIn));
    let text = 'Ready to trade';
    let error = false;
    let disabled = false;
    if (!account?.address) {
      text = 'Connect wallet to continue';
      error = false; disabled = true;
    } else if (!contract) {
      text = 'Enter a token contract or search by name';
      error = true; disabled = true;
    } else if (mode === 'buy') {
      if (!suiIn || isNaN(suiInNum) || suiInNum <= 0) { text = 'Enter SUI amount'; error = true; disabled = true; }
      else if (suiInNum > suiBalance) { text = 'Insufficient SUI balance'; error = true; disabled = true; }
      else { text = 'Ready to trade'; error = false; disabled = false; }
    } else {
      if (!tokensIn || isNaN(tokensInNum) || tokensInNum <= 0) { text = 'Enter token amount'; error = true; disabled = true; }
      else if (tokensInNum/1e9 > tokenBalance) { text = 'Insufficient token balance'; error = true; disabled = true; }
      else { text = 'Ready to trade'; error = false; disabled = false; }
    }
    setStatusText(text);
    setHasError(error);
    setIsPrimaryDisabled(disabled);
  }, [account?.address, contract, curve, mode, suiIn, tokensIn, suiBalance, tokenBalance]);

  // Display helpers: show more precision for small amounts
  const formatTokenOut = (amountSmallest: number): string => {
    const scale = Math.pow(10, tokenDecimals || 9);
    const tokens = amountSmallest / scale;
    if (tokens > 0 && tokens < 0.000001) return '< 0.000001';
    return tokens.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };
  const formatSuiOut = (amountMist: number): string => {
    const sui = amountMist / 1e9;
    if (sui > 0 && sui < 0.000001) return '< 0.000001';
    return sui.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const isDev = typeof window !== 'undefined' && (window as any).__DEV__;
  const debugQuote = isDev ? (
    <div style={{ marginTop: 8, fontSize: 10, color: '#9ca3af' }}>
      curveLoaded={String(!!normalizeCurveObject(curve))} | suiIn={suiIn} | tokensIn={tokensIn} |
      buyMath={(function(){ try { return (quoteTokensRef.current/Math.pow(10, tokenDecimals||9)).toFixed(6);} catch {return 'err';} })()}
    </div>
  ) : null;

  const themeVars = { ...defaultTheme, ...(theme || {}) } as Record<string, string>;
  const defaultLogoDataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.1268 21.8877C13.7496 26.7985 8.64625 34.9674 7.14173 38.4375C9.30824 36.7042 13.3404 35.107 15.0856 34.5257C8.44164 42.5177 6.5002 50.6145 6.35938 53.6633C8.52589 50.582 11.234 48.7284 12.3173 48.1868C8.80272 57.1417 10.4914 65.0772 11.7757 67.9261C12.0164 66.1929 13.4403 63.5125 14.1227 62.3895C14.6523 64.9893 16.4301 68.0862 17.2521 69.3103L19.4788 66.1207C17.9863 63.9061 17.7733 60.0629 17.8539 58.4176C14.9171 53.9401 16.3097 47.5645 17.3725 44.937C18.3354 40.1225 22.1063 35.9905 23.872 34.5257C24.333 36.9329 26.3154 42.3011 30.5521 44.5157C30.2151 42.59 31.3742 39.2198 31.9965 37.7755C33.3 39.9624 37.3405 44.7204 43.0698 46.261C41.9624 43.6612 42.6088 39.5207 43.0698 37.7755C45.0353 39.5412 49.9906 43.1436 54.0829 43.4325C53.0237 42.3733 52.1968 38.9394 51.9164 37.3542C53.7218 38.8383 58.6567 41.928 63.9526 42.4094C62.3157 40.3873 61.0242 37.2736 60.5824 35.97C67.2746 38.8106 70.954 45.2981 71.9567 48.1868C75.4231 60.0304 71.5956 67.7251 69.2485 70.0927C71.6076 69.9964 75.0463 66.5215 76.4702 64.7967C76.6628 80.1068 65.4715 87.1034 59.8519 88.6886C58.9154 90.2316 57.8731 91.4942 57.2725 92.1189C66.5644 91.2042 73.7825 84.0751 76.2295 80.6243C76.2776 82.0205 75.5675 84.0546 75.2064 84.8972C81.7541 81.3826 84.3539 72.8008 84.8354 68.9492C85.3566 70.3731 86.4001 73.8961 86.4001 76.5922C91.0701 69.7075 90.5129 60.3638 89.6499 56.5519C90.6128 57.4342 92.8996 60.0063 94.344 63.232C95.8365 52.4957 89.2286 41.266 85.7381 36.9931C87.8649 37.8561 92.4423 39.8818 93.7422 41.0854C90.3239 31.9861 81.8865 24.6957 78.0951 22.1886C80.7431 17.3741 78.4562 10.7542 67.8042 7.74515C59.2825 5.33791 51.6155 5.01654 48.8472 5.15737C21.212 6.98687 19.5186 17.0732 22.1268 21.8877Z" fill="#141315"/><path d="M25.1361 59.6815C16.3738 58.3334 17.0322 51.3368 18.4561 48.0063L25.3167 51.3765C23.102 55.2762 25.236 57.5751 26.5805 58.2371L25.1361 59.6815Z" fill="#D9D9D9"/><path d="M51.4349 62.5098C44.4539 62.5098 42.6689 57.2139 42.6484 54.5659L53.5412 51.5569C53.1199 52.3597 52.5542 54.5058 53.6616 56.6723C55.0457 59.3804 58.7168 58.7786 58.9575 58.7786C56.6465 62.0525 52.9791 62.6302 51.4349 62.5098Z" fill="#D9D9D9"/><path d="M58.5963 52.219C58.163 51.3043 58.7768 50.5544 59.1379 50.2932C61.0035 49.3905 61.3044 51.1358 61.3646 51.557C61.4248 51.9783 61.2443 52.9412 60.823 53.1819C60.4017 53.4227 59.1379 53.3625 58.5963 52.219Z" fill="#D9D9D9"/><path d="M17.6053 68.3475L14.4157 54.1448H12.9714L15.1981 33.9842L24.1048 29.0493H58.4682L73.8143 42.59L78.3279 59.6814L76.2216 75.7498L65.6297 87.1842L55.399 90.7348C41.8582 97.4751 35.3587 92.4801 29.5211 90.7348C23.6836 88.9896 25.6695 86.1009 23.3225 85.5593C20.9754 85.0176 14.4157 91.9385 12.9714 91.6375C11.527 91.3366 11.527 87.5452 11.8881 82.9113C12.177 79.2042 15.8203 71.6575 17.6053 68.3475Z" fill="#145D87" stroke="black" stroke-width="0.081103"/><path d="M33.3814 47.2239C31.5038 49.1497 31.1547 51.1958 31.2149 51.9782C26.3318 49.1376 19.9129 46.1009 17.3131 44.937C14.6651 52.1587 16.0493 55.8298 17.8547 58.4777C19.299 60.5961 22.0674 61.4471 23.271 61.6071L45.1167 62.9311C49.1609 65.531 53.6624 64.8966 55.4076 64.2551C64.1218 60.7887 64.3746 52.9808 63.4117 49.5108L66.9022 48.6682C64.0737 46.261 59.3194 47.8859 57.0325 48.247C54.7456 48.6081 43.3113 52.2791 40.904 52.5198C38.9782 52.7124 37.8553 50.1932 37.5339 48.909C36.0895 54.2049 38.9385 55.4085 40.5429 55.3483C40.6874 57.7074 41.6057 59.4202 42.0475 59.9823C41.2254 59.1602 39.4236 57.3343 38.7977 56.6121C38.1718 55.89 37.0127 55.3483 36.5108 55.1678C32.3704 53.8679 32.6989 49.3302 33.3814 47.2239Z" fill="black"/><path d="M25.1361 59.8018C16.3738 58.4538 17.0322 51.4571 18.4561 48.1267L25.3167 51.4968C23.102 55.3966 25.236 57.6955 26.5805 58.3575L25.1361 59.8018Z" fill="#D9FFE2"/><path d="M51.4349 62.6302C44.4539 62.6302 42.6689 57.3343 42.6484 54.6863L53.5412 51.6772C53.1199 52.4801 52.5542 54.6261 53.6616 56.7926C55.0457 59.5008 58.7168 58.899 58.9575 58.899C56.6465 62.1728 52.9791 62.7505 51.4349 62.6302Z" fill="#D9FFE2"/><path d="M58.5963 52.3394C58.163 51.4247 58.7768 50.6748 59.1379 50.4136C61.0035 49.5109 61.3044 51.2561 61.3646 51.6774C61.4248 52.0987 61.2443 53.0616 60.823 53.3023C60.4017 53.543 59.1379 53.4828 58.5963 52.3394Z" fill="#D9D9D9"/><path d="M61.5451 85.0694C53.1535 95.6661 36.2607 95.6661 25.7266 86.0347C20.2321 81.0108 59.6855 63.8123 64.8334 67.5724C69.6058 71.0581 61.5439 85.0694 61.5439 85.0694H61.5451Z" fill="#228399"/><path d="M33.5007 56.3715C29.5528 56.1308 21.6197 67.3834 18.6179 71.4781C12.0209 80.4764 14.2427 90.1246 14.2427 90.1246C27.3441 82.2662 56.2033 82.0435 61.8844 67.5194C60.4473 67.1294 58.1002 67.1487 57.0314 67.6771C53.6878 67.9876 54.3233 66.8105 49.7495 67.0247C47.5963 67.1258 42.2269 62.812 42.2269 62.812C40.9631 60.7659 37.4485 56.6134 33.5007 56.3727V56.3715Z" fill="#228399"/><path d="M29.4102 68.8808C31.7693 66.6661 33.2016 66.3929 33.6228 66.5337C33.8238 67.0356 34.4894 67.6049 35.5486 65.8717C36.6078 64.1385 35.669 63.3441 35.0672 63.1636C31.697 63.1636 29.8916 66.9754 29.4102 68.8808Z" fill="#141315"/><path d="M29.0485 42.9836C25.6182 43.0438 21.5259 36.1831 21.4657 35.9424L21.2852 33.1741L27.7245 33.9564L49.51 35.2202L57.6345 37.2664C58.8586 38.6505 61.3055 41.455 61.3055 41.5994C55.5281 41.455 52.1183 39.2524 51.1349 38.1691L53.4218 42.9836C50.5813 43.8983 44.5355 41.5597 41.8671 40.2754C41.8069 41.8606 41.6865 45.114 41.6865 45.451C34.7055 44.6807 30.9948 40.6365 30.0114 38.7107C29.69 39.8939 29.0485 42.4058 29.0485 42.9836Z" fill="black" fill-opacity="0.2"/><path d="M62.6298 36.7847L62.4492 34.0164H62.6298C70.4533 35.9421 82.0682 54.839 80.8646 64.1069C79.7632 72.5875 72.5645 79.6669 71.1189 81.03C71.0373 81.1158 70.9559 81.1921 70.8746 81.2584C70.9001 81.2339 70.9847 81.1566 71.1189 81.03C73.4052 78.6284 75.7824 68.8523 76.7121 64.1069C73.9197 68.3436 70.1724 70.4058 68.6479 70.9073C76.5918 54.7307 67.9457 41.4186 62.6298 36.7847Z" fill="#104A6C"/><path d="M44.1778 81.6197C40.9473 82.3214 29.1579 84.973 25.4375 86.2537L26.8818 87.2767L28.0855 88.2396C41.0364 86.699 53.5528 78.6612 58.147 74.9504C55.1645 77.5683 47.8645 80.8181 44.1778 81.6197Z" fill="black" fill-opacity="0.43"/><path d="M7.14173 38.5253C8.64625 35.0553 13.7496 26.8863 22.1268 21.9756C19.5186 17.1611 21.212 7.07476 48.8472 5.24526C51.6155 5.10443 59.2825 5.4258 67.8042 7.83304C78.4562 10.8421 80.7431 17.462 78.0951 22.2765C81.8865 24.7836 90.3239 32.0739 93.7422 41.1733C92.4423 39.9697 87.8649 37.944 85.7381 37.081C89.2286 41.3538 95.8365 52.5836 94.344 63.3199C92.8996 60.0942 90.6128 57.5221 89.6499 56.6398C90.5129 60.4517 91.0701 69.7954 86.4001 76.6801C86.4001 73.984 85.3566 70.461 84.8354 69.0371C84.3539 72.8887 81.7541 81.4705 75.2064 84.9851C75.5675 84.1425 76.2776 82.1084 76.2295 80.7122C73.8355 84.0872 66.875 90.9839 57.8743 92.1382C57.5373 92.1851 56.0484 92.6076 55.3467 92.8122L59.0779 88.8403L59.8519 88.7753C65.4715 87.1901 76.6628 80.1935 76.4702 64.8834C75.0463 66.6082 71.6076 70.0831 69.2485 70.1793C71.5956 67.8118 75.4231 60.1171 71.9567 48.2735C70.954 45.3848 67.2746 38.8973 60.5824 36.0567C61.0242 37.3602 62.3157 40.474 63.9526 42.4961C58.6567 42.0146 53.7218 38.9249 51.9164 37.4409C52.1968 39.0261 53.0237 42.46 54.0829 43.5192C49.9906 43.2303 45.0353 39.6279 43.0698 37.8622C42.6088 39.6074 41.9624 43.7479 43.0698 46.3477C37.3405 44.807 33.3 40.0491 31.9965 37.8622C31.3742 39.3065 30.2151 42.6766 30.5521 44.6024C26.3154 42.3878 24.333 37.0196 23.872 34.6124C22.1063 36.0772 18.3354 40.2092 17.3725 45.0237C16.3097 47.6512 14.9171 54.0268 17.8539 58.5042C17.7733 60.1496 17.9863 63.9927 19.4788 66.2074L17.2521 69.397C16.4301 68.1729 14.6523 65.076 14.1227 62.4762C13.4403 63.5992 12.0164 66.2796 11.7757 68.0128C10.4914 65.1639 8.80272 57.2284 12.3173 48.2735C11.234 48.8151 8.52589 50.6687 6.35938 53.7499C6.5002 50.7012 8.44164 42.6044 15.0856 34.6124C13.3404 35.1937 9.30824 36.7909 7.14173 38.5241V38.5253Z" fill="black"/><path d="M50.4113 29.0494C63.972 29.0494 74.9651 24.3881 74.9651 18.6381C74.9651 12.8881 63.972 8.22681 50.4113 8.22681C36.8506 8.22681 25.8574 12.8881 25.8574 18.6381C25.8574 24.3881 36.8506 29.0494 50.4113 29.0494Z" fill="#093659"/><path d="M50.352 25.679C61.4864 25.679 70.5127 22.4996 70.5127 18.5777C70.5127 14.6557 61.4864 11.4763 50.352 11.4763C39.2176 11.4763 30.1914 14.6557 30.1914 18.5777C30.1914 22.4996 39.2176 25.679 50.352 25.679Z" fill="#151011"/><path d="M50.4117 25.6793C60.9146 25.6793 69.4289 22.9579 69.4289 19.601C69.4289 16.244 60.9146 13.5227 50.4117 13.5227C39.9088 13.5227 31.3945 16.244 31.3945 19.601C31.3945 22.9579 39.9088 25.6793 50.4117 25.6793Z" fill="#228399"/><path d="M34.584 19.5408C36.8107 23.6331 58.2351 27.0032 66.3595 19.5408C54.203 24.8367 39.4791 21.7277 34.584 19.5408Z" fill="#31B0B0"/><path d="M26.4598 58.3489C30.841 53.9196 35.1054 54.4166 36.6906 55.2195C38.7969 55.7009 45.2965 65.5706 52.7589 67.1353C46.6494 68.2186 42.1671 63.9457 40.0006 61.4181C37.834 58.8905 36.9313 57.4462 33.6214 57.0851C30.3114 56.724 23.3304 63.7652 17.7938 72.7923C13.3645 80.014 13.5811 87.3561 14.2431 90.1244C23.2702 83.2036 25.7377 83.2638 42.468 79.4122C55.8522 76.3309 60.4019 70.1443 61.0037 67.4362C60.3297 67.2436 58.0753 67.5168 57.0318 67.6769C59.1502 65.0771 62.2073 64.7485 63.4711 64.9086C65.6172 65.1493 69.1763 67.1112 66.2395 73.033C67.0579 68.9889 64.7349 67.7768 63.4711 67.6769C62.2073 73.8756 52.7589 79.8937 42.468 82.1805C32.177 84.4674 26.2191 86.2127 26.0386 86.333C30.2272 90.4253 36.7712 92.2103 39.5191 92.5919C49.5332 94.9028 58.3762 88.5393 61.5454 85.0692C59.6677 89.5467 57.914 91.5892 57.2725 92.0502C42.3476 100.379 28.4253 92.3909 23.3304 87.3561C20.201 88.1385 16.2892 91.629 14.8449 92.5919C13.4006 93.5548 9.66934 92.2308 12.0164 81.6389C14.3635 71.0471 20.9834 63.8855 26.4598 58.3489Z" fill="black"/></svg>');
  const headerLogo = (logoUrl && logoUrl.length > 0) ? logoUrl : defaultLogoDataUri;
  const headerName = projectName || 'Kappa';
  return (
    <div className="kappa-root" style={{ width: '100%', maxWidth: 440, background: 'var(--kappa-bg)', borderRadius: 16, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.45)', border: '1px solid var(--kappa-border)', position: 'relative', overflow: 'hidden', ...(themeVars as any), fontFamily: 'ui-sans-serif, -apple-system, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, \'Noto Sans\', \'Liberation Sans\', sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\'' }}>
      <style>{`
        .kappa-root input, .kappa-root button, .kappa-root select, .kappa-root textarea { font-family: inherit !important; }
        /* Prevent iOS auto-zoom on inputs */
        .kappa-root input, .kappa-root select, .kappa-root textarea { font-size: 16px; }
        .kappa-root label, .kappa-root span, .kappa-root p, .kappa-root div { font-family: inherit !important; }
        .kappa-dropdown { scrollbar-width: thin; scrollbar-color: rgba(229,231,235,0.4) transparent; }
        .kappa-dropdown::-webkit-scrollbar { width: 4px; }
        .kappa-dropdown::-webkit-scrollbar-track { background: transparent; }
        .kappa-dropdown::-webkit-scrollbar-thumb { background: rgba(229,231,235,0.4); border-radius: 6px; }
        .kappa-dropdown::-webkit-scrollbar-thumb:hover { background: rgba(229,231,235,0.55); }
        @media (max-width: 500px) {
          .kappa-root { box-sizing: border-box; width: calc(100vw - 10px) !important; max-width: none !important; margin-left: 5px !important; margin-right: 5px !important; }
        }
        @media (max-width: 430px) {
          .kappa-root { padding: 10px !important; border-radius: 12px; max-width: 430px !important; }
          .kappa-header-name { font-size: 16px !important; }
          .kappa-main { min-height: 300px !important; }
          .kappa-tabs button { padding: 8px !important; }
          .kappa-balance-chip { padding: 4px 8px !important; }
          .kappa-quick button { min-width: 48px !important; padding: 6px 8px !important; }
          .kappa-primary-btn { padding: 10px !important; }
        }
        @media (max-width: 320px) {
          .kappa-root { padding: 8px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={headerLogo} alt="logo" style={{ width: 22, height: 22, borderRadius: 4 }} />
          <div style={{ width: 1, height: 16, background: 'var(--kappa-border)', opacity: 0.8 }} />
          <div className="kappa-header-name" style={{ color: 'var(--kappa-text)', fontWeight: 700 }}>{headerName}</div>
        </div>
        <WalletControls />
      </div>

      <div className="kappa-main" style={{ position: 'relative', minHeight: 360, paddingBottom: 26 }}>
        <div
          style={{ position: 'absolute', inset: 0, transition: 'transform 200ms ease, opacity 200ms ease', transform: view==='trade' ? 'translateX(0)' : 'translateX(-12px)', opacity: view==='trade' ? 1 : 0, pointerEvents: view==='trade' ? 'auto' : 'none', zIndex: 1 }}
          onMouseDown={() => setShowSearch(false)}
        >
          <TradePanelView
            contract={contract}
            setContract={setContract}
            tokenSymbol={tokenSymbol}
            tokenName={tokenName}
            tokenAvatarUrl={tokenAvatarUrl}
            clearContract={clearContract}
            searchResults={searchResults}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
                          onSelectResult={(item) => {
                // Use address field as primary (new API structure)
                const ca = String(item.address || item.contractAddress || item.coinType || item.contract || '')
                  .trim();
                setContract(ca);
                setTokenSymbol(String(item.symbol || '').toUpperCase());
                setTokenName(String(item.name || ''));
                // Store factory address if available from search result
                if (item.factoryAddress) {
                  setFactoryAddress(item.factoryAddress);
                  console.log('[Widget] Setting factory address from search result:', item.factoryAddress);
                }
                {
                  const avatarCandidates = [
                    item?.avatarUrl,
                    item?.icon,
                    item?.avatar,
                    item?.logo,
                    item?.image,
                    item?.img,
                    item?.iconUrl,
                  ];
                  let avatar = avatarCandidates.find((v: any) => typeof v === 'string' && v.trim().length > 0);
                  if (avatar) {
                    avatar = String(avatar).trim();
                    if (avatar.startsWith('ipfs://')) {
                      const cid = avatar.replace('ipfs://', '').replace(/^ipfs\//, '');
                      setTokenAvatarUrl(`https://ipfs.io/ipfs/${cid}`);
                    } else if (/^https?:\/\//i.test(avatar)) {
                      setTokenAvatarUrl(avatar);
                    }
                  }
                }
                setIsVerified(true);
                setShowSearch(false);
              }}
            isSearching={isSearching}
            inputFocused={inputFocused}
            setInputFocused={setInputFocused}
            setHasUserInteracted={setHasUserInteracted}
            mode={mode}
            setMode={setMode}
            suiBalance={suiBalance}
            tokenBalance={tokenBalance}
            setView={setView}
            maxBuys={['5','10','15','20','50','MAX']}
            maxSells={['1/4','1/2','3/4','MAX']}
            handleQuick={handleQuick}
            amountProps={{ mode, suiIn, tokensIn, onSuiChange: setSuiIn, onTokensChange: setTokensIn, tokenSymbol, tokenAvatarUrl }}
            youReceive={mode==='buy' ? `${formatTokenOut(quoteTokens)} ${tokenSymbol || 'TOKEN'}` : `${formatSuiOut(quoteSui)} SUI`}
            onPrimary={mode==='buy' ? onBuy : onSell}
            primaryLabel={mode==='buy' ? 'Buy' : 'Sell'}
            statusText={statusText}
            hasError={hasError}
            isPrimaryDisabled={isPrimaryDisabled}
            locked={!!lockContract}
          />
        </div>
        <div style={{ position: 'absolute', inset: 0, transition: 'transform 200ms ease, opacity 200ms ease', transform: view==='slippage' ? 'translateX(0)' : 'translateX(12px)', opacity: view==='slippage' ? 1 : 0, pointerEvents: view==='slippage' ? 'auto' : 'none', zIndex: 1 }}>
          <SlippagePanel slippage={slippage} setSlippage={setSlippage} onClose={() => setView('trade')} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, gap: 4, position: 'relative', zIndex: 100 }}>
        <span style={{ color: 'var(--kappa-muted)', fontSize: 12 }}>Powered by</span>
        <a href="https://kappa.meme" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--kappa-accent)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 101 }}>Kappa</a>
      </div>
      <TransactionModal
        open={txOpen}
        loading={txLoading}
        digest={txDigest}
        error={txError}
        spentLabel={mode==='buy' ? `${suiIn} SUI` : `${tokensIn} ${tokenSymbol}`}
        forLabel={mode==='buy' ? `${formatTokenOut(quoteTokens)} ${tokenSymbol}` : `${formatSuiOut(quoteSui)} SUI`}
        onClose={() => setTxOpen(false)}
      />
    </div>
  );
}

export function WidgetStandalone(props: { 
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
  }
}) {
  const client = useMemo(() => new SuiClient({ url: networkConfig.mainnet.url }), []);
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <WidgetEmbedded {...props} />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}


