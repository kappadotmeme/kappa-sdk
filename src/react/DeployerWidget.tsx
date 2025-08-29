// @ts-nocheck
"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { createNetworkConfig, SuiClientProvider, WalletProvider, useConnectWallet, useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction, useSuiClient, useWallets } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Network config (mainnet by default)
const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const label: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 12, color: 'var(--kappa-muted)', fontWeight: 500 };
const input: React.CSSProperties = { width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--kappa-border)', background: 'var(--kappa-input-bg)', color: 'var(--kappa-text)', fontSize: 16, outline: 'none', boxSizing: 'border-box', transition: 'border-color 150ms ease' };
const textArea: React.CSSProperties = { ...input, height: 80, resize: 'vertical', fontFamily: 'inherit' };
const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'stretch' };
const btn: React.CSSProperties = { width: '100%', padding: 12, borderRadius: 10, background: 'var(--kappa-primary)', color: 'var(--kappa-text-on-primary)', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 600, transition: 'opacity 150ms ease' };
const card: React.CSSProperties = { background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 12, padding: 16, boxSizing: 'border-box' };

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

// Configuration interface for third-party modules
export interface ModuleConfig {
  bondingContract?: string;
  CONFIG?: string;
  globalPauseStatusObjectId?: string;
  poolsId?: string;
  moduleName?: string;
  lpBurnManger?: string;
}

// Default Kappa module configuration
const defaultModuleConfig: ModuleConfig = {
  bondingContract: "0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc",
  CONFIG: "0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c",
  globalPauseStatusObjectId: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
  poolsId: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
  lpBurnManger: "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845",
  moduleName: "kappadotmeme"
};

