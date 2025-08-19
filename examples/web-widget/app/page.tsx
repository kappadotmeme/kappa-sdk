"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { ConnectButton, createNetworkConfig, SuiClientProvider, WalletProvider, useConnectWallet, useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction, useSuiClient, useWallets } from '@mysten/dapp-kit';
import { CiSettings } from 'react-icons/ci';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// Theme defaults; third-parties can override via the `theme` prop on `Widget`
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

// Utilities and stable subcomponents defined at module scope to avoid remounting inputs
const abbreviateContract = (val: string) => {
  if (!val || val.length <= 20) return val;
  const head = val.slice(0, 5);
  const tail = val.slice(-12);
  return `${head}...${tail}`;
};

// Sanitize numeric input allowing only digits and a single '.'
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', alignItems: 'center', border: '1px solid var(--kappa-border)', background: 'var(--kappa-panel)', borderRadius: 10 }}>
      <input
        placeholder="0"
        value={mode === 'buy' ? suiIn : tokensIn}
        onChange={(e) => {
          const v = sanitizeDecimalInput(e.target.value);
          if (mode === 'buy') onSuiChange(v); else onTokensChange(v);
        }}
        inputMode="decimal"
        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#e5e7eb', fontSize: 18, height: 44, padding: '0 10px' }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--kappa-border)', height: '100%' }}>
        <span style={{ color: 'var(--kappa-accent)' }}>{mode === 'buy' ? 'SUI' : tokenSymbol}</span>
        {mode === 'sell' ? (
          tokenAvatarUrl ? (
            <img src={tokenAvatarUrl} alt="token" crossOrigin="anonymous" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--kappa-avatar-bg)' }} />
          )
        ) : (
          <img src={SUI_LOGO_URL} alt="SUI" crossOrigin="anonymous" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
        )}
      </div>
    </div>
  );
}

function SlippagePanel(props: { slippage: string; setSlippage: (v: string) => void; onClose: () => void }) {
  const { slippage, setSlippage, onClose } = props;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  return (
    <div style={{ paddingTop: 8, paddingLeft: 4, paddingRight: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--kappa-border)', background: 'var(--kappa-panel)', color: 'var(--kappa-text)', cursor: 'pointer' }}>Save & Return</button>
        </div>
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
}) {
  const { contract, setContract, tokenSymbol, tokenName, tokenAvatarUrl, onClear, searchResults, showSearch, setShowSearch, onSelectResult, isSearching } = props;
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
        onChange={(e) => { setContract(e.target.value); setShowSearch(true); }}
        onBlur={() => setTimeout(() => setShowSearch(false), 100)}
        placeholder={showCA ? '' : "type a coin name/symbol or contract address"}
        title={contract}
        style={{ ...inputStyle, paddingRight: (tokenSymbol || tokenName) ? 220 : 10, paddingLeft: showCA ? 170 : 10 }}
      />
      {showCA && (
        <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
          {tokenAvatarUrl ? (
            <img src={tokenAvatarUrl} alt="token" crossOrigin="anonymous" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#233B53' }} />
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
        {(tokenSymbol || tokenName) && (
          <button onClick={onClear} title="Clear" style={{ border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 14 }}>🗑</button>
        )}
      </div>
      {showSearch && (
        <div className="kappa-dropdown" style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 6, background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 10, maxHeight: 240, overflowY: 'auto', zIndex: 5, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', scrollbarWidth: 'thin' }}>
          {isSearching ? (
            <div style={{ padding: 10, color: '#9ca3af', fontSize: 12 }}>Searching…</div>
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((item: any) => (
              <button key={item.contractAddress}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onSelectResult(item); }}
                style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', color: '#e5e7eb', border: 'none', cursor: 'pointer', gap: 10 }}
              >
                {item.avatarUrl ? (
                  <img src={String(item.avatarUrl)} alt="token" crossOrigin="anonymous" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: '#233B53' }} />
                )}
                <span style={{ color: '#e5e7eb', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ${String(item.symbol || '').toUpperCase()} {String(item.name || '') ? '| ' + String(item.name) : ''}
                </span>
                <span style={{ color: '#6b7280', fontSize: 12 }}>{abbreviateContract(String(item.contractAddress || ''))}</span>
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

function TradePanelView(props: {
  contract: string;
  setContract: (v: string) => void;
  tokenSymbol: string;
  tokenName: string;
  tokenAvatarUrl: string;
  clearContract: () => void;
  // search props
  searchResults: any[];
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  onSelectResult: (item: any) => void;
  isSearching: boolean;
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
}) {
  const {
    contract, setContract, tokenSymbol, tokenName, tokenAvatarUrl, clearContract,
    searchResults, showSearch, setShowSearch, onSelectResult, isSearching,
    mode, setMode,
    suiBalance, tokenBalance, setView, maxBuys, maxSells, handleQuick,
    amountProps, youReceive, onPrimary, primaryLabel, statusText, hasError, isPrimaryDisabled
  } = props;

  return (
    <div style={{ paddingLeft: 4, paddingRight: 4 }}>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button style={tabBtn(mode === 'buy')} onClick={() => setMode('buy')}>Buy</button>
        <button style={tabBtn(mode === 'sell')} onClick={() => setMode('sell')}>Sell</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Enter the token contract address</label>
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
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--kappa-chip-border)', background: 'var(--kappa-chip-bg)' }}>
          {(mode === 'buy') ? (
            (() => { const SUI_LOGO_URL = 'https://strapi-dev.scand.app/uploads/sui_c07df05f00.png'; return <img src={SUI_LOGO_URL} alt="SUI" crossOrigin="anonymous" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 18, height: 18, borderRadius: '50%' }} /> })()
          ) : (
            tokenAvatarUrl ? (
              <img src={tokenAvatarUrl} alt="token" crossOrigin="anonymous" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} style={{ width: 18, height: 18, borderRadius: 6, objectFit: 'cover' }} />
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
        <button onClick={() => setView('slippage')} title="Slippage settings" style={{ padding: 6, borderRadius: 8, border: '1px solid var(--kappa-border)', background: 'var(--kappa-panel)', color: 'var(--kappa-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CiSettings size={18} />
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <AmountRow {...amountProps} />
      </div>

      <QuickSelectRow values={(mode === 'buy' ? maxBuys : maxSells)} onPick={handleQuick} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ color: 'var(--kappa-accent)', fontSize: 13 }}>You receive:</span>
        <span style={{ color: 'var(--kappa-text)', fontSize: 13 }}>{youReceive}</span>
      </div>

      <div style={{ marginTop: 10, border: `1px dotted ${hasError ? 'var(--kappa-status-err-border)' : 'var(--kappa-status-ok-border)'}`, background: hasError ? 'var(--kappa-status-err-bg)' : 'var(--kappa-status-ok-bg)', borderRadius: 6, padding: 6, color: hasError ? 'var(--kappa-error)' : 'var(--kappa-text)', fontSize: 12 }}>
        {statusText}
      </div>

      <div style={{ height: 8 }} />
      <button onClick={onPrimary} disabled={isPrimaryDisabled} style={{ ...primaryBtn, marginTop: 8, opacity: isPrimaryDisabled ? 0.6 : 1, cursor: isPrimaryDisabled ? 'not-allowed' : 'pointer' }}>{primaryLabel}</button>
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
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 50, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
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

function Widget(props: { theme?: Partial<Record<keyof typeof defaultTheme, string>> }) {
  const { theme } = props || {} as any;
  const [contract, setContract] = useState('');
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [slippage, setSlippage] = useState('1');
  const [view, setView] = useState<'trade' | 'slippage'>('trade');

  // search state
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [suiIn, setSuiIn] = useState('0');
  const [tokensIn, setTokensIn] = useState('0');
  const [quoteTokens, setQuoteTokens] = useState<number>(0);
  const [quoteSui, setQuoteSui] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Ready to trade');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPrimaryDisabled, setIsPrimaryDisabled] = useState<boolean>(false);
  const [txOpen, setTxOpen] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const [curve, setCurve] = useState<any>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenAvatarUrl, setTokenAvatarUrl] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);

  const [suiBalance, setSuiBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);

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

  // Helper: exclude migrated coins (those that already have a pair/pool address)
  const isMigratedCoin = (item: any): boolean => {
    const fields = [
      item?.pairAddress,
      item?.pairContractAddress,
      item?.pair,
      item?.pair_object,
      item?.pairObject,
      item?.poolAddress,
      item?.lpAddress,
    ];
    return fields.some((v) => !!(typeof v === 'string' ? v.trim() : v));
  };

  useEffect(() => {
    let abort = false;
    async function load() {
      try {
        setCurve(null);
        setTokenSymbol('');
        setTokenName('');
        setTokenAvatarUrl('');
        setIsVerified(false);
        // If user is typing a name/symbol (no ::), trigger search and skip contract load
        if (!contract || !contract.includes('::')) {
          // Show search dropdown and run search when input is not a contract type
          setShowSearch(true);
          if (!contract) { setSearchResults([]); return; }
          setIsSearching(true);
          try {
            const res = await fetch('https://api.kappa.fun/v1/coins/trending');
            const json = await res.json();
            const all: any[] = (json?.data || []) as any[];
            const list = all.filter((c) => !isMigratedCoin(c));
            const q = contract.trim().toLowerCase();
            const bySymbol = list.filter((c) => String(c.symbol || '').toLowerCase().includes(q));
            const byName = list.filter((c) => String(c.name || '').toLowerCase().includes(q));
            const merged: any[] = [];
            const seen = new Set<string>();
            for (const it of bySymbol.concat(byName)) {
              const key = String(it.contractAddress || '');
              if (!seen.has(key)) { seen.add(key); merged.push(it); }
            }
            setSearchResults(merged.slice(0, 100));
          } catch {
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
          return;
        }
        const res = await fetch('https://api.kappa.fun/v1/coins/trending');
        const json = await res.json();
        const listAll = (json?.data || []) as any[];
        const list = listAll.filter((c) => !isMigratedCoin(c));
        const normalized = contract.trim();
        // Try exact full type match first
        let item = list.find((c: any) => (c.contractAddress || '').toLowerCase() === normalized.toLowerCase());
        // Fallback: try by packageId prefix
        if (!item) {
          const pkg = normalized.split('::')[0];
          item = list.find((c: any) => (c.contractAddress || '').toLowerCase().startsWith(`${pkg.toLowerCase()}::`));
        }
        const coinType = normalized;
        if (item?.symbol) setTokenSymbol(String(item.symbol).toUpperCase());
        else {
          const seg = normalized.split('::')[2];
          if (seg) setTokenSymbol(seg.toUpperCase());
        }
        if (item?.avatarUrl) {
          const url = String(item.avatarUrl).trim();
          if (url.startsWith('http')) setTokenAvatarUrl(url); else setTokenAvatarUrl('');
        }
        if (item?.name) setTokenName(String(item.name));
        setIsVerified(!!item);
        if (item?.bondingContractAddress) {
          const obj = await client.getObject({ id: item.bondingContractAddress, options: { showContent: true } });
          if (!abort) setCurve(obj?.data || null);
        }
        if (account?.address) {
          const bal = await suiClientHook.getBalance({ owner: account.address });
          setSuiBalance(Math.max(0, Number(bal.totalBalance || 0)) / 1e9);
          const tbal = await suiClientHook.getBalance({ owner: account.address, coinType });
          setTokenBalance(Math.max(0, Number(tbal.totalBalance || 0)) / 1e9);
        }
      } catch {}
    }
    load();
    return () => { abort = true; };
  }, [contract, account?.address, client, suiClientHook]);

  useEffect(() => {
    async function computeQuotes() {
      try {
        const math = await import('../../../math.js');
        const suiMist = Math.max(0, Math.floor(Number(suiIn) * 1e9));
        const tokensAmt = Math.max(0, Math.floor(Number(tokensIn)));
        if (curve && suiMist > 0) setQuoteTokens(math.buyMath(curve, suiMist)); else setQuoteTokens(0);
        if (curve && tokensAmt > 0) setQuoteSui(math.sellMath(curve, tokensAmt)); else setQuoteSui(0);
      } catch {
        setQuoteTokens(0); setQuoteSui(0);
      }
    }
    computeQuotes();
  }, [curve, suiIn, tokensIn]);

  // Always load SUI balance as soon as wallet connects (independent of contract input)
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

  // removed click search trigger (dropdown is dynamic on input)

  const onSelectResult = (item: any) => {
    const ca = String(item.contractAddress || '');
    setContract(ca);
    setTokenSymbol(String(item.symbol || '').toUpperCase());
    setTokenName(String(item.name || ''));
    setTokenAvatarUrl(String(item.avatarUrl || ''));
    setIsVerified(true);
    setShowSearch(false);
  };

  const maxBuys = ['5','10','15','20','50','MAX'];
  const maxSells = ['1/4','1/2','3/4','MAX'];

  const handleQuick = (val: string) => {
    if (mode === 'buy') {
      if (val === 'MAX') setSuiIn(String(Math.max(0, Math.floor(suiBalance*100)/100)));
      else setSuiIn(val);
    } else {
      const bal = tokenBalance;
      if (val === 'MAX') setTokensIn(String(Math.floor(bal*1e9)));
      else if (val === '1/2') setTokensIn(String(Math.floor(bal*1e9/2)));
      else if (val === '1/4') setTokensIn(String(Math.floor(bal*1e9/4)));
      else if (val === '3/4') setTokensIn(String(Math.floor(bal*1e9*3/4)));
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
  };

  const abbreviateContract = (val: string) => {
    if (!val || val.length <= 20) return val;
    const head = val.slice(0, 5);
    const tail = val.slice(-12);
    return `${head}...${tail}`;
  };

  const onBuy = async () => {
    try {
      if (!signer) { alert('Connect wallet first'); return; }
      setTxOpen(true); setTxLoading(true); setTxDigest(null); setTxError(null);
      const trade = await import('../../../kappa-trade.js');
      trade.setSuiClient(client);
      const [pkg, mod] = contract.split('::');
      const slip = Math.max(0, Math.min(100, Number(slippage) || 0));
      const minOut = Math.floor(Math.max(0, quoteTokens) * (1 - slip / 100));
      const res = await trade.buyWeb3(signer as any, {
        publishedObject: { packageId: pkg },
        name: (mod || '').replaceAll('_', ' '),
        sui: Math.floor(parseFloat(suiIn) * 1e9),
        min_tokens: minOut,
      });
      if (res?.success) { setTxDigest(res?.digest || null); } else { setTxError(res?.error || 'unknown error'); }
    } catch (e: any) { alert('Buy failed: ' + (e?.message || String(e))); }
    finally { setTxLoading(false); }
  };

  const onSell = async () => {
    try {
      if (!signer) { alert('Connect wallet first'); return; }
      setTxOpen(true); setTxLoading(true); setTxDigest(null); setTxError(null);
      const trade = await import('../../../kappa-trade.js');
      trade.setSuiClient(client);
      const [pkg, mod] = contract.split('::');
      const slip = Math.max(0, Math.min(100, Number(slippage) || 0));
      const minSui = Math.floor(Math.max(0, quoteSui) * (1 - slip / 100));
      const res = await trade.sellWeb3(signer as any, {
        publishedObject: { packageId: pkg },
        name: (mod || '').replaceAll('_', ' '),
        sell_token: String(Math.floor(parseFloat(tokensIn))),
        min_sui: minSui,
      });
      if (res?.success) { setTxDigest(res?.digest || null); } else { setTxError(res?.error || 'unknown error'); }
    } catch (e: any) { alert('Sell failed: ' + (e?.message || String(e))); }
    finally { setTxLoading(false); }
  };
  // validation for balances and inputs
  useEffect(() => {
    const suiInNum = Math.max(0, Number(suiIn));
    const tokensInNum = Math.max(0, Number(tokensIn));
    let text = 'Ready to trade';
    let error = false;
    let disabled = false;
    if (!contract) {
      text = 'Enter a token contract or search by name';
      error = true; disabled = true;
    } else if (!curve) {
      text = 'Token data not loaded yet';
      error = false; disabled = true;
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
  }, [contract, curve, mode, suiIn, tokensIn, suiBalance, tokenBalance]);


  
  

  const themeVars = { ...defaultTheme, ...(theme || {}) } as Record<string, string>;
  return (
    <div style={{ width: 440, background: 'var(--kappa-bg)', borderRadius: 16, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.45)', border: '1px solid var(--kappa-border)', position: 'relative', overflow: 'hidden', ...(themeVars as any) }}>
      <style>{`
        .kappa-dropdown::-webkit-scrollbar { width: 6px; }
        .kappa-dropdown::-webkit-scrollbar-track { background: transparent; }
        .kappa-dropdown::-webkit-scrollbar-thumb { background: #2f3b4a; border-radius: 6px; }
        .kappa-dropdown::-webkit-scrollbar-thumb:hover { background: #3a4a5f; }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--kappa-text)' }}>KAPPA</h2>
        <WalletControls />
      </div>

      <div style={{ position: 'relative', minHeight: 360, paddingBottom: 26 }}>
        <div
          style={{ position: 'absolute', inset: 0, transition: 'transform 200ms ease, opacity 200ms ease', transform: view==='trade' ? 'translateX(0)' : 'translateX(-12px)', opacity: view==='trade' ? 1 : 0, pointerEvents: view==='trade' ? 'auto' : 'none' }}
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
            onSelectResult={onSelectResult}
            isSearching={isSearching}
            mode={mode}
            setMode={setMode}
            suiBalance={suiBalance}
            tokenBalance={tokenBalance}
            setView={setView}
            maxBuys={maxBuys}
            maxSells={maxSells}
            handleQuick={handleQuick}
            amountProps={{ mode, suiIn, tokensIn, onSuiChange: setSuiIn, onTokensChange: setTokensIn, tokenSymbol, tokenAvatarUrl }}
            youReceive={mode==='buy' ? `${(quoteTokens/1e9).toLocaleString(undefined,{maximumFractionDigits:2})} ${tokenSymbol || 'TOKEN'}` : `${(quoteSui/1e9).toLocaleString(undefined,{maximumFractionDigits:6})} SUI`}
            onPrimary={mode==='buy' ? onBuy : onSell}
            primaryLabel={mode==='buy' ? 'Buy' : 'Sell'}
            statusText={statusText}
            hasError={hasError}
            isPrimaryDisabled={isPrimaryDisabled}
          />
        </div>
        <div style={{ position: 'absolute', inset: 0, transition: 'transform 200ms ease, opacity 200ms ease', transform: view==='slippage' ? 'translateX(0)' : 'translateX(12px)', opacity: view==='slippage' ? 1 : 0, pointerEvents: view==='slippage' ? 'auto' : 'none' }}>
          <SlippagePanel slippage={slippage} setSlippage={setSlippage} onClose={() => setView('trade')} />
        </div>
      </div>
      <TransactionModal
        open={txOpen}
        loading={txLoading}
        digest={txDigest}
        error={txError}
        spentLabel={mode==='buy' ? `${suiIn} SUI` : `${tokensIn} ${tokenSymbol}`}
        forLabel={mode==='buy' ? `${(quoteTokens/1e9).toFixed(2)} ${tokenSymbol}` : `${(quoteSui/1e9).toFixed(6)} SUI`}
        onClose={() => setTxOpen(false)}
      />
    </div>
  );
}

export default function Page() {
  const client = useMemo(() => new SuiClient({ url: networkConfig.mainnet.url }), []);
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
            <Widget />
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
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
          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 10, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', zIndex: 10, width: 'max-content', minWidth: 120, maxWidth: 220, overflow: 'hidden' }}>
            {(wallets || []).map((w, i) => (
              <button
                key={w.name}
                onClick={() => connect({ wallet: w })}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: hoverIdx===i ? 'var(--kappa-chip-bg)' : 'transparent', color: 'var(--kappa-text)', border: 'none', cursor: 'pointer', padding: '8px 12px', width: '100%', textAlign: 'left', transition: 'background 120ms ease', whiteSpace: 'nowrap' }}
              >
                {w.icon && <img src={w.icon} alt={w.name} style={{ width: 18, height: 18 }} />}
                <span style={{ fontSize: 13 }}>{w.name}</span>
              </button>
            ))}
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
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 10, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', zIndex: 10, width: 'max-content', minWidth: 120, maxWidth: 200, overflow: 'hidden' }}>
          <button
            onClick={() => disconnect()}
            onMouseEnter={() => setHoverDisconnect(true)}
            onMouseLeave={() => setHoverDisconnect(false)}
            style={{ display: 'block', background: hoverDisconnect ? 'var(--kappa-chip-bg)' : 'transparent', color: 'var(--kappa-text)', border: 'none', cursor: 'pointer', padding: '8px 12px', width: '100%', textAlign: 'center', transition: 'background 120ms ease', whiteSpace: 'nowrap' }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}