// Inline SVG fallback logo (same as Widget.tsx) - full colorful Kappa emoji
const DEFAULT_LOGO_DATA = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.1268 21.8877C13.7496 26.7985 8.64625 34.9674 7.14173 38.4375C9.30824 36.7042 13.3404 35.107 15.0856 34.5257C8.44164 42.5177 6.5002 50.6145 6.35938 53.6633C8.52589 50.582 11.234 48.7284 12.3173 48.1868C8.80272 57.1417 10.4914 65.0772 11.7757 67.9261C12.0164 66.1929 13.4403 63.5125 14.1227 62.3895C14.6523 64.9893 16.4301 68.0862 17.2521 69.3103L19.4788 66.1207C17.9863 63.9061 17.7733 60.0629 17.8539 58.4176C14.9171 53.9401 16.3097 47.5645 17.3725 44.937C18.3354 40.1225 22.1063 35.9905 23.872 34.5257C24.333 36.9329 26.3154 42.3011 30.5521 44.5157C30.2151 42.59 31.3742 39.2198 31.9965 37.7755C33.3 39.9624 37.3405 44.7204 43.0698 46.261C41.9624 43.6612 42.6088 39.5207 43.0698 37.7755C45.0353 39.5412 49.9906 43.1436 54.0829 43.4325C53.0237 42.3733 52.1968 38.9394 51.9164 37.3542C53.7218 38.8383 58.6567 41.928 63.9526 42.4094C62.3157 40.3873 61.0242 37.2736 60.5824 35.97C67.2746 38.8106 70.954 45.2981 71.9567 48.1868C75.4231 60.0304 71.5956 67.7251 69.2485 70.0927C71.6076 69.9964 75.0463 66.5215 76.4702 64.7967C76.6628 80.1068 65.4715 87.1034 59.8519 88.6886C58.9154 90.2316 57.8731 91.4942 57.2725 92.1189C66.5644 91.2042 73.7825 84.0751 76.2295 80.6243C76.2776 82.0205 75.5675 84.0546 75.2064 84.8972C81.7541 81.3826 84.3539 72.8008 84.8354 68.9492C85.3566 70.3731 86.4001 73.8961 86.4001 76.5922C91.0701 69.7075 90.5129 60.3638 89.6499 56.5519C90.6128 57.4342 92.8996 60.0063 94.344 63.232C95.8365 52.4957 89.2286 41.266 85.7381 36.9931C87.8649 37.8561 92.4423 39.8818 93.7422 41.0854C90.3239 31.9861 81.8865 24.6957 78.0951 22.1886C80.7431 17.3741 78.4562 10.7542 67.8042 7.74515C59.2825 5.33791 51.6155 5.01654 48.8472 5.15737C21.212 6.98687 19.5186 17.0732 22.1268 21.8877Z" fill="#141315"/>
<path d="M25.1361 59.6815C16.3738 58.3334 17.0322 51.3368 18.4561 48.0063L25.3167 51.3765C23.102 55.2762 25.236 57.5751 26.5805 58.2371L25.1361 59.6815Z" fill="#D9D9D9"/>
<path d="M51.4349 62.5098C44.4539 62.5098 42.6689 57.2139 42.6484 54.5659L53.5412 51.5569C53.1199 52.3597 52.5542 54.5058 53.6616 56.6723C55.0457 59.3804 58.7168 58.7786 58.9575 58.7786C56.6465 62.0525 52.9791 62.6302 51.4349 62.5098Z" fill="#D9D9D9"/>
<path d="M58.5963 52.219C58.163 51.3043 58.7768 50.5544 59.1379 50.2932C61.0035 49.3905 61.3044 51.1358 61.3646 51.557C61.4248 51.9783 61.2443 52.9412 60.823 53.1819C60.4017 53.4227 59.1379 53.3625 58.5963 52.219Z" fill="#D9D9D9"/>
<path d="M17.6053 68.3475L14.4157 54.1448H12.9714L15.1981 33.9842L24.1048 29.0493H58.4682L73.8143 42.59L78.3279 59.6814L76.2216 75.7498L65.6297 87.1842L55.399 90.7348C41.8582 97.4751 35.3587 92.4801 29.5211 90.7348C23.6836 88.9896 25.6695 86.1009 23.3225 85.5593C20.9754 85.0176 14.4157 91.9385 12.9714 91.6375C11.527 91.3366 11.527 87.5452 11.8881 82.9113C12.177 79.2042 15.8203 71.6575 17.6053 68.3475Z" fill="#145D87" stroke="black" stroke-width="0.081103"/>
<path d="M33.3814 47.2239C31.5038 49.1497 31.1547 51.1958 31.2149 51.9782C26.3318 49.1376 19.9129 46.1009 17.3131 44.937C14.6651 52.1587 16.0493 55.8298 17.8547 58.4777C19.299 60.5961 22.0674 61.4471 23.271 61.6071L45.1167 62.9311C49.1609 65.531 53.6624 64.8966 55.4076 64.2551C64.1218 60.7887 64.3746 52.9808 63.4117 49.5108L66.9022 48.6682C64.0737 46.261 59.3194 47.8859 57.0325 48.247C54.7456 48.6081 43.3113 52.2791 40.904 52.5198C38.9782 52.7124 37.8553 50.1932 37.5339 48.909C36.0895 54.2049 38.9385 55.4085 40.5429 55.3483C40.6874 57.7074 41.6057 59.4202 42.0475 59.9823C41.2254 59.1602 39.4236 57.3343 38.7977 56.6121C38.1718 55.89 37.0127 55.3483 36.5108 55.1678C32.3704 53.8679 32.6989 49.3302 33.3814 47.2239Z" fill="black"/>
<path d="M25.1361 59.8018C16.3738 58.4538 17.0322 51.4571 18.4561 48.1267L25.3167 51.4968C23.102 55.3966 25.236 57.6955 26.5805 58.3575L25.1361 59.8018Z" fill="#D9FFE2"/>
<path d="M51.4349 62.6302C44.4539 62.6302 42.6689 57.3343 42.6484 54.6863L53.5412 51.6772C53.1199 52.4801 52.5542 54.6261 53.6616 56.7926C55.0457 59.5008 58.7168 58.899 58.9575 58.899C56.6465 62.1728 52.9791 62.7505 51.4349 62.6302Z" fill="#D9FFE2"/>
<path d="M58.5963 52.3394C58.163 51.4247 58.7768 50.6748 59.1379 50.4136C61.0035 49.5109 61.3044 51.2561 61.3646 51.6774C61.4248 52.0987 61.2443 53.0616 60.823 53.3023C60.4017 53.543 59.1379 53.4828 58.5963 52.3394Z" fill="#D9D9D9"/>
<path d="M61.5451 85.0694C53.1535 95.6661 36.2607 95.6661 25.7266 86.0347C20.2321 81.0108 59.6855 63.8123 64.8334 67.5724C69.6058 71.0581 61.5439 85.0694 61.5439 85.0694H61.5451Z" fill="#228399"/>
<path d="M33.5007 56.3715C29.5528 56.1308 21.6197 67.3834 18.6179 71.4781C12.0209 80.4764 14.2427 90.1246 14.2427 90.1246C27.3441 82.2662 56.2033 82.0435 61.8844 67.5194C60.4473 67.1294 58.1002 67.1487 57.0314 67.6771C53.6878 67.9876 54.3233 66.8105 49.7495 67.0247C47.5963 67.1258 42.2269 62.812 42.2269 62.812C40.9631 60.7659 37.4485 56.6134 33.5007 56.3727V56.3715Z" fill="#228399"/>
<path d="M29.4102 68.8808C31.7693 66.6661 33.2016 66.3929 33.6228 66.5337C33.8238 67.0356 34.4894 67.6049 35.5486 65.8717C36.6078 64.1385 35.669 63.3441 35.0672 63.1636C31.697 63.1636 29.8916 66.9754 29.4102 68.8808Z" fill="#141315"/>
<path d="M29.0485 42.9836C25.6182 43.0438 21.5259 36.1831 21.4657 35.9424L21.2852 33.1741L27.7245 33.9564L49.51 35.2202L57.6345 37.2664C58.8586 38.6505 61.3055 41.455 61.3055 41.5994C55.5281 41.455 52.1183 39.2524 51.1349 38.1691L53.4218 42.9836C50.5813 43.8983 44.5355 41.5597 41.8671 40.2754C41.8069 41.8606 41.6865 45.114 41.6865 45.451C34.7055 44.6807 30.9948 40.6365 30.0114 38.7107C29.69 39.8939 29.0485 42.4058 29.0485 42.9836Z" fill="black" fill-opacity="0.2"/>
<path d="M62.6298 36.7847L62.4492 34.0164H62.6298C70.4533 35.9421 82.0682 54.839 80.8646 64.1069C79.7632 72.5875 72.5645 79.6669 71.1189 81.03C71.0373 81.1158 70.9559 81.1921 70.8746 81.2584C70.9001 81.2339 70.9847 81.1566 71.1189 81.03C73.4052 78.6284 75.7824 68.8523 76.7121 64.1069C73.9197 68.3436 70.1724 70.4058 68.6479 70.9073C76.5918 54.7307 67.9457 41.4186 62.6298 36.7847Z" fill="#104A6C"/>
<path d="M44.1778 81.6197C40.9473 82.3214 29.1579 84.973 25.4375 86.2537L26.8818 87.2767L28.0855 88.2396C41.0364 86.699 53.5528 78.6612 58.147 74.9504C55.1645 77.5683 47.8645 80.8181 44.1778 81.6197Z" fill="black" fill-opacity="0.43"/>
<path d="M7.14173 38.5253C8.64625 35.0553 13.7496 26.8863 22.1268 21.9756C19.5186 17.1611 21.212 7.07476 48.8472 5.24526C51.6155 5.10443 59.2825 5.4258 67.8042 7.83304C78.4562 10.8421 80.7431 17.462 78.0951 22.2765C81.8865 24.7836 90.3239 32.0739 93.7422 41.1733C92.4423 39.9697 87.8649 37.944 85.7381 37.081C89.2286 41.3538 95.8365 52.5836 94.344 63.3199C92.8996 60.0942 90.6128 57.5221 89.6499 56.6398C90.5129 60.4517 91.0701 69.7954 86.4001 76.6801C86.4001 73.984 85.3566 70.461 84.8354 69.0371C84.3539 72.8887 81.7541 81.4705 75.2064 84.9851C75.5675 84.1425 76.2776 82.1084 76.2295 80.7122C73.8355 84.0872 66.875 90.9839 57.8743 92.1382C57.5373 92.1851 56.0484 92.6076 55.3467 92.8122L59.0779 88.8403L59.8519 88.7753C65.4715 87.1901 76.6628 80.1935 76.4702 64.8834C75.0463 66.6082 71.6076 70.0831 69.2485 70.1793C71.5956 67.8118 75.4231 60.1171 71.9567 48.2735C70.954 45.3848 67.2746 38.8973 60.5824 36.0567C61.0242 37.3602 62.3157 40.474 63.9526 42.4961C58.6567 42.0146 53.7218 38.9249 51.9164 37.4409C52.1968 39.0261 53.0237 42.46 54.0829 43.5192C49.9906 43.2303 45.0353 39.6279 43.0698 37.8622C42.6088 39.6074 41.9624 43.7479 43.0698 46.3477C37.3405 44.807 33.3 40.0491 31.9965 37.8622C31.3742 39.3065 30.2151 42.6766 30.5521 44.6024C26.3154 42.3878 24.333 37.0196 23.872 34.6124C22.1063 36.0772 18.3354 40.2092 17.3725 45.0237C16.3097 47.6512 14.9171 54.0268 17.8539 58.5042C17.7733 60.1496 17.9863 63.9927 19.4788 66.2074L17.2521 69.397C16.4301 68.1729 14.6523 65.076 14.1227 62.4762C13.4403 63.5992 12.0164 66.2796 11.7757 68.0128C10.4914 65.1639 8.80272 57.2284 12.3173 48.2735C11.234 48.8151 8.52589 50.6687 6.35938 53.7499C6.5002 50.7012 8.44164 42.6044 15.0856 34.6124C13.3404 35.1937 9.30824 36.7909 7.14173 38.5241V38.5253Z" fill="black"/>
<path d="M50.4113 29.0494C63.972 29.0494 74.9651 24.3881 74.9651 18.6381C74.9651 12.8881 63.972 8.22681 50.4113 8.22681C36.8506 8.22681 25.8574 12.8881 25.8574 18.6381C25.8574 24.3881 36.8506 29.0494 50.4113 29.0494Z" fill="#093659"/>
<path d="M50.352 25.679C61.4864 25.679 70.5127 22.4996 70.5127 18.5777C70.5127 14.6557 61.4864 11.4763 50.352 11.4763C39.2176 11.4763 30.1914 14.6557 30.1914 18.5777C30.1914 22.4996 39.2176 25.679 50.352 25.679Z" fill="#151011"/>
<path d="M50.4117 25.6793C60.9146 25.6793 69.4289 22.9579 69.4289 19.601C69.4289 16.244 60.9146 13.5227 50.4117 13.5227C39.9088 13.5227 31.3945 16.244 31.3945 19.601C31.3945 22.9579 39.9088 25.6793 50.4117 25.6793Z" fill="#228399"/>
<path d="M34.584 19.5408C36.8107 23.6331 58.2351 27.0032 66.3595 19.5408C54.203 24.8367 39.4791 21.7277 34.584 19.5408Z" fill="#31B0B0"/>
<path d="M26.4598 58.3489C30.841 53.9196 35.1054 54.4166 36.6906 55.2195C38.7969 55.7009 45.2965 65.5706 52.7589 67.1353C46.6494 68.2186 42.1671 63.9457 40.0006 61.4181C37.834 58.8905 36.9313 57.4462 33.6214 57.0851C30.3114 56.724 23.3304 63.7652 17.7938 72.7923C13.3645 80.014 13.5811 87.3561 14.2431 90.1244C23.2702 83.2036 25.7377 83.2638 42.468 79.4122C55.8522 76.3309 60.4019 70.1443 61.0037 67.4362C60.3297 67.2436 58.0753 67.5168 57.0318 67.6769C59.1502 65.0771 62.2073 64.7485 63.4711 64.9086C65.6172 65.1493 69.1763 67.1112 66.2395 73.033C67.0579 68.9889 64.7349 67.7768 63.4711 67.6769C62.2073 73.8756 52.7589 79.8937 42.468 82.1805C32.177 84.4674 26.2191 86.2127 26.0386 86.333C30.2272 90.4253 36.7712 92.2103 39.5191 92.5919C49.5332 94.9028 58.3762 88.5393 61.5454 85.0692C59.6677 89.5467 57.914 91.5892 57.2725 92.0502C42.3476 100.379 28.4253 92.3909 23.3304 87.3561C20.201 88.1385 16.2892 91.629 14.8449 92.5919C13.4006 93.5548 9.66934 92.2308 12.0164 81.6389C14.3635 71.0471 20.9834 63.8855 26.4598 58.3489Z" fill="black"/>
</svg>`);
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
                <button key={w.name} onClick={() => connect({ wallet: w })} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: hoverIdx===i ? 'var(--kappa-chip-bg)' : 'transparent', color: 'var(--kappa-text)', border: 'none', cursor: 'pointer', padding: '10px 14px', width: '100%', textAlign: 'left', transition: 'background 120ms ease', whiteSpace: 'nowrap' }}>
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
          <button onClick={() => disconnect()} onMouseEnter={() => setHoverDisconnect(true)} onMouseLeave={() => setHoverDisconnect(false)} style={{ display: 'block', background: hoverDisconnect ? 'var(--kappa-chip-bg)' : 'transparent', color: 'var(--kappa-text)', border: 'none', cursor: 'pointer', padding: '10px 14px', width: '100%', textAlign: 'center', transition: 'background 120ms ease', whiteSpace: 'nowrap' }}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

function DevBuyQuotePreview(props: { devBuy: string }) {
  const { devBuy } = props;
  const [quote, setQuote] = useState<string>('');
  useEffect(() => {
    let active = true;
    async function compute() {
      try {
        const amt = Math.max(0, Number(devBuy) || 0);
        if (!amt) { if (active) setQuote(''); return; }
        
        // Import math.js and use firstBuyMath like deployer-exmaple.md does
        const mathMod = await import('../../math.js');
        const firstBuyMath = (mathMod as any).firstBuyMath || (mathMod as any).default?.firstBuyMath;
        
        if (typeof firstBuyMath === 'function') {
          // firstBuyMath expects MIST, returns tokens in smallest units
          const suiMist = amt * 1e9;
          const tokensSmallest = firstBuyMath(suiMist);
          // Convert to display units (assuming 9 decimals)
          const tokensDisplay = tokensSmallest / 1e9;
          if (active) setQuote(tokensDisplay.toLocaleString(undefined, { maximumFractionDigits: 2 }));
        } else {
          // Fallback calculation if import fails
          const INITIAL_INPUT_RESERVE = 1_900 * 1e9; // From math.js
          const INITIAL_OUTPUT_RESERVE = 876_800_000 * 1e9; // From math.js
          const FEE_BPS = 100;
          const BPS_DENOMINATOR = 10000;
          
          const sui_amount = amt * 1e9; // Convert to MIST
          const fee_amount = (sui_amount * FEE_BPS) / BPS_DENOMINATOR;
          const amount_after_fee = sui_amount - fee_amount;
          
          const tokensSmallest = (amount_after_fee * INITIAL_OUTPUT_RESERVE) / 
                                 (INITIAL_INPUT_RESERVE + amount_after_fee);
          const tokensDisplay = tokensSmallest / 1e9;
          
          if (active) setQuote(tokensDisplay.toLocaleString(undefined, { maximumFractionDigits: 2 }));
        }
      } catch {
        if (active) setQuote('');
      }
    }
    compute();
    return () => { active = false; };
  }, [devBuy]);
  if (!quote) return null;
  return (
    <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
      ≈ {quote} tokens
    </div>
  );
}

function useValidation(coinData: any, fileState: { fileError: boolean; fileSizeError: boolean; isImagePreviewValid: boolean | null }) {
  const validateName = (name: string): { isValid: boolean; error: string } => {
    if (!name || !name.trim()) return { isValid: false, error: 'Name is required' };
    const t = name.trim();
    if (t.length < 1) return { isValid: false, error: 'Name must be at least 1 character' };
    if (t.length > 32) return { isValid: false, error: 'Name cannot exceed 32 characters' };
    if (!/^[A-Za-z0-9\s]+$/.test(t)) return { isValid: false, error: 'Name can only contain letters, numbers, and spaces' };
    return { isValid: true, error: '' };
  };
  const validateTicker = (ticker: string): { isValid: boolean; error: string } => {
    if (!ticker || !ticker.trim()) return { isValid: false, error: 'Ticker is required' };
    const t = ticker.trim();
    if (t.length < 1) return { isValid: false, error: 'Ticker must be at least 1 character' };
    if (t.length > 12) return { isValid: false, error: 'Ticker cannot exceed 12 characters' };
    if (!/^[A-Za-z0-9]+$/.test(t)) return { isValid: false, error: 'Ticker can only contain letters and numbers' };
    return { isValid: true, error: '' };
  };
  const isValidHttpUrl = (v?: string) => {
    if (!v) return false; try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
  };
  const validateAll = (): { valid: boolean; errors: any } => {
    const nameRes = validateName(coinData.name);
    const tickRes = validateTicker(coinData.ticker);
    const descOk = coinData.description?.trim() && coinData.description.length >= 2 && coinData.description.length <= 256;
    const usingUrl = !!coinData.imageUrl && !coinData.file;
    const urlOk = usingUrl && isValidHttpUrl(coinData.imageUrl) && fileState.isImagePreviewValid === true;
    const nameLower = coinData.name.trim().toLowerCase();
    const tickerLower = coinData.ticker.trim().toLowerCase();
    const descriptionLower = coinData.description.trim().toLowerCase();
    const nameTrim = coinData.name.trim();
    const tickerTrim = coinData.ticker.trim();
    let uniqueness = false; let dup = false;
    if (nameTrim && tickerTrim && nameTrim === nameTrim.toUpperCase() && tickerTrim === tickerTrim.toUpperCase() && nameTrim === tickerTrim) dup = true;
    if ((nameLower && descriptionLower && nameLower === descriptionLower) || (tickerLower && descriptionLower && tickerLower === descriptionLower)) uniqueness = true;
    const errors = {
      name: !nameRes.isValid,
      ticker: !tickRes.isValid,
      file: !(coinData.file || urlOk) || fileState.fileSizeError || fileState.fileError,
      description: !descOk,
      uniqueness,
      nameTickerDuplicate: dup,
    };
    const valid = !Object.values(errors).some(Boolean);
    return { valid, errors };
  };
  return { validateAll };
}

function DeployerInner(props: {
  network?: ModuleConfig;
  onSuccess?: (coinAddress: string) => void;
  defaultDevBuySui?: string;
  maxWidth?: number;
  logoUrl?: string;
  projectName?: string;
  theme?: Partial<Record<keyof typeof defaultTheme, string>>;
}) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  
  // Merge custom config with defaults
  const network = { ...defaultModuleConfig, ...(props.network || {}) };
  const theme = props.theme;

  const [coinData, setCoinData] = useState({ name: '', ticker: '', description: '', file: null as File | null, imageUrl: '', twitterLink: '', telegramLink: '', websiteLink: '', tags: [] as string[], hasMaxBuy: false });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [fileName, setFileName] = useState<string>('No file chosen');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImagePreviewValid, setIsImagePreviewValid] = useState<boolean | null>(null);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [devBuy, setDevBuy] = useState<string>(props.defaultDevBuySui || '5');
  const [devBuyError, setDevBuyError] = useState<string>('');
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCoinAddress, setSuccessCoinAddress] = useState('');

  const validator = useValidation(coinData, { fileError, fileSizeError, isImagePreviewValid });

  useEffect(() => {
    const { valid, errors } = validator.validateAll();
    setIsFormValid(valid); setErrors(errors);
  }, [coinData, fileError, fileSizeError, isImagePreviewValid]);

  const handleFileChange = (file?: File) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) { setFileError(true); setFileSizeError(false); setPreviewUrl(null); return; }
    if (file.size > 2 * 1024 * 1024) { setFileSizeError(true); setFileError(true); return; }
    setFileError(false); setFileSizeError(false);
    const parts = file.name.split('.'); const ext = parts.pop() || ''; const name = parts.join('.'); const truncated = name.length > 8 ? name.substring(0, 8) : name; setFileName(`${truncated}.${ext}`);
    setCoinData((s: any) => ({ ...s, file }));
    const reader = new FileReader(); reader.onloadend = () => { setPreviewUrl(reader.result as string); setIsImagePreviewValid(null); }; reader.readAsDataURL(file);
  };

  const toDisplayName = (v: string) => v.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w).join(' ');
  const toDisplayTicker = (v: string) => v.toUpperCase();

  const publishAndCreate = async () => {
    // Declare these at function scope so they're accessible throughout
    let publishedObject: any = null;
    let treasuryCapObject: any = null;
    let coinMetadataObject: any = null;
    
    try {
      if (!account) { alert('Connect wallet to continue'); return; }
      if (!isFormValid) { alert('Please fix validation errors'); return; }
      setPublishing(true); setStatus('Publishing coin…');

      // Prepare metadata object
      const coinMetadata = {
        decimals: 6,
        symbol: toDisplayTicker(coinData.ticker),
        name: toDisplayName(coinData.name),
        description: coinData.description,
        supply: 9,
        icon: coinData.imageUrl || '',
        twitter: coinData.twitterLink || '',
        website: coinData.websiteLink || '',
        telegram: coinData.telegramLink || '',
        percent: 0,
        maxTx: coinData.hasMaxBuy ? 'true' : 'false',
        tags: coinData.tags || [],
      };

      // If using file, we cannot upload here without backend; widget expects host to provide a URL. Enforce URL preview success.
      if (!coinData.imageUrl) {
        if (!coinData.file) { alert('Provide an image URL (recommended) or wire upload in host app'); setPublishing(false); return; }
      }

      // Ensure we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('This feature requires a browser environment');
      }

      // Set up all possible global references for TextEncoder before loading SDK
      const setupTextEncoder = () => {
        const TE = window.TextEncoder;
        const TD = window.TextDecoder;
        
        // Set on every possible global object
        if (typeof global !== 'undefined') {
          (global as any).TextEncoder = TE;
          (global as any).TextDecoder = TD;
        }
        if (typeof globalThis !== 'undefined') {
          (globalThis as any).TextEncoder = TE;
          (globalThis as any).TextDecoder = TD;
        }
        // Also try setting on window itself
        (window as any).global = window;
      };
      
      setupTextEncoder();
      
      // Log the actual error to understand what's happening
      let kappa: any;
      try {
        console.log('Before import - TextEncoder available?', typeof window.TextEncoder);
        const kappaMod = await import('../../kappa.js');
        console.log('After import - module loaded');
        kappa = kappaMod.default || kappaMod;
        
        // Set network config if needed
        if (kappa.setNetworkConfig && props.network) {
          console.log('Setting network config...');
          kappa.setNetworkConfig(props.network);
        }
      } catch (e: any) {
        console.error('Failed to load SDK - Full error:', e);
        console.error('Error stack:', e.stack);
        
        // Check if it's specifically a TextEncoder error
        if (e.message && e.message.includes('TextEncoder')) {
          throw new Error('TextEncoder issue: The SDK requires TextEncoder which is not available in the current environment. This is a known issue with Next.js bundling. Please try refreshing the page.');
        }
        
        throw new Error('Failed to load SDK modules: ' + e.message);
      }
      
      console.log('About to call createCoinWeb3...');
      
      // Ensure TextEncoder is available in the global scope before SDK calls
      if (typeof window !== 'undefined') {
        // Force TextEncoder into the global scope that eval will use
        const originalTextEncoder = window.TextEncoder;
        const originalTextDecoder = window.TextDecoder;
        
        // Override global TextEncoder temporarily
        (window as any).TextEncoder = originalTextEncoder;
        (window as any).TextDecoder = originalTextDecoder;
        (globalThis as any).TextEncoder = originalTextEncoder;
        (globalThis as any).TextDecoder = originalTextDecoder;
        
        // Also try to set it on the window's global property
        if (!(window as any).global) {
          (window as any).global = window;
        }
        (window as any).global.TextEncoder = originalTextEncoder;
        (window as any).global.TextDecoder = originalTextDecoder;
      }
      
      // Create coin using the SDK
      const publishRes = await kappa.createCoinWeb3(
        {
          address: account.address,
          signAndExecuteTransaction: (args: any) => signAndExecute(args),
        },
        {
          name: coinMetadata.name,
          symbol: coinMetadata.symbol,
          description: coinMetadata.description,
          icon: coinMetadata.icon,
        }
      );
      
      console.log('publishRes:', publishRes);
      
      if (!publishRes?.success) { throw new Error(publishRes?.error || 'Publish failed'); }
      
      // If we need to fetch transaction details, do it now
      publishedObject = publishRes.publishedObject;
      treasuryCapObject = publishRes.treasuryCapObject;
      coinMetadataObject = publishRes.coinMetadataObject;
      
      if (publishRes.needsFetch && publishRes.digest) {
        setStatus('Fetching transaction details…');
        
        try {
          // Use the Sui SDK to fetch transaction details
          console.log('Importing SuiClient...');
          const { SuiClient } = await import('@mysten/sui/client');
          console.log('Creating SuiClient...');
          const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
          
          console.log('Fetching transaction details for digest:', publishRes.digest);
          
          // Retry logic for fetching transaction details
          let txDetails = null;
          let retries = 5;
          let delay = 2000; // Start with 2 second delay
          
          while (retries > 0 && !txDetails) {
            try {
              txDetails = await client.getTransactionBlock({
                digest: publishRes.digest,
                options: {
                  showObjectChanges: true,
                  showEffects: true,
                }
              });
              console.log('Successfully fetched transaction details');
            } catch (fetchError: any) {
              if (fetchError.message?.includes('Could not find')) {
                console.log(`Transaction not yet indexed, retrying in ${delay/1000}s... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retries--;
                delay = Math.min(delay * 1.5, 5000); // Increase delay up to 5 seconds
              } else {
                throw fetchError; // Re-throw if it's not a "not found" error
              }
            }
          }
          
          if (!txDetails) {
            throw new Error('Transaction not found after multiple retries. It may take longer to be indexed.');
          }
          
          console.log('Transaction details:', txDetails);
          
          // Extract the created objects
          const objectChanges = txDetails.objectChanges || [];
          publishedObject = objectChanges.find((item: any) => item?.type === "published");
          treasuryCapObject = objectChanges.find((item: any) => 
            item?.objectType?.includes("TreasuryCap")
          );
          coinMetadataObject = objectChanges.find((item: any) => 
            item?.objectType?.includes("CoinMetadata")
          );
          
          console.log('Extracted objects:', { publishedObject, treasuryCapObject, coinMetadataObject });
          console.log('publishedObject structure:', JSON.stringify(publishedObject, null, 2));
          
          // Store the publishedObject in publishRes for later use
          if (publishedObject) {
            publishRes.publishedObject = publishedObject;
          }
        } catch (e: any) {
          console.error('Failed to fetch transaction details:', e);
          console.error('Error message:', e.message);
          console.error('Error stack:', e.stack);
          
          // Provide a more specific error message
          if (e.message?.includes('Cannot find module')) {
            throw new Error('Sui SDK not available. Please ensure @mysten/sui is installed.');
          } else if (e.message?.includes('fetch')) {
            throw new Error('Network error fetching transaction details. Please try again.');
          } else {
            throw new Error(`Failed to fetch transaction details: ${e.message || 'Unknown error'}`);
          }
        }
      }
      
      if (!publishedObject || !treasuryCapObject || !coinMetadataObject) {
        throw new Error('Failed to extract coin objects from transaction');
      }

      setStatus('Creating bonding curve…');
      
      // Create bonding curve using the SDK
      console.log('Creating curve with objects:', { publishedObject, treasuryCapObject, coinMetadataObject });
      console.log('Creating curve with maxTx (hasMaxBuy):', coinData.hasMaxBuy);
      
      const curveRes = await kappa.createCurveWeb3(
        {
          address: account.address,
          signAndExecuteTransaction: (args: any) => signAndExecute(args),
        },
        {
          publishedObject: publishedObject,
          treasuryCapObject: treasuryCapObject,
          coinMetadataObject: coinMetadataObject,
          name: coinMetadata.name,
          description: coinMetadata.description || '',
          bondingContract: network.bondingContract,
          CONFIG: network.CONFIG,
          globalPauseStatusObjectId: network.globalPauseStatusObjectId,
          poolsId: network.poolsId,
          moduleName: network.moduleName,
          website: coinMetadata.website || '',
          telegram: coinMetadata.telegram || '',
          twitter: coinMetadata.twitter || '',
          tags: coinMetadata.tags || [],
          maxTx: coinData.hasMaxBuy ? 'true' : 'false',
        }
      );
      
      console.log('curveRes:', curveRes);
      if (!curveRes?.success) throw new Error(`Curve creation failed: ${curveRes?.error || 'Unknown error'}`);

      // Add a small delay to ensure curve is fully initialized
      setStatus('Preparing first buy…');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      setStatus('Executing first buy…');
      const devBuyNum = Number(devBuy) || 0;
      
      // Enforce minimum 0.1 SUI for first buy
      if (devBuyNum < 0.1) {
        throw new Error('Minimum dev buy is 0.1 SUI');
      }
      
      const suiAmount = Math.floor(devBuyNum * 1e9);
      
      // Execute first buy using the SDK
      // Import firstBuyMath from math module
      const math = await import('../../math.js');
      
      // Calculate expected tokens
      const expectedTokens = math.firstBuyMath(Number(devBuy) * 1e9); // Full calculation
      
      // The partner module has a max transaction limit of 0.01 tokens (10000000000000000 in smallest units)
      // We need to ensure min_tokens doesn't exceed this limit
      const maxAllowedTokens = 10000000000000000; // 0.01 tokens in smallest units
      
      // Use the smaller of expected tokens with 90% slippage or max allowed
      const minTokens = Math.floor(Math.min(expectedTokens * 0.9, maxAllowedTokens));
      
      console.log('Executing first buy:');
      console.log('  Dev buy input:', devBuy);
      console.log('  SUI amount (MIST):', suiAmount);
      console.log('  SUI amount (SUI):', suiAmount / 1e9);
      console.log('  Expected tokens (calculation):', expectedTokens);
      console.log('  Expected tokens (formatted):', (expectedTokens / 1e9).toFixed(2));
      console.log('  Max allowed tokens (partner limit):', maxAllowedTokens);
      console.log('  Min tokens (with limit applied):', minTokens);
      console.log('  Min tokens (formatted):', (minTokens / 1e9).toFixed(6));
      
      console.log('Passing to SDK:', {
        sui: suiAmount,
        min_tokens: minTokens,
        name: coinMetadata.name,
      });
      
      const fbRes = await kappa.firstBuyWeb3(
        {
          address: account.address,
          signAndExecuteTransaction: (args: any) => signAndExecute(args),
        },
        {
          publishedObject: publishedObject,
          name: coinMetadata.name,
          sui: suiAmount,
          min_tokens: minTokens,
          bondingContract: network.bondingContract,
          CONFIG: network.CONFIG,
          moduleName: network.moduleName,
        }
      );
      
      console.log('fbRes:', fbRes);
      
      // Check if the transaction succeeded (even with warnings)
      if (!fbRes?.success && !fbRes?.digest) { 
        throw new Error(`First buy failed: ${fbRes?.error || 'Unknown error'}`); 
      }

      // Get the packageId from either publishedObject or the original publishRes
      console.log('Looking for packageId in:', { 
        publishedObject, 
        publishRes,
        'publishRes.publishedObject': publishRes?.publishedObject 
      });
      
      const packageId = publishedObject?.packageId || publishRes?.publishedObject?.packageId || publishRes?.packageId;
      if (!packageId) {
        console.error('Could not find packageId in any of these:', {
          'publishedObject?.packageId': publishedObject?.packageId,
          'publishRes?.publishedObject?.packageId': publishRes?.publishedObject?.packageId,
          'publishRes?.packageId': publishRes?.packageId,
          fullPublishedObject: publishedObject,
          fullPublishRes: publishRes
        });
        throw new Error('Failed to get package ID from published object');
      }
      
      console.log('Successfully found packageId:', packageId);
      
      const coinAddress = `${packageId}::${coinMetadata.name.replaceAll(' ', '_')}::${coinMetadata.name.replaceAll(' ', '_').toUpperCase()}`;
      setStatus('Success');
      
      // Show success modal
      setShowSuccessModal(true);
      setSuccessCoinAddress(coinAddress);
      
      if (props.onSuccess) props.onSuccess(coinAddress);
    } catch (e: any) {
      alert('Failed: ' + (e?.message || String(e)));
    } finally {
      setPublishing(false);
    }
  };

  const disabled = !account || !isFormValid || publishing || !devBuy || Number(devBuy) < 0.1 || !!devBuyError;
  
  // Apply theme
  const themeVars = { ...defaultTheme, ...(theme || {}) } as Record<string, string>;

  return (
    <div className="kappa-root" style={{ width: '100%', maxWidth: (props.maxWidth ?? 500), background: 'var(--kappa-bg)', borderRadius: 16, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.45)', border: '1px solid var(--kappa-border)', position: 'relative', overflow: 'hidden', color: 'var(--kappa-text)', boxSizing: 'border-box', ...themeVars as any, fontFamily: 'ui-sans-serif, -apple-system, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, \'Noto Sans\', \'Liberation Sans\', sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\'' }}>
      <style>{`
        .kappa-root input, .kappa-root button, .kappa-root select, .kappa-root textarea { font-family: inherit !important; }
        /* Prevent iOS auto-zoom on inputs */
        .kappa-root input, .kappa-root select, .kappa-root textarea { font-size: 16px; }
        .kappa-root label, .kappa-root span, .kappa-root p, .kappa-root div { font-family: inherit !important; }
        @media (max-width: 500px) {
          .kappa-root { box-sizing: border-box; width: calc(100vw - 10px) !important; max-width: none !important; margin-left: 5px !important; margin-right: 5px !important; }
        }
        @media (max-width: 480px) {
          .kappa-root { padding: 16px !important; border-radius: 12px !important; }
        }
        @media (max-width: 320px) {
          .kappa-root { padding: 12px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={props.logoUrl || DEFAULT_LOGO_DATA} alt="logo" style={{ width: 22, height: 22, borderRadius: 4 }} />
          <div style={{ width: 1, height: 16, background: 'var(--kappa-border)', opacity: 0.8 }} />
          <div className="kappa-header-name" style={{ color: 'var(--kappa-text)', fontWeight: 700 }}>{props.projectName || 'Kappa Deployer'}</div>
        </div>
        <WalletControls />
      </div>

      <div style={{ background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--kappa-text)', fontSize: 14, fontWeight: 600 }}>Token Information</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Name</label>
          <input style={input} value={toDisplayName(coinData.name)} maxLength={32} onChange={(e) => setCoinData((s:any)=>({ ...s, name: e.target.value.toLowerCase() }))} />
          {errors?.nameTickerDuplicate && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>Name cannot be identical lettering and casing as the Ticker.</div>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Ticker</label>
          <input style={input} value={toDisplayTicker(coinData.ticker)} maxLength={12} onChange={(e) => { const v=e.target.value; if (!/^[A-Za-z0-9]*$/.test(v)) return; setCoinData((s:any)=>({ ...s, ticker: v.toLowerCase() })); }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Token Image URL (recommended)</label>
          <input style={input} placeholder="https://…" value={coinData.imageUrl} onChange={(e)=>{const v=e.target.value.trim(); setCoinData((s:any)=>({ ...s, imageUrl: v, file: v? null : s.file })); setPreviewUrl(v); setFileError(false); setFileSizeError(false);}} />
          {previewUrl && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid #2a2f3a', background: '#0b0d12', display: 'grid', placeItems: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onLoad={()=>setIsImagePreviewValid(true)} onError={()=>setIsImagePreviewValid(false)} />
              </div>
              {coinData.imageUrl && (isImagePreviewValid===false) && <span style={{ color: '#f87171', fontSize: 12 }}>Invalid image URL</span>}
            </div>
          )}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Description (2-256 chars)</label>
          <textarea style={textArea} maxLength={256} value={coinData.description} onChange={(e)=>setCoinData((s:any)=>({ ...s, description: e.target.value }))} />
          {errors?.uniqueness && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>Description must be different from name and ticker.</div>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Twitter (optional)</label>
          <input style={input} placeholder="https://twitter.com/username" value={coinData.twitterLink} onChange={(e)=>setCoinData((s:any)=>({ ...s, twitterLink: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Telegram (optional)</label>
          <input style={input} placeholder="https://t.me/username" value={coinData.telegramLink} onChange={(e)=>setCoinData((s:any)=>({ ...s, telegramLink: e.target.value }))} />
        </div>
        <div style={{ marginTop: 4, marginBottom: 14 }}>
          <label style={label}>Website (optional)</label>
          <input style={input} placeholder="https://example.com" value={coinData.websiteLink} onChange={(e)=>setCoinData((s:any)=>({ ...s, websiteLink: e.target.value }))} />
        </div>
        {/* Optional: Tags */}
        <div style={{ marginTop: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={label}>Tags (optional)</label>
            <div style={{ fontSize: 11, color: 'var(--kappa-text)', border: '1px solid var(--kappa-border)', background: 'var(--kappa-input-bg)', borderRadius: 6, padding: '2px 6px' }}>{tags.length}/4 used</div>
          </div>
          <input
            style={{ ...input, paddingRight: 76 }}
            placeholder="Type a tag and press Enter"
            value={tagInput}
            maxLength={12}
            onChange={(e)=>setTagInput(e.target.value)}
            onKeyDown={(e)=>{
              if (e.key === 'Enter') {
                e.preventDefault();
                const v = (tagInput || '').trim().toLowerCase();
                if (!v) return;
                if (v.length > 12) return;
                if (tags.length >= 4) return;
                if (tags.includes(v)) return;
                const next = [...tags, v];
                setTags(next);
                setCoinData((s:any)=>({ ...s, tags: next }));
                setTagInput('');
              }
            }}
            disabled={tags.length >= 4}
          />
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {tags.map((t, i) => (
                <span key={t+String(i)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--kappa-border)', background: 'var(--kappa-input-bg)', color: 'var(--kappa-text)', fontSize: 12 }}>
                  #{t}
                  <button
                    type="button"
                    onClick={()=>{
                      const next = tags.filter(x => x !== t);
                      setTags(next);
                      setCoinData((s:any)=>({ ...s, tags: next }));
                    }}
                    style={{ border: 'none', background: 'transparent', color: 'var(--kappa-muted)', cursor: 'pointer', fontSize: 14 }}
                    title="Remove"
                  >×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Optional: Max Buy Toggle */}
        <div style={{ marginTop: 6, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--kappa-border)', background: 'var(--kappa-bg)', borderRadius: 10, padding: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: '#e5e7eb', marginBottom: 2 }}>Enable Max Buy Limit</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Prevents large single purchases</div>
            </div>
            <button
              type="button"
              onClick={()=>setCoinData((s:any)=>({ ...s, hasMaxBuy: !s.hasMaxBuy }))}
              style={{ position: 'relative', width: 48, height: 26, borderRadius: 26, border: `2px solid ${coinData.hasMaxBuy ? '#2563eb' : '#4A4A4A'}`, background: coinData.hasMaxBuy ? '#2563eb' : '#2A2A2A', cursor: 'pointer' }}
              aria-pressed={coinData.hasMaxBuy}
            >
              <span style={{ position: 'absolute', top: 1, left: coinData.hasMaxBuy ? 24 : 2, width: 20, height: 20, borderRadius: 20, background: '#fff', transition: 'left 160ms ease' }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--kappa-text)', fontSize: 14, fontWeight: 600 }}>Initial Purchase</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={label}>Dev Buy Amount (SUI) - Minimum 0.1 SUI</label>
            <input 
              style={{...input, borderColor: devBuyError ? '#f87171' : 'var(--kappa-border)'}} 
              type="number" 
              min={0.1}
              step={0.1}
              value={devBuy} 
              onChange={(e) => {
                const value = e.target.value;
                setDevBuy(value);
                // Validate minimum 0.1 SUI
                if (value && Number(value) < 0.1) {
                  setDevBuyError('Minimum dev buy is 0.1 SUI');
                } else {
                  setDevBuyError('');
                }
              }} 
            />
            {devBuyError && (
              <div style={{ marginTop: 4, fontSize: 12, color: '#f87171' }}>{devBuyError}</div>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginLeft: 16, marginTop: 20 }}>Free + gas only</div>
        </div>
        {/* Quote preview */}
        <DevBuyQuotePreview devBuy={devBuy} />
      </div>

      <button style={{ ...btn, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer', marginTop: 8 }} disabled={disabled} onClick={publishAndCreate}>
        {publishing ? 'Processing…' : 'Create coin'}
      </button>
      {status && <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>{status}</div>}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 4, position: 'relative', zIndex: 100 }}>
        <span style={{ color: 'var(--kappa-muted)', fontSize: 12 }}>Powered by</span>
        <a href="https://kappa.meme" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--kappa-accent)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 101 }}>Kappa</a>
      </div>
      
      {/* Success Modal - Similar to TransactionModal in Widget.tsx */}
      {showSuccessModal && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'rgba(0,0,0,0.35)', 
          display: 'grid', 
          placeItems: 'center', 
          zIndex: 50, 
          backdropFilter: 'blur(6px)', 
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 16
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: 360, 
            background: 'var(--kappa-panel)', 
            border: '1px solid var(--kappa-border)', 
            borderRadius: 12, 
            padding: 16, 
            color: 'var(--kappa-text)', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)' 
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, textAlign: 'center' }}>
              🎉 Congratulations!
            </h3>
            
            <p style={{ 
              fontSize: 14, 
              color: 'var(--kappa-accent)', 
              marginBottom: 16, 
              textAlign: 'center', 
              fontWeight: 500 
            }}>
              You just launched a token!
            </p>
            
            <div style={{ 
              fontSize: 13, 
              marginBottom: 16, 
              padding: 12, 
              background: 'var(--kappa-input-bg)', 
              border: '1px solid var(--kappa-border)', 
              borderRadius: 8 
            }}>
              <span style={{ color: 'var(--kappa-muted)', display: 'block', marginBottom: 6 }}>
                Contract Address:
              </span>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: 11, 
                wordBreak: 'break-all', 
                color: 'var(--kappa-text)' 
              }}>
                {successCoinAddress}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: 12 
            }}>
              <a 
                href={`https://kappa.fun/coin/${successCoinAddress}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  flex: 1,
                  padding: '8px 16px', 
                  borderRadius: 8, 
                  background: 'var(--kappa-primary)', 
                  color: 'var(--kappa-text-on-primary)', 
                  textDecoration: 'none', 
                  fontSize: 13, 
                  fontWeight: 600,
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                View on Kappa
              </a>
              
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form
                  setCoinData({
                    name: '',
                    ticker: '',
                    file: null,
                    imageUrl: '',
                    description: '',
                    tags: [],
                    twitterLink: '',
                    telegramLink: '',
                    websiteLink: '',
                    hasMaxBuy: false,
                  });
                  setTags([]);
                  setTagInput('');
                  setDevBuy(props.defaultDevBuySui || '5');
                  setStatus('');
                  setFileName('No file chosen');
                  setPreviewUrl(null);
                  setIsImagePreviewValid(null);
                }} 
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: 8, 
                  border: '1px solid var(--kappa-border)', 
                  background: 'var(--kappa-panel)', 
                  color: 'var(--kappa-text)', 
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Common props interface for all DeployerWidget variants
export interface DeployerWidgetProps {
  network?: ModuleConfig;
  onSuccess?: (coinAddress: string) => void;
  defaultDevBuySui?: string;
  theme?: Partial<Record<keyof typeof defaultTheme, string>>;
  maxWidth?: number;
  logoUrl?: string;
  projectName?: string;
}

export function DeployerWidgetEmbedded(props: DeployerWidgetProps) {
  return <DeployerInner {...props} />;
}

export function DeployerWidgetStandalone(props: DeployerWidgetProps) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <DeployerInner {...props} />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

// Integrated version: assumes host app has dapp-kit providers already in place
export function DeployerWidgetIntegrated(props: DeployerWidgetProps) {
  return <DeployerInner {...props} />;
}

// Default export for convenience
export default DeployerWidgetStandalone;
