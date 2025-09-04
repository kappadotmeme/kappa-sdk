// @ts-nocheck
"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig, SuiClientProvider, WalletProvider, useConnectWallet, useCurrentAccount, useDisconnectWallet, useSignAndExecuteTransaction, useSuiClient, useWallets } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Default API base URL for Kappa API
const DEFAULT_API_BASE = 'https://api.kappa.fun';

// Default Kappa logo as data URI - same as Widget.tsx
const defaultLogoDataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.1268 21.8877C13.7496 26.7985 8.64625 34.9674 7.14173 38.4375C9.30824 36.7042 13.3404 35.107 15.0856 34.5257C8.44164 42.5177 6.5002 50.6145 6.35938 53.6633C8.52589 50.582 11.234 48.7284 12.3173 48.1868C8.80272 57.1417 10.4914 65.0772 11.7757 67.9261C12.0164 66.1929 13.4403 63.5125 14.1227 62.3895C14.6523 64.9893 16.4301 68.0862 17.2521 69.3103L19.4788 66.1207C17.9863 63.9061 17.7733 60.0629 17.8539 58.4176C14.9171 53.9401 16.3097 47.5645 17.3725 44.937C18.3354 40.1225 22.1063 35.9905 23.872 34.5257C24.333 36.9329 26.3154 42.3011 30.5521 44.5157C30.2151 42.59 31.3742 39.2198 31.9965 37.7755C33.3 39.9624 37.3405 44.7204 43.0698 46.261C41.9624 43.6612 42.6088 39.5207 43.0698 37.7755C45.0353 39.5412 49.9906 43.1436 54.0829 43.4325C53.0237 42.3733 52.1968 38.9394 51.9164 37.3542C53.7218 38.8383 58.6567 41.928 63.9526 42.4094C62.3157 40.3873 61.0242 37.2736 60.5824 35.97C67.2746 38.8106 70.954 45.2981 71.9567 48.1868C75.4231 60.0304 71.5956 67.7251 69.2485 70.0927C71.6076 69.9964 75.0463 66.5215 76.4702 64.7967C76.6628 80.1068 65.4715 87.1034 59.8519 88.6886C58.9154 90.2316 57.8731 91.4942 57.2725 92.1189C66.5644 91.2042 73.7825 84.0751 76.2295 80.6243C76.2776 82.0205 75.5675 84.0546 75.2064 84.8972C81.7541 81.3826 84.3539 72.8008 84.8354 68.9492C85.3566 70.3731 86.4001 73.8961 86.4001 76.5922C91.0701 69.7075 90.5129 60.3638 89.6499 56.5519C90.6128 57.4342 92.8996 60.0063 94.344 63.232C95.8365 52.4957 89.2286 41.266 85.7381 36.9931C87.8649 37.8561 92.4423 39.8818 93.7422 41.0854C90.3239 31.9861 81.8865 24.6957 78.0951 22.1886C80.7431 17.3741 78.4562 10.7542 67.8042 7.74515C59.2825 5.33791 51.6155 5.01654 48.8472 5.15737C21.212 6.98687 19.5186 17.0732 22.1268 21.8877Z" fill="#141315"/><path d="M25.1361 59.6815C16.3738 58.3334 17.0322 51.3368 18.4561 48.0063L25.3167 51.3765C23.102 55.2762 25.236 57.5751 26.5805 58.2371L25.1361 59.6815Z" fill="#D9D9D9"/><path d="M51.4349 62.5098C44.4539 62.5098 42.6689 57.2139 42.6484 54.5659L53.5412 51.5569C53.1199 52.3597 52.5542 54.5058 53.6616 56.6723C55.0457 59.3804 58.7168 58.7786 58.9575 58.7786C56.6465 62.0525 52.9791 62.6302 51.4349 62.5098Z" fill="#D9D9D9"/><path d="M58.5963 52.219C58.163 51.3043 58.7768 50.5544 59.1379 50.2932C61.0035 49.3905 61.3044 51.1358 61.3646 51.557C61.4248 51.9783 61.2443 52.9412 60.823 53.1819C60.4017 53.4227 59.1379 53.3625 58.5963 52.219Z" fill="#D9D9D9"/><path d="M17.6053 68.3475L14.4157 54.1448H12.9714L15.1981 33.9842L24.1048 29.0493H58.4682L73.8143 42.59L78.3279 59.6814L76.2216 75.7498L65.6297 87.1842L55.399 90.7348C41.8582 97.4751 35.3587 92.4801 29.5211 90.7348C23.6836 88.9896 25.6695 86.1009 23.3225 85.5593C20.9754 85.0176 14.4157 91.9385 12.9714 91.6375C11.527 91.3366 11.527 87.5452 11.8881 82.9113C12.177 79.2042 15.8203 71.6575 17.6053 68.3475Z" fill="#145D87" stroke="black" stroke-width="0.081103"/><path d="M33.3814 47.2239C31.5038 49.1497 31.1547 51.1958 31.2149 51.9782C26.3318 49.1376 19.9129 46.1009 17.3131 44.937C14.6651 52.1587 16.0493 55.8298 17.8547 58.4777C19.299 60.5961 22.0674 61.4471 23.271 61.6071L45.1167 62.9311C49.1609 65.531 53.6624 64.8966 55.4076 64.2551C64.1218 60.7887 64.3746 52.9808 63.4117 49.5108L66.9022 48.6682C64.0737 46.261 59.3194 47.8859 57.0325 48.247C54.7456 48.6081 43.3113 52.2791 40.904 52.5198C38.9782 52.7124 37.8553 50.1932 37.5339 48.909C36.0895 54.2049 38.9385 55.4085 40.5429 55.3483C40.6874 57.7074 41.6057 59.4202 42.0475 59.9823C41.2254 59.1602 39.4236 57.3343 38.7977 56.6121C38.1718 55.89 37.0127 55.3483 36.5108 55.1678C32.3704 53.8679 32.6989 49.3302 33.3814 47.2239Z" fill="black"/><path d="M25.1361 59.8018C16.3738 58.4538 17.0322 51.4571 18.4561 48.1267L25.3167 51.4968C23.102 55.3966 25.236 57.6955 26.5805 58.3575L25.1361 59.8018Z" fill="#D9FFE2"/><path d="M51.4349 62.6302C44.4539 62.6302 42.6689 57.3343 42.6484 54.6863L53.5412 51.6772C53.1199 52.4801 52.5542 54.6261 53.6616 56.7926C55.0457 59.5008 58.7168 58.899 58.9575 58.899C56.6465 62.1728 52.9791 62.7505 51.4349 62.6302Z" fill="#D9FFE2"/><path d="M58.5963 52.3394C58.163 51.4247 58.7768 50.6748 59.1379 50.4136C61.0035 49.5109 61.3044 51.2561 61.3646 51.6774C61.4248 52.0987 61.2443 53.0616 60.823 53.3023C60.4017 53.543 59.1379 53.4828 58.5963 52.3394Z" fill="#D9D9D9"/><path d="M61.5451 85.0694C53.1535 95.6661 36.2607 95.6661 25.7266 86.0347C20.2321 81.0108 59.6855 63.8123 64.8334 67.5724C69.6058 71.0581 61.5439 85.0694 61.5439 85.0694H61.5451Z" fill="#228399"/><path d="M33.5007 56.3715C29.5528 56.1308 21.6197 67.3834 18.6179 71.4781C12.0209 80.4764 14.2427 90.1246 14.2427 90.1246C27.3441 82.2662 56.2033 82.0435 61.8844 67.5194C60.4473 67.1294 58.1002 67.1487 57.0314 67.6771C53.6878 67.9876 54.3233 66.8105 49.7495 67.0247C47.5963 67.1258 42.2269 62.812 42.2269 62.812C40.9631 60.7659 37.4485 56.6134 33.5007 56.3727V56.3715Z" fill="#228399"/><path d="M29.4102 68.8808C31.7693 66.6661 33.2016 66.3929 33.6228 66.5337C33.8238 67.0356 34.4894 67.6049 35.5486 65.8717C36.6078 64.1385 35.669 63.3441 35.0672 63.1636C31.697 63.1636 29.8916 66.9754 29.4102 68.8808Z" fill="#141315"/><path d="M29.0485 42.9836C25.6182 43.0438 21.5259 36.1831 21.4657 35.9424L21.2852 33.1741L27.7245 33.9564L49.51 35.2202L57.6345 37.2664C58.8586 38.6505 61.3055 41.455 61.3055 41.5994C55.5281 41.455 52.1183 39.2524 51.1349 38.1691L53.4218 42.9836C50.5813 43.8983 44.5355 41.5597 41.8671 40.2754C41.8069 41.8606 41.6865 45.114 41.6865 45.451C34.7055 44.6807 30.9948 40.6365 30.0114 38.7107C29.69 39.8939 29.0485 42.4058 29.0485 42.9836Z" fill="black" fill-opacity="0.2"/><path d="M62.6298 36.7847L62.4492 34.0164H62.6298C70.4533 35.9421 82.0682 54.839 80.8646 64.1069C79.7632 72.5875 72.5645 79.6669 71.1189 81.03C71.0373 81.1158 70.9559 81.1921 70.8746 81.2584C70.9001 81.2339 70.9847 81.1566 71.1189 81.03C73.4052 78.6284 75.7824 68.8523 76.7121 64.1069C73.9197 68.3436 70.1724 70.4058 68.6479 70.9073C76.5918 54.7307 67.9457 41.4186 62.6298 36.7847Z" fill="#104A6C"/><path d="M44.1778 81.6197C40.9473 82.3214 29.1579 84.973 25.4375 86.2537L26.8818 87.2767L28.0855 88.2396C41.0364 86.699 53.5528 78.6612 58.147 74.9504C55.1645 77.5683 47.8645 80.8181 44.1778 81.6197Z" fill="black" fill-opacity="0.43"/><path d="M7.14173 38.5253C8.64625 35.0553 13.7496 26.8863 22.1268 21.9756C19.5186 17.1611 21.212 7.07476 48.8472 5.24526C51.6155 5.10443 59.2825 5.4258 67.8042 7.83304C78.4562 10.8421 80.7431 17.462 78.0951 22.2765C81.8865 24.7836 90.3239 32.0739 93.7422 41.1733C92.4423 39.9697 87.8649 37.944 85.7381 37.081C89.2286 41.3538 95.8365 52.5836 94.344 63.3199C92.8996 60.0942 90.6128 57.5221 89.6499 56.6398C90.5129 60.4517 91.0701 69.7954 86.4001 76.6801C86.4001 73.984 85.3566 70.461 84.8354 69.0371C84.3539 72.8887 81.7541 81.4705 75.2064 84.9851C75.5675 84.1425 76.2776 82.1084 76.2295 80.7122C73.8355 84.0872 66.875 90.9839 57.8743 92.1382C57.5373 92.1851 56.0484 92.6076 55.3467 92.8122L59.0779 88.8403L59.8519 88.7753C65.4715 87.1901 76.6628 80.1935 76.4702 64.8834C75.0463 66.6082 71.6076 70.0831 69.2485 70.1793C71.5956 67.8118 75.4231 60.1171 71.9567 48.2735C70.954 45.3848 67.2746 38.8973 60.5824 36.0567C61.0242 37.3602 62.3157 40.474 63.9526 42.4961C58.6567 42.0146 53.7218 38.9249 51.9164 37.4409C52.1968 39.0261 53.0237 42.46 54.0829 43.5192C49.9906 43.2303 45.0353 39.6279 43.0698 37.8622C42.6088 39.6074 41.9624 43.7479 43.0698 46.3477C37.3405 44.807 33.3 40.0491 31.9965 37.8622C31.3742 39.3065 30.2151 42.6766 30.5521 44.6024C26.3154 42.3878 24.333 37.0196 23.872 34.6124C22.1063 36.0772 18.3354 40.2092 17.3725 45.0237C16.3097 47.6512 14.9171 54.0268 17.8539 58.5042C17.7733 60.1496 17.9863 63.9927 19.4788 66.2074L17.2521 69.397C16.4301 68.1729 14.6523 65.076 14.1227 62.4762C13.4403 63.5992 12.0164 66.2796 11.7757 68.0128C10.4914 65.1639 8.80272 57.2284 12.3173 48.2735C11.234 48.8151 8.52589 50.6687 6.35938 53.7499C6.5002 50.7012 8.44164 42.6044 15.0856 34.6124C13.3404 35.1937 9.30824 36.7909 7.14173 38.5241V38.5253Z" fill="black"/><path d="M50.4113 29.0494C63.972 29.0494 74.9651 24.3881 74.9651 18.6381C74.9651 12.8881 63.972 8.22681 50.4113 8.22681C36.8506 8.22681 25.8574 12.8881 25.8574 18.6381C25.8574 24.3881 36.8506 29.0494 50.4113 29.0494Z" fill="#093659"/><path d="M50.352 25.679C61.4864 25.679 70.5127 22.4996 70.5127 18.5777C70.5127 14.6557 61.4864 11.4763 50.352 11.4763C39.2176 11.4763 30.1914 14.6557 30.1914 18.5777C30.1914 22.4996 39.2176 25.679 50.352 25.679Z" fill="#151011"/><path d="M50.4117 25.6793C60.9146 25.6793 69.4289 22.9579 69.4289 19.601C69.4289 16.244 60.9146 13.5227 50.4117 13.5227C39.9088 13.5227 31.3945 16.244 31.3945 19.601C31.3945 22.9579 39.9088 25.6793 50.4117 25.6793Z" fill="#228399"/><path d="M34.584 19.5408C36.8107 23.6331 58.2351 27.0032 66.3595 19.5408C54.203 24.8367 39.4791 21.7277 34.584 19.5408Z" fill="#31B0B0"/><path d="M26.4598 58.3489C30.841 53.9196 35.1054 54.4166 36.6906 55.2195C38.7969 55.7009 45.2965 65.5706 52.7589 67.1353C46.6494 68.2186 42.1671 63.9457 40.0006 61.4181C37.834 58.8905 36.9313 57.4462 33.6214 57.0851C30.3114 56.724 23.3304 63.7652 17.7938 72.7923C13.3645 80.014 13.5811 87.3561 14.2431 90.1244C23.2702 83.2036 25.7377 83.2638 42.468 79.4122C55.8522 76.3309 60.4019 70.1443 61.0037 67.4362C60.3297 67.2436 58.0753 67.5168 57.0318 67.6769C59.1502 65.0771 62.2073 64.7485 63.4711 64.9086C65.6172 65.1493 69.1763 67.1112 66.2395 73.033C67.0579 68.9889 64.7349 67.7768 63.4711 67.6769C62.2073 73.8756 52.7589 79.8937 42.468 82.1805C32.177 84.4674 26.2191 86.2127 26.0386 86.333C30.2272 90.4253 36.7712 92.2103 39.5191 92.5919C49.5332 94.9028 58.3762 88.5393 61.5454 85.0692C59.6677 89.5467 57.914 91.5892 57.2725 92.0502C42.3476 100.379 28.4253 92.3909 23.3304 87.3561C20.201 88.1385 16.2892 91.629 14.8449 92.5919C13.4006 93.5548 9.66934 92.2308 12.0164 81.6389C14.3635 71.0471 20.9834 63.8855 26.4598 58.3489Z" fill="black"/></svg>');

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const defaultTheme = {
  // Base colors
  '--kappa-bg': '#0f1218',
  '--kappa-panel': '#1a1d26',
  '--kappa-input-bg': '#0b0d12',
  '--kappa-border': '#2a2f3a',
  '--kappa-text': '#e5e7eb',
  '--kappa-muted': '#9ca3af',
  '--kappa-accent': '#7aa6cc',
  '--kappa-primary': '#2563eb',
  '--kappa-text-on-primary': '#ffffff',
  '--kappa-success': '#10b981',
  '--kappa-error': '#f87171',
  '--kappa-warning': '#f59e0b',
  
  // Component specific
  '--kappa-chip-bg': '#151c26',
  '--kappa-chip-border': '#274057',
  '--kappa-status-ok-bg': '#151c26',
  '--kappa-status-ok-border': '#274057',
  '--kappa-status-err-bg': '#2a1515',
  '--kappa-status-err-border': '#7f1d1d',
  '--kappa-tab-active-bg': '#0f172a',
  '--kappa-avatar-bg': '#233B53',
  '--kappa-modal-bg': 'rgba(0, 0, 0, 0.75)',
  
  // Button variants
  '--kappa-button-primary-bg': '#2563eb',
  '--kappa-button-primary-hover': '#1d4ed8',
  '--kappa-button-primary-text': '#ffffff',
  '--kappa-button-secondary-bg': '#151c26',
  '--kappa-button-secondary-hover': '#1a2332',
  '--kappa-button-secondary-text': '#e5e7eb',
  '--kappa-button-danger-bg': '#ef4444',
  '--kappa-button-danger-hover': '#dc2626',
  '--kappa-button-danger-text': '#ffffff',
  
  // Quick select buttons
  '--kappa-quick-bg': 'var(--kappa-chip-bg)',
  '--kappa-quick-border': 'var(--kappa-chip-border)',
  '--kappa-quick-text': 'var(--kappa-accent)',
  '--kappa-quick-hover-bg': 'rgba(37, 99, 235, 0.15)',
  '--kappa-quick-hover-border': 'var(--kappa-accent)',
  '--kappa-quick-max-text': '#ef4444',
  '--kappa-quick-max-hover-bg': 'rgba(239, 68, 68, 0.15)',
  '--kappa-quick-max-hover-border': '#ef4444',
  
  // Token select
  '--kappa-token-button-bg': 'var(--kappa-chip-bg)',
  '--kappa-token-button-border': 'var(--kappa-chip-border)',
  '--kappa-token-button-hover-bg': 'rgba(37, 99, 235, 0.1)',
  '--kappa-token-button-hover-border': 'var(--kappa-accent)',
  '--kappa-token-list-hover': 'var(--kappa-panel)',
  
  // Input fields
  '--kappa-input-border': 'var(--kappa-border)',
  '--kappa-input-focus-border': 'var(--kappa-accent)',
  '--kappa-input-text': 'var(--kappa-text)',
  '--kappa-input-placeholder': 'var(--kappa-muted)',
  
  // Swap button
  '--kappa-swap-button-bg': 'var(--kappa-panel)',
  '--kappa-swap-button-hover': 'var(--kappa-chip-bg)',
  '--kappa-swap-icon': 'var(--kappa-accent)',
  
  // Shadows and effects
  '--kappa-shadow-sm': '0 2px 4px rgba(0,0,0,0.1)',
  '--kappa-shadow-md': '0 4px 12px rgba(0,0,0,0.15)',
  '--kappa-shadow-lg': '0 10px 30px rgba(0,0,0,0.45)',
  '--kappa-shadow-xl': '0 20px 40px rgba(0,0,0,0.5)',
  '--kappa-shadow-primary': '0 4px 12px rgba(37, 99, 235, 0.2)',
  '--kappa-shadow-danger': '0 4px 12px rgba(239, 68, 68, 0.2)',
  
  // Border radius
  '--kappa-radius-sm': '6px',
  '--kappa-radius-md': '8px',
  '--kappa-radius-lg': '12px',
  '--kappa-radius-xl': '16px',
  '--kappa-radius-full': '9999px',
  
  // Spacing
  '--kappa-space-xs': '4px',
  '--kappa-space-sm': '8px',
  '--kappa-space-md': '12px',
  '--kappa-space-lg': '16px',
  '--kappa-space-xl': '20px',
  '--kappa-space-2xl': '24px',
  
  // Typography
  '--kappa-font-family': 'Inter, system-ui, sans-serif',
  '--kappa-font-size-xs': '11px',
  '--kappa-font-size-sm': '12px',
  '--kappa-font-size-md': '14px',
  '--kappa-font-size-lg': '16px',
  '--kappa-font-size-xl': '18px',
  '--kappa-font-size-2xl': '24px',
  '--kappa-font-weight-normal': '400',
  '--kappa-font-weight-medium': '500',
  '--kappa-font-weight-semibold': '600',
  '--kappa-font-weight-bold': '700',
  
  // Transitions
  '--kappa-transition-fast': '0.15s ease',
  '--kappa-transition-base': '0.2s ease',
  '--kappa-transition-slow': '0.3s ease',
  
  // Z-index layers
  '--kappa-z-base': '1',
  '--kappa-z-dropdown': '100',
  '--kappa-z-modal': '9999',
  '--kappa-z-tooltip': '10000',
} as const;

const sanitizeDecimalInput = (raw: string): string => {
  let v = String(raw || '').replace(/[^0-9.]/g, '');
  const firstDot = v.indexOf('.');
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
  }
  return v;
};

const abbreviateContract = (val: string) => {
  if (!val || val.length <= 20) return val;
  const head = val.slice(0, 5);
  const tail = val.slice(-12);
  return `${head}...${tail}`;
};

// Slippage Modal Component
function SlippageModal(props: { 
  open: boolean;
  slippage: string; 
  setSlippage: (v: string) => void; 
  onClose: () => void 
}) {
  const { open, slippage, setSlippage, onClose } = props;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  
  if (!open) return null;
  
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9998,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      borderRadius: 16,
    }}>
      <div style={{
        width: '85%',
        maxWidth: 320,
        background: 'var(--kappa-bg)',
        border: '1px solid var(--kappa-border)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: 'var(--kappa-text)', fontSize: 18 }}>Slippage Settings</h3>
          <button
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--kappa-text)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--kappa-muted)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--kappa-muted)',
              cursor: 'pointer',
              fontSize: 20,
              padding: 0,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              transform: 'scale(1)',
            }}
          >
            ✕
          </button>
        </div>
        
        <label style={{ display: 'block', marginBottom: 8, fontSize: 12, color: 'var(--kappa-muted)' }}>
          Max slippage tolerance (%)
        </label>
        
        <input 
          value={slippage} 
          onChange={(e) => setSlippage(sanitizeDecimalInput(e.target.value))} 
          placeholder="1" 
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 10,
            border: '1px solid var(--kappa-border)',
            background: 'var(--kappa-input-bg)',
            color: 'var(--kappa-text)',
            fontSize: 16,
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: 12,
          }}
        />
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['0.5', '1', '2', '5'].map((v, i) => (
            <button
              key={v}
              onClick={() => setSlippage(v)}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 8,
                border: '1px solid var(--kappa-border)',
                background: slippage === v ? 'var(--kappa-primary)' : (hoverIdx === i ? 'var(--kappa-panel)' : 'transparent'),
                color: slippage === v ? 'var(--kappa-text-on-primary)' : 'var(--kappa-text)',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                fontSize: 13,
                fontWeight: slippage === v ? 600 : 400,
              }}
            >
              {v}%
            </button>
          ))}
        </div>
        
        <p style={{ 
          marginBottom: 16, 
          color: 'var(--kappa-muted)', 
          fontSize: 11, 
          textAlign: 'center',
          lineHeight: 1.4,
        }}>
          Your transaction will revert if the price changes unfavorably by more than this percentage.
        </p>
        
        <button 
          onClick={onClose} 
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          style={{ 
            width: '100%',
            padding: '10px', 
            borderRadius: 10, 
            border: 'none',
            background: 'var(--kappa-primary)', 
            color: 'var(--kappa-text-on-primary)', 
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            transform: 'scale(1)',
            boxShadow: 'none',
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

// Transaction Modal Component
function TransactionModal(props: {
  open: boolean;
  loading: boolean;
  digest: string | null;
  error: string | null;
  spentLabel: string;
  forLabel: string;
  receiveAmount: string;
  onClose: () => void;
}) {
  const { open, loading, digest, error, spentLabel, forLabel, receiveAmount, onClose } = props;
  if (!open) return null;
  const statusText = loading ? 'Submitting…' : (error ? `Failed: ${error}` : 'Submitted');
  const explorer = digest ? `https://suivision.xyz/txblock/${digest}?network=mainnet` : '';
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 50, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderRadius: 16 }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--kappa-panel)', border: '1px solid var(--kappa-border)', borderRadius: 12, padding: 16, color: 'var(--kappa-text)', boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Transaction</h3>
        <div style={{ fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: 'var(--kappa-muted)' }}>You Pay</span> ➜ <span style={{ fontWeight: 600 }}>{spentLabel}</span>
        </div>
        <div style={{ fontSize: 13, marginBottom: 12 }}>
          <span style={{ color: 'var(--kappa-muted)' }}>You Receive</span> ➜ <span style={{ fontWeight: 600 }}>{receiveAmount} {forLabel}</span>
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

// Token Select Modal Component
function TokenSelectModal(props: {
  open: boolean;
  onClose: () => void;
  onSelect: (token: any) => void;
  apiBase: string;
  client?: any;
}) {
  const { open, onClose, onSelect, apiBase, client } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingTokens, setTrendingTokens] = useState<any[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);

  // Load trending tokens when modal opens
  useEffect(() => {
    if (!open) return;
    
    async function loadTrending() {
      setIsLoadingTrending(true);
      try {
        const res = await fetch(`${apiBase}/v1/coins/trending?page=1&size=50`);
        const json = await res.json();
        const all = (json?.data?.coins || []) as any[];
        const normalizedList = all.map((c: any) => ({
          ...c,
          contractAddress: c.address || c.contractAddress,
          coinType: c.address || c.coinType,
        }));
        setTrendingTokens(normalizedList.slice(0, 20));
      } catch (err) {
        console.error('Error loading trending tokens:', err);
      } finally {
        setIsLoadingTrending(false);
      }
    }
    
    loadTrending();
  }, [open, apiBase]);

  // Search tokens
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.trim();
    
    // Check if the query looks like a contract address (starts with 0x or contains ::)
    const isContractAddress = query.startsWith('0x') || query.includes('::');
    
    // For regular searches, require at least 2 characters
    if (!isContractAddress && query.length < 2) {
      setSearchResults([]);
      return;
    }

    // For contract addresses, search immediately; for regular searches, add delay
    const delayTime = isContractAddress ? 0 : 500;
    
    const delayTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        
        let res;
        if (isContractAddress) {
          // If it looks like a contract address, try to fetch it using the correct endpoint
          console.log('[Token Search] Detected contract address:', query);
          // Use the query parameter endpoint instead of path parameter
          res = await fetch(`${apiBase}/v1/coins?address=${encodeURIComponent(query)}&size=50`);
          console.log('[Token Search] Direct fetch response:', res.status, res.statusText);
          
          if (res.ok) {
            const json = await res.json();
            console.log('[Token Search] Direct fetch data:', json);
            const coins = json?.data?.coins || [];
            
            if (coins.length > 0) {
              // Take the first matching coin
              const tokenData = coins[0];
              const normalizedToken = {
                ...tokenData,
                contractAddress: tokenData.address || tokenData.contractAddress || query,
                coinType: tokenData.address || tokenData.coinType || query,
              };
              setSearchResults([normalizedToken]);
            } else {
              setSearchResults([]);
            }
          } else {
            console.log('[Token Search] Token not found in API');
            // Token not found in API, show no results
            setSearchResults([]);
          }
        } else {
          // Regular search by name or symbol
          res = await fetch(`${apiBase}/v1/coins?nameOrSymbol=${query.toLowerCase()}`);
          const json = await res.json();
          const all = (json?.data?.coins || []) as any[];
          const normalizedAll = all.map((c: any) => ({
            ...c,
            contractAddress: c.address || c.contractAddress,
            coinType: c.address || c.coinType,
          }));
          setSearchResults(normalizedAll.slice(0, 50));
        }
      } catch (err) {
        console.error('Error searching tokens:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delayTime);

    return () => clearTimeout(delayTimer);
  }, [searchQuery, apiBase]);

  if (!open) return null;

  const displayTokens = searchQuery ? searchResults : trendingTokens;
  const isLoading = searchQuery ? isSearching : isLoadingTrending;

  return (
    <>
      <style>{`
        .kappa-close-btn {
          transition: transform 0.3s ease, color 0.3s ease, filter 0.3s ease;
          transform-origin: center center;
          transform: rotate(0deg);
        }
        
        .kappa-close-btn:hover {
          transform: rotate(125deg);
          color: var(--kappa-accent) !important;
          filter: brightness(1.2);
        }
        
        .kappa-close-btn:active {
          transform: rotate(125deg) scale(0.95);
        }
        
        /* Minimal scrollbar styling */
        .kappa-token-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .kappa-token-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .kappa-token-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        /* Keep the same minimal style on hover */
        .kappa-token-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        /* Firefox scrollbar */
        .kappa-token-list {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--kappa-modal-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: '90%',
        maxWidth: 420,
        height: 800,
        maxHeight: '90vh',
        background: 'var(--kappa-bg)',
        border: '1px solid var(--kappa-border)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 16px 10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, color: 'var(--kappa-text)', fontSize: 18 }}>Select a token</h3>
          <button
            className="kappa-close-btn"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--kappa-muted)',
              fontSize: 24,
              cursor: 'pointer',
              padding: 0,
              width: 32,
              height: 32,
              position: 'relative',
              marginRight: -4,
            }}
          >
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'block',
              lineHeight: 1,
              marginTop: '-1px', // Fine-tune vertical centering for the × character
            }}>×</span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: '0 20px 20px' }}>
          <input
            type="text"
            placeholder="Search by name or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 10,
              border: '1px solid var(--kappa-border)',
              background: 'var(--kappa-input-bg)',
              color: 'var(--kappa-text)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Token List */}
        <div 
          className="kappa-token-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 10px',
          }}>
          {!searchQuery && !isLoading && (
            <div style={{
              padding: '0 10px 10px',
              color: 'var(--kappa-muted)',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              Trending
            </div>
          )}
          
          {isLoading ? (
            <div style={{ padding: '10px 0' }}>
              {/* Skeleton loading items */}
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                >
                  {/* Avatar skeleton */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(90deg, var(--kappa-panel) 0%, var(--kappa-border) 50%, var(--kappa-panel) 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s ease-in-out infinite',
                  }} />
                  
                  {/* Text skeleton */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: 14,
                      width: '30%',
                      marginBottom: 6,
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, var(--kappa-panel) 0%, var(--kappa-border) 50%, var(--kappa-panel) 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }} />
                    <div style={{
                      height: 12,
                      width: '50%',
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, var(--kappa-panel) 0%, var(--kappa-border) 50%, var(--kappa-panel) 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }} />
                  </div>
                  
                  {/* Address skeleton */}
                  <div style={{
                    height: 11,
                    width: 100,
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, var(--kappa-panel) 0%, var(--kappa-border) 50%, var(--kappa-panel) 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s ease-in-out infinite',
                  }} />
                </div>
              ))}
            </div>
          ) : displayTokens.length > 0 ? (
            displayTokens.map((token) => (
              <button
                key={token.address || token.contractAddress || token.guid}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                style={{
                  width: '100%',
                  padding: '12px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--kappa-panel)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Token Avatar */}
                {token.avatarUrl ? (
                  <img
                    src={token.avatarUrl}
                    alt={token.symbol}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--kappa-avatar-bg)',
                    flexShrink: 0,
                  }} />
                )}
                
                {/* Symbol and Name */}
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span style={{ 
                      color: 'var(--kappa-text)', 
                      fontWeight: 600,
                      fontSize: 14,
                    }}>
                      {token.symbol?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ 
                    color: 'var(--kappa-muted)', 
                    fontSize: 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {token.name}
                  </div>
                </div>
                
                {/* Contract Address with Copy */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}>
                  <span 
                    data-token-id={token.address || token.contractAddress}
                    style={{ 
                      color: 'var(--kappa-muted)', 
                      fontSize: 11,
                      fontFamily: 'monospace',
                      minWidth: 100,
                      textAlign: 'right',
                    }}
                  >
                    {(() => {
                      const addr = token.address || token.contractAddress || '';
                      if (addr.length > 15) {
                        return `${addr.slice(0, 6)}...${addr.slice(-9)}`;
                      }
                      return addr;
                    })()}
                  </span>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      const addr = token.address || token.contractAddress || '';
                      navigator.clipboard.writeText(addr);
                      
                      // Show "Copied" feedback
                      const span = e.currentTarget.previousElementSibling as HTMLSpanElement;
                      if (span) {
                        const originalText = span.textContent;
                        const originalColor = span.style.color;
                        span.textContent = 'Copied';
                        span.style.color = 'var(--kappa-success)';
                        
                        setTimeout(() => {
                          span.textContent = originalText;
                          span.style.color = originalColor;
                        }, 2000);
                      }
                      
                      // Also change icon color
                      const svg = e.currentTarget.querySelector('svg');
                      if (svg) {
                        const originalColor = svg.style.stroke;
                        svg.style.stroke = 'var(--kappa-success)';
                        setTimeout(() => {
                          svg.style.stroke = originalColor;
                        }, 2000);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--kappa-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Copy address"
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ transition: 'stroke 0.2s' }}
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--kappa-muted)' }}>
              {searchQuery ? 'No tokens found' : 'Loading...'}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// Wallet Controls Component
function WalletControls() {
  const account = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const addressShort = account?.address ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}` : '';
  const [open, setOpen] = useState(false);
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
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid var(--kappa-border)',
            background: 'var(--kappa-primary)',
            color: 'var(--kappa-text-on-primary)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Connect Wallet
        </button>
        {open && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 6,
            background: 'var(--kappa-panel)',
            border: '1px solid var(--kappa-border)',
            borderRadius: 10,
            boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
            zIndex: 9999,
            minWidth: 180,
            overflow: 'hidden',
          }}>
            {wallets.map((w) => (
              <button
                key={w.name}
                onClick={() => connect({ wallet: w })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  color: 'var(--kappa-text)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {w.icon && <img src={w.icon} alt={w.name} style={{ width: 18, height: 18 }} />}
                <span>{w.name}</span>
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
        style={{
          padding: '10px 16px',
          borderRadius: 10,
          border: '1px solid var(--kappa-border)',
          background: 'var(--kappa-panel)',
          color: 'var(--kappa-text)',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        {addressShort}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: 6,
          background: 'var(--kappa-panel)',
          border: '1px solid var(--kappa-border)',
          borderRadius: 10,
          boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
          zIndex: 9999,
          minWidth: 140,
        }}>
          <button
            onClick={() => disconnect()}
            style={{
              background: 'transparent',
              color: 'var(--kappa-text)',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 14px',
              width: '100%',
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

// Main Widget Component
export function WidgetV2Embedded(props: {
  theme?: Partial<Record<keyof typeof defaultTheme, string>>,
  defaultContract?: string,
  lockContract?: boolean,
  logoUrl?: string,
  projectName?: string,
  apiBase?: string,
  network?: any,
}) {
  const { theme, defaultContract, lockContract, logoUrl, projectName, network, apiBase: propsApiBase } = props || {};
  
  // API configuration
  let apiBase = propsApiBase || '/api';
  
  // Special SUI token object
  const SUI_TOKEN = {
    symbol: 'SUI',
    name: 'Sui',
    contractAddress: 'SUI',
    address: 'SUI',
    avatarUrl: 'https://strapi-dev.scand.app/uploads/sui_c07df05f00.png',
    isSui: true,
  };
  
  // State
  const [fromToken, setFromToken] = useState<any>(SUI_TOKEN); // Start with SUI in from position
  const [toToken, setToToken] = useState<any>(null); // null = Select token, object = selected token
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenModalPosition, setTokenModalPosition] = useState<'from' | 'to'>('to'); // Track which position opened the modal
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [slippage, setSlippage] = useState('1');
  
  // Balances
  const [suiBalance, setSuiBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  
  // Transaction state
  const [txOpen, setTxOpen] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  
  // Curve and quotes
  const [curve, setCurve] = useState<any>(null);
  const [quoteTokens, setQuoteTokens] = useState(0);
  const [quoteSui, setQuoteSui] = useState(0);
  
  // Dynamic module config
  const [dynamicModuleConfig, setDynamicModuleConfig] = useState<any>(null);
  const [tokenDecimals, setTokenDecimals] = useState(9);
  
  // Hooks
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

  // Determine if this is a buy or sell based on token positions
  const isBuy = fromToken?.isSui && toToken && !toToken?.isSui; // SUI -> Token = Buy
  const isSell = fromToken && !fromToken?.isSui && toToken?.isSui; // Token -> SUI = Sell

  // Normalize curve object to the format math.js expects
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
    return null;
  };

  // Initialize default contract
  useEffect(() => {
    if (defaultContract && !toToken) {
      // Load default contract as the "to" token (SUI -> Token)
      loadTokenMetadata(defaultContract);
    }
  }, [defaultContract, toToken]);

  // Set API base for kappa-trade module on component mount
  useEffect(() => {
    async function setupTrade() {
      const tradeMod = await import('../../kappa-trade.js');
      const trade = (tradeMod as any).default || tradeMod as any;
      if (trade.setApiBase) {
        trade.setApiBase(apiBase);
        console.log('[WidgetV2] Set API base on mount to:', apiBase);
      }
    }
    setupTrade();
  }, [apiBase]);

  // Load token metadata
  async function loadTokenMetadata(contractAddress: string, setInToPosition: boolean = true, skipPositionUpdate: boolean = false) {
    try {
      // Try fetching with the contract address
      console.log('[Token] Fetching metadata for:', contractAddress);
      const res = await fetch(`${apiBase}/v1/coins/${encodeURIComponent(contractAddress)}`);
      
      if (!res.ok) {
        console.error('[Token] Failed to fetch metadata:', res.status, res.statusText);
        // If the fetch failed, we can still try to get basic data from the chain
        try {
          const meta = await client.getCoinMetadata({ coinType: contractAddress });
          console.log('[Token] Got metadata from chain:', meta);
          
          const tokenObj = {
            symbol: meta?.symbol || contractAddress.split('::')[2] || 'UNKNOWN',
            name: meta?.name || contractAddress.split('::')[2] || 'Unknown Token',
            decimals: meta?.decimals || 9,
            contractAddress: contractAddress,
            address: contractAddress,
            avatarUrl: meta?.iconUrl || '',
          };
          
          if (!skipPositionUpdate) {
            if (setInToPosition) {
              setToToken(tokenObj);
            } else {
              setFromToken(tokenObj);
            }
          }
          
          if (meta?.decimals) setTokenDecimals(meta.decimals);
          
          // Still try to load balance
          if (account?.address) {
            try {
              const tokenBal = await suiClientHook.getBalance({ 
                owner: account.address, 
                coinType: contractAddress 
              });
              const scale = Math.pow(10, meta?.decimals || 9);
              const balance = Math.max(0, Number(tokenBal.totalBalance || 0)) / scale;
              setTokenBalance(balance);
              console.log('[Token] Balance loaded from chain:', balance);
            } catch (err) {
              console.error('[Token] Error loading balance:', err);
            }
          }
          return;
        } catch (chainErr) {
          console.error('[Token] Failed to get metadata from chain:', chainErr);
          return;
        }
      }
      
      const json = await res.json();
      const tokenData = json?.data || json;
      
      console.log('[Token] Loaded metadata:', tokenData);
      
      // Create the token object
      const tokenObj = {
        ...tokenData,
        contractAddress: contractAddress,
        address: contractAddress,
      };
      
      // Set token in appropriate position
      if (!skipPositionUpdate) {
        if (setInToPosition) {
          setToToken(tokenObj);
        } else {
          setFromToken(tokenObj);
        }
      }
      
      // Load factory configuration if factoryAddress is available
      if (tokenData.factoryAddress) {
        console.log('[Token] Factory address found:', tokenData.factoryAddress);
        try {
          const factoryRes = await fetch(`${apiBase}/v1/coins/factories/${tokenData.factoryAddress}`);
          if (factoryRes.ok) {
            const factoryJson = await factoryRes.json();
            const factoryData = factoryJson?.data || factoryJson;
            
            console.log('[Token] Factory configuration:', factoryData);
            
            if (factoryData) {
              const moduleConfig = {
                bondingContract: factoryData.packageID || tokenData.factoryAddress,
                CONFIG: factoryData.configObjectID,
                globalPauseStatusObjectId: factoryData.pauseStatusObjectID,
                poolsId: factoryData.poolsObjectID,
                lpBurnManger: factoryData.lpBurnManagerObjectID,
                moduleName: factoryData.packageName || 'kappadotmeme',
              };
              
              setDynamicModuleConfig(moduleConfig);
              console.log('[Token] Set dynamic module config:', moduleConfig);
            }
          }
        } catch (factoryErr) {
          console.error('[Token] Error fetching factory config:', factoryErr);
        }
      }
      
      // Load curve data
      if (tokenData.curveAddress) {
        console.log('[Token] Loading curve from:', tokenData.curveAddress);
        const obj = await client.getObject({ 
          id: tokenData.curveAddress, 
          options: { showContent: true } 
        });
        const normalizedCurve = normalizeCurveObject(obj);
        console.log('[Token] Normalized curve:', normalizedCurve);
        setCurve(normalizedCurve);
      }
      
      // Load decimals
      try {
        const meta = await client.getCoinMetadata({ coinType: contractAddress });
        if (meta?.decimals) setTokenDecimals(meta.decimals);
      } catch {}
      
      // Load token balance if wallet is connected
      if (account?.address) {
        try {
          const tokenBal = await suiClientHook.getBalance({ 
            owner: account.address, 
            coinType: contractAddress 
          });
          const scale = Math.pow(10, tokenData.decimals || 9);
          const balance = Math.max(0, Number(tokenBal.totalBalance || 0)) / scale;
          setTokenBalance(balance);
          console.log('[Token] Balance loaded:', balance, tokenData.symbol);
        } catch (err) {
          console.error('[Token] Error loading balance:', err);
        }
      }
    } catch (err) {
      console.error('Error loading token metadata:', err);
    }
  }
  
  // Function to refresh all balances
  async function refreshBalances() {
    if (!account?.address) return;
    
    try {
      // Load SUI balance
      const suiBal = await suiClientHook.getBalance({ owner: account.address });
      setSuiBalance(Math.max(0, Number(suiBal.totalBalance || 0)) / 1e9);
      
      // Load token balance if a token is selected
      const selectedToken = (fromToken && !fromToken.isSui) ? fromToken : toToken;
      if (selectedToken && !selectedToken.isSui && selectedToken.contractAddress) {
        const tokenBal = await suiClientHook.getBalance({ 
          owner: account.address, 
          coinType: selectedToken.contractAddress 
        });
        const scale = Math.pow(10, tokenDecimals || 9);
        setTokenBalance(Math.max(0, Number(tokenBal.totalBalance || 0)) / scale);
      }
    } catch (err) {
      console.error('[Balance] Error refreshing balances:', err);
    }
  }

  // Swap tokens (reverse direction)
  const handleSwap = () => {
    // Don't allow swapping if contract is locked
    if (lockContract) {
      console.log('[Swap] Swap disabled - contract is locked');
      return;
    }
    
    console.log('[Swap] Before swap - from:', fromToken, 'to:', toToken);
    
    // Simple swap logic: Always keep one side as SUI and the other as the selected token
    // Find the non-SUI token (if any)
    const selectedToken = fromToken?.isSui ? toToken : fromToken;
    
    if (!selectedToken || selectedToken.isSui) {
      // No token selected or both are SUI (shouldn't happen), do nothing
      console.log('[Swap] No valid token to swap');
      return;
    }
    
    // Simply swap positions: if SUI is on top, move it to bottom and vice versa
    if (fromToken?.isSui) {
      // SUI on top -> Move SUI to bottom, token to top
      setFromToken(selectedToken);
      setToToken(SUI_TOKEN);
    } else {
      // Token on top -> Move token to bottom, SUI to top
      setFromToken(SUI_TOKEN);
      setToToken(selectedToken);
    }
    
    // Also swap the amounts
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    
    console.log('[Swap] After swap - from:', fromToken, 'to:', toToken);
  };

  // Handle token selection (only for the non-SUI side)
  const handleTokenSelect = async (token: any) => {
    const contractAddress = token.address || token.contractAddress;
    
    console.log('[Token Select] Selected token:', token);
    
    // Load factory configuration if token has factoryAddress
    if (token.factoryAddress) {
      console.log('[Token Select] Token has factory address:', token.factoryAddress);
      try {
        // Fetch the specific factory configuration by address
        const factoryRes = await fetch(`${apiBase}/v1/coins/factories/address/${token.factoryAddress}`);
        if (factoryRes.ok) {
          const factoryJson = await factoryRes.json();
          const factoryData = factoryJson?.data?.factory;
          
          if (factoryData) {
            console.log('[Token Select] Factory configuration loaded:', factoryData);
            
            const moduleConfig = {
              bondingContract: factoryData.packageID,
              CONFIG: factoryData.configObjectID,
              globalPauseStatusObjectId: factoryData.pauseStatusObjectID,
              poolsId: factoryData.poolsObjectID,
              lpBurnManger: factoryData.lpBurnManagerObjectID,
              moduleName: factoryData.packageName, // This will be 'kappadotmeme_partner' for Patara
            };
            
            setDynamicModuleConfig(moduleConfig);
            console.log('[Token Select] Set dynamic module config:', moduleConfig);
          } else {
            console.warn('[Token Select] No factory data in response');
          }
        } else {
          console.warn('[Token Select] Failed to fetch factory:', factoryRes.status);
        }
      } catch (err) {
        console.error('[Token Select] Error fetching factory config:', err);
      }
    }
    
    // Debug logging
    console.log('[Token Select] Current state before selection:', {
      fromToken: fromToken?.symbol || 'null',
      fromIsSui: fromToken?.isSui,
      toToken: toToken?.symbol || 'null',
      toIsSui: toToken?.isSui,
      selectedToken: token.symbol,
      modalPosition: tokenModalPosition
    });
    
    // Use the modal position to determine where to place the token
    // Always ensure one side is SUI and the other is the token
    if (tokenModalPosition === 'from') {
      // User clicked on the FROM position to select a token
      // Put the token in FROM and ensure SUI is in TO
      console.log('[Token Select] Placing token in FROM position, SUI in TO');
      setFromToken(token);
      setToToken(SUI_TOKEN);
    } else if (tokenModalPosition === 'to') {
      // User clicked on the TO position to select a token
      // Put the token in TO and ensure SUI is in FROM
      console.log('[Token Select] Placing token in TO position, ensuring SUI in FROM');
      setToToken(token);
      // Only set FROM to SUI if it's not already SUI
      if (!fromToken || !fromToken.isSui) {
        console.log('[Token Select] FROM is not SUI, setting it to SUI');
        setFromToken(SUI_TOKEN);
      }
    } else {
      console.error('[Token Select] Unknown modal position:', tokenModalPosition);
    }
    
    console.log('[Token Select] After setting - expecting:', {
      from: tokenModalPosition === 'from' ? token.symbol : 'SUI',
      to: tokenModalPosition === 'to' ? token.symbol : 'SUI'
    });
    
    // If token already has curve data from trending/search, use it
    if (token.curveAddress) {
      console.log('[Token Select] Token has curve address:', token.curveAddress);
      try {
        const obj = await client.getObject({ 
          id: token.curveAddress, 
          options: { showContent: true } 
        });
        const normalizedCurve = normalizeCurveObject(obj);
        console.log('[Token Select] Loaded and normalized curve:', normalizedCurve);
        setCurve(normalizedCurve);
      } catch (err) {
        console.error('[Token Select] Error loading curve:', err);
      }
    }
    
    // Load decimals if not present
    if (!token.decimals && contractAddress) {
      try {
        const meta = await client.getCoinMetadata({ coinType: contractAddress });
        if (meta?.decimals) {
          setTokenDecimals(meta.decimals);
          token.decimals = meta.decimals;
        }
      } catch {}
    } else if (token.decimals) {
      setTokenDecimals(token.decimals);
    }
    
    // Load balance
    if (account?.address && contractAddress && contractAddress !== 'SUI') {
      try {
        const tokenBal = await suiClientHook.getBalance({ 
          owner: account.address, 
          coinType: contractAddress 
        });
        const scale = Math.pow(10, token.decimals || 9);
        const balance = Math.max(0, Number(tokenBal.totalBalance || 0)) / scale;
        setTokenBalance(balance);
        console.log('[Token Select] Balance loaded:', balance, token.symbol);
      } catch (err) {
        console.error('[Token Select] Error loading balance:', err);
      }
    }
    
    // Still try to load full metadata for factory config
    if (contractAddress && contractAddress !== 'SUI') {
      // Skip position update since we've already set the positions correctly
      const isInToPosition = tokenModalPosition === 'to';
      console.log('[Token Select] Loading metadata, skipping position update');
      loadTokenMetadata(contractAddress, isInToPosition, true); // true = skipPositionUpdate
    }
  };

  // Load balances whenever account or tokens change
  useEffect(() => {
    refreshBalances();
  }, [account?.address, fromToken?.contractAddress, toToken?.contractAddress]);

  // Compute quotes - user inputs in TOP field, gets quote in BOTTOM field
  useEffect(() => {
    async function computeQuotes() {
      if (!curve || !fromAmount || fromAmount === '0' || fromAmount === '') {
        setToAmount('');
        setQuoteTokens(0);
        setQuoteSui(0);
        return;
      }
      
      try {
        const mathMod = await import('../../math.js');
        const buyMath = (mathMod as any).buyMath || (mathMod as any).default?.buyMath;
        const sellMath = (mathMod as any).sellMath || (mathMod as any).default?.sellMath;
        
        if (isBuy && buyMath) {
          // User is buying token with SUI (SUI input -> Token output)
          const suiMist = Math.max(0, Math.floor(Number(fromAmount) * 1e9));
          if (suiMist > 0) {
            const tokens = buyMath(curve, suiMist);
            console.log('[Quote] Buy calculation - SUI in:', suiMist, 'Tokens out:', tokens);
            setQuoteTokens(tokens);
            const scale = Math.pow(10, tokenDecimals || 9);
            const formattedTokens = (tokens / scale).toFixed(6);
            setToAmount(formattedTokens);
          } else {
            setToAmount('');
          }
        } else if (isSell && sellMath) {
          // User is selling token for SUI (Token input -> SUI output)
          const scale = Math.pow(10, tokenDecimals || 9);
          const tokensAmt = Math.max(0, Math.floor(Number(fromAmount) * scale));
          if (tokensAmt > 0) {
            const sui = sellMath(curve, tokensAmt);
            console.log('[Quote] Sell calculation - Tokens in:', tokensAmt, 'SUI out:', sui);
            setQuoteSui(sui);
            const formattedSui = (sui / 1e9).toFixed(6);
            setToAmount(formattedSui);
          } else {
            setToAmount('');
          }
        } else {
          setToAmount('');
        }
      } catch (err) {
        console.error('[Quote] Error computing quotes:', err);
        setToAmount('');
      }
    }
    
    computeQuotes();
  }, [curve, fromAmount, isBuy, isSell, tokenDecimals]);

  // Handle swap execution
  const handleExecuteSwap = async () => {
    if (!signer || !account) {
      alert('Connect wallet first');
      return;
    }
    
    // Determine which token we're trading (the non-SUI one)
    const tradingToken = fromToken?.isSui ? toToken : fromToken;
    if (!tradingToken || tradingToken.isSui || !tradingToken.contractAddress) {
      alert('Please select a token to trade');
      return;
    }
    
    try {
      setTxOpen(true);
      setTxLoading(true);
      setTxDigest(null);
      setTxError(null);
      
      const tradeMod = await import('../../kappa-trade.js');
      const trade = (tradeMod as any).default || tradeMod as any;
      trade.setSuiClient(client);
      
      // API base is already set in the useEffect on mount
      
      // Use dynamic module config if available, otherwise fall back to prop
      // Dynamic config from API takes precedence over static network prop
      const configToUse = dynamicModuleConfig || network;
      if (configToUse && trade.setNetworkConfig) {
        console.log('[WidgetV2] Setting network config:', dynamicModuleConfig ? 'Dynamic from API' : 'Static from prop');
        console.log('[WidgetV2] Config being used:', configToUse);
        trade.setNetworkConfig(configToUse);
      } else {
        console.log('[WidgetV2] No network config available, using defaults');
      }
      
      const [pkg, mod, typeName] = tradingToken.contractAddress.split('::');
      const slip = Math.max(0, Math.min(100, Number(slippage) || 0));
      
      let res;
      if (isBuy) {
        // Buy transaction - SUI -> Token
        const minOut = Math.floor(Math.max(0, quoteTokens) * (1 - slip / 100));
        const tradeParams = {
          publishedObject: { packageId: pkg },
          name: (mod || '').replaceAll('_', ' '), // This is what the trade module uses to construct type argument
          sui: Math.floor(parseFloat(fromAmount) * 1e9),
          min_tokens: minOut,
          // Add these for better type argument construction if needed
          moduleName: mod || '',
          typeName: typeName || '',
        };
        
        console.log('[WidgetV2] Buy params:', {
          contract: tradingToken.contractAddress,
          packageId: pkg,
          moduleName: mod,
          typeName,
          suiAmount: tradeParams.sui,
          minTokens: tradeParams.min_tokens,
          slippage: slip + '%'
        });
        
        res = await (trade as any).buyWeb3(signer as any, tradeParams);
      } else if (isSell) {
        // Sell transaction - Token -> SUI
        const minSui = Math.floor(Math.max(0, quoteSui) * (1 - slip / 100));
        // Convert human-readable tokensIn to blockchain value
        const tokensInBlockchain = Math.floor(parseFloat(fromAmount || '0') * Math.pow(10, tokenDecimals || 9));
        
        const tradeParams = {
          publishedObject: { packageId: pkg },
          name: (mod || '').replaceAll('_', ' '), // This is what the trade module uses to construct type argument
          sell_token: String(tokensInBlockchain),
          min_sui: minSui,
          // Add these for better type argument construction if needed
          moduleName: mod || '',
          typeName: typeName || '',
        };
        
        console.log('[WidgetV2] Sell params:', {
          contract: tradingToken.contractAddress,
          packageId: pkg,
          moduleName: mod,
          typeName,
          sellAmount: tradeParams.sell_token,
          minSui: tradeParams.min_sui,
          slippage: slip + '%'
        });
        
        res = await (trade as any).sellWeb3(signer as any, tradeParams);
      } else {
        console.error('[WidgetV2] Invalid trade state - neither buy nor sell');
        alert('Invalid trade state');
        return;
      }
      
      if (res?.success) {
        setTxDigest(res?.digest || null);
        console.log('[WidgetV2] Transaction successful:', res?.digest);
        // Don't reset amounts here - they're needed for the modal display
        // Amounts will be reset when the modal is closed
        // Refresh balances after successful transaction
        setTimeout(() => {
          refreshBalances();
        }, 2000); // Wait 2 seconds for blockchain to update
      } else {
        setTxError(res?.error || 'unknown error');
        console.error('[WidgetV2] Transaction failed:', res?.error);
      }
    } catch (e: any) {
      console.error('[WidgetV2] Swap error:', e);
      alert('Swap failed: ' + (e?.message || String(e)));
      setTxError(e?.message || 'Transaction failed');
    } finally {
      setTxLoading(false);
    }
  };

  const themeVars = { ...defaultTheme, ...(theme || {}) } as Record<string, string>;
  const SUI_LOGO = 'https://strapi-dev.scand.app/uploads/sui_c07df05f00.png';

  return (
    <div className="kappa-root" style={{
      width: '100%',
      maxWidth: 480,
      background: 'var(--kappa-bg)',
      borderRadius: 'var(--kappa-radius-xl)',
      padding: 'var(--kappa-space-xl)',
      boxShadow: 'var(--kappa-shadow-lg)',
      border: '1px solid var(--kappa-border)',
      position: 'relative',
      ...(themeVars as any),
      fontFamily: 'var(--kappa-font-family)',
    }}>
      <style>{`
        .kappa-root * { box-sizing: border-box; }
        .kappa-root input, .kappa-root button { font-family: inherit !important; }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 500px) {
          .kappa-root { 
            width: calc(100vw - 10px) !important; 
            max-width: none !important; 
            margin: 0 5px !important; 
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img 
            src={logoUrl || defaultLogoDataUri} 
            alt="logo" 
            style={{ width: 40, height: 40, borderRadius: 4 }} 
          />
          <div style={{ width: 1, height: 16, background: 'var(--kappa-border)', opacity: 0.8 }} />
          <div style={{ color: 'var(--kappa-text)', fontWeight: 700 }}>{projectName || 'Kappa'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setShowSlippageModal(true)}
            title="Slippage settings"
            style={{
              background: 'var(--kappa-panel)',
              border: '1px solid var(--kappa-border)',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--kappa-muted)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--kappa-chip-bg)';
              e.currentTarget.style.color = 'var(--kappa-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--kappa-panel)';
              e.currentTarget.style.color = 'var(--kappa-muted)';
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 512 512"
              fill="currentColor"
            >
              <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/>
            </svg>
          </button>
          <WalletControls />
        </div>
      </div>

      {/* From Section */}
      <div style={{
        background: 'var(--kappa-panel)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <label style={{ color: 'var(--kappa-muted)', fontSize: 13 }}>You Pay</label>
          <span style={{ color: 'var(--kappa-muted)', fontSize: 12 }}>
            Balance: {fromToken?.isSui ? suiBalance.toFixed(2) : tokenBalance.toFixed(2)}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => {
              const sanitized = sanitizeDecimalInput(e.target.value);
              const numValue = parseFloat(sanitized) || 0;
              const balance = fromToken?.isSui ? suiBalance : tokenBalance;
              
              // Apply different limits for SUI vs tokens
              let maxAllowed;
              if (fromToken?.isSui) {
                // For SUI, limit to 97% of balance
                maxAllowed = balance * 0.97;
              } else {
                // For tokens, limit to balance minus 1 token
                maxAllowed = Math.max(0, balance - 1);
              }
              
              if (numValue > maxAllowed) {
                setFromAmount(maxAllowed.toFixed(6));
              } else {
                setFromAmount(sanitized);
              }
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--kappa-text)',
              fontSize: 24,
              fontWeight: 600,
              padding: 0,
            }}
          />
          
          {fromToken && !fromToken.isSui ? (
            // If from is a token, show selector button (disabled if locked)
            <button
              onClick={() => {
                if (!lockContract) {
                  setTokenModalPosition('from');
                  setShowTokenModal(true);
                }
              }}
              onMouseEnter={(e) => {
                if (!lockContract) {
                  e.currentTarget.style.background = 'var(--kappa-token-button-hover-bg)';
                  e.currentTarget.style.borderColor = 'var(--kappa-token-button-hover-border)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--kappa-token-button-bg)';
                e.currentTarget.style.borderColor = 'var(--kappa-token-button-border)';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 20,
                background: 'var(--kappa-chip-bg)',
                border: '1px solid var(--kappa-chip-border)',
                cursor: lockContract ? 'not-allowed' : 'pointer',
                opacity: lockContract ? 0.7 : 1,
                color: 'var(--kappa-text)',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
            >
              {fromToken.avatarUrl && (
                <img
                  src={fromToken.avatarUrl}
                  alt={fromToken.symbol}
                  style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              )}
              <span>{fromToken.symbol?.toUpperCase()}</span>
              {!lockContract && <span style={{ fontSize: 10 }}>▼</span>}
            </button>
          ) : (
            // If from is SUI, show static badge
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 20,
                background: 'var(--kappa-chip-bg)',
                border: '1px solid var(--kappa-chip-border)',
                color: 'var(--kappa-text)',
              }}
            >
              <img 
                src={SUI_LOGO} 
                alt="SUI" 
                style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                }} 
              />
              <span>SUI</span>
            </div>
          )}
        </div>
        
        {/* Quick amount buttons */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {['25%', '50%', '75%', 'MAX'].map((percent) => (
            <button
              key={percent}
              onClick={() => {
                // Use SUI balance when SUI is in the FROM field, token balance when token is in FROM field
                const balance = fromToken?.isSui ? suiBalance : tokenBalance;
                let amount = 0;
                
                // Apply percentage based on button clicked
                if (percent === '25%') {
                  amount = balance * 0.25;
                } else if (percent === '50%') {
                  amount = balance * 0.5;
                } else if (percent === '75%') {
                  amount = balance * 0.75;
                } else if (percent === 'MAX') {
                  if (fromToken?.isSui) {
                    // For SUI, use 97% to leave buffer for gas
                    amount = balance * 0.97;
                  } else {
                    // For tokens, subtract 1 token as buffer
                    amount = Math.max(0, balance - 1);
                  }
                }
                
                // Set the amount with 6 decimal places
                const finalAmount = amount.toFixed(6);
                setFromAmount(finalAmount);
              }}
              onMouseEnter={(e) => {
                if (percent === 'MAX') {
                  e.currentTarget.style.background = 'var(--kappa-quick-max-hover-bg)';
                  e.currentTarget.style.borderColor = 'var(--kappa-quick-max-hover-border)';
                  e.currentTarget.style.color = 'var(--kappa-quick-max-text)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                } else {
                  e.currentTarget.style.background = 'var(--kappa-quick-hover-bg)';
                  e.currentTarget.style.borderColor = 'var(--kappa-quick-hover-border)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--kappa-quick-bg)';
                e.currentTarget.style.borderColor = 'var(--kappa-quick-border)';
                e.currentTarget.style.color = percent === 'MAX' ? 'var(--kappa-quick-max-text)' : 'var(--kappa-quick-text)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              style={{
                flex: 1,
                padding: 'var(--kappa-space-xs) var(--kappa-space-sm)',
                borderRadius: 'var(--kappa-radius-sm)',
                border: '1px solid var(--kappa-quick-border)',
                background: 'var(--kappa-quick-bg)',
                color: percent === 'MAX' ? 'var(--kappa-quick-max-text)' : 'var(--kappa-quick-text)',
                cursor: 'pointer',
                fontSize: 'var(--kappa-font-size-xs)',
                fontWeight: 'var(--kappa-font-weight-semibold)',
                transition: 'all var(--kappa-transition-base)',
                transform: 'scale(1)',
              }}
            >
              {percent}
            </button>
          ))}
        </div>
      </div>

      {/* Swap Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        height: 0,
      }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!lockContract) {
              console.log('[Swap] Button clicked!');
              handleSwap();
            }
          }}
          onMouseEnter={(e) => {
            if (!lockContract) {
              e.currentTarget.style.background = 'var(--kappa-panel)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!lockContract) {
              e.currentTarget.style.background = 'var(--kappa-bg)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          style={{
            position: 'absolute',
            top: -18,
            background: 'var(--kappa-bg)',
            border: '3px solid var(--kappa-border)',
            borderRadius: 12,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: lockContract ? 'not-allowed' : 'pointer',
            opacity: lockContract ? 0.5 : 1,
            color: 'var(--kappa-text)',
            fontSize: 20,
            zIndex: 10,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          ⇅
        </button>
      </div>

      {/* To Section */}
      <div style={{
        background: 'var(--kappa-panel)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <label style={{ color: 'var(--kappa-muted)', fontSize: 13 }}>You Receive</label>
          {toToken && (
            <span style={{ color: 'var(--kappa-muted)', fontSize: 12 }}>
              Balance: {toToken?.isSui ? suiBalance.toFixed(2) : tokenBalance.toFixed(2)}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="0.0"
            value={toAmount}
            readOnly
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--kappa-text)',
              fontSize: 24,
              fontWeight: 600,
              padding: 0,
            }}
          />
          
          {toToken && !toToken.isSui ? (
            // If to is a token, show selector button (disabled if locked)
            <button
              onClick={() => {
                if (!lockContract) {
                  setTokenModalPosition('to');
                  setShowTokenModal(true);
                }
              }}
              onMouseEnter={(e) => {
                if (!lockContract) {
                  e.currentTarget.style.background = 'var(--kappa-token-button-hover-bg)';
                  e.currentTarget.style.borderColor = 'var(--kappa-token-button-hover-border)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--kappa-token-button-bg)';
                e.currentTarget.style.borderColor = 'var(--kappa-token-button-border)';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 20,
                background: 'var(--kappa-chip-bg)',
                border: '1px solid var(--kappa-chip-border)',
                cursor: lockContract ? 'not-allowed' : 'pointer',
                opacity: lockContract ? 0.7 : 1,
                color: 'var(--kappa-text)',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
            >
              {toToken.avatarUrl && (
                <img
                  src={toToken.avatarUrl}
                  alt={toToken.symbol}
                  style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              )}
              <span>{toToken.symbol?.toUpperCase()}</span>
              {!lockContract && <span style={{ fontSize: 10 }}>▼</span>}
            </button>
          ) : toToken?.isSui ? (
            // If to is SUI (because from is a token), show static SUI badge
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 20,
                background: 'var(--kappa-chip-bg)',
                border: '1px solid var(--kappa-chip-border)',
                color: 'var(--kappa-text)',
              }}
            >
              <img 
                src={SUI_LOGO} 
                alt="SUI" 
                style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                }} 
              />
              <span>SUI</span>
            </div>
          ) : (
            // If to is empty (default state), show "Select token" button (disabled if locked with defaultContract)
            <button
              onClick={() => {
                if (!lockContract) {
                  setTokenModalPosition('to');
                  setShowTokenModal(true);
                }
              }}
              onMouseEnter={(e) => {
                if (!(lockContract && defaultContract)) {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 20,
                background: lockContract && defaultContract ? 'var(--kappa-chip-bg)' : 'var(--kappa-primary)',
                border: lockContract && defaultContract ? '1px solid var(--kappa-chip-border)' : '1px solid var(--kappa-primary)',
                cursor: lockContract && defaultContract ? 'not-allowed' : 'pointer',
                opacity: lockContract && defaultContract ? 0.7 : 1,
                color: lockContract && defaultContract ? 'var(--kappa-text)' : 'var(--kappa-text-on-primary)',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              <span>{lockContract && defaultContract ? 'Loading...' : 'Select token'}</span>
              {!(lockContract && defaultContract) && <span style={{ fontSize: 10 }}>▼</span>}
            </button>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleExecuteSwap}
        disabled={!account || !fromAmount || txLoading || (!toToken && !fromToken)}
        onMouseEnter={(e) => {
          if (account && fromAmount && !txLoading && (toToken || fromToken)) {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = 'var(--kappa-shadow-primary)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onMouseDown={(e) => {
          if (account && fromAmount && !txLoading && (toToken || fromToken)) {
            e.currentTarget.style.transform = 'scale(0.98)';
          }
        }}
        onMouseUp={(e) => {
          if (account && fromAmount && !txLoading && (toToken || fromToken)) {
            e.currentTarget.style.transform = 'scale(1.02)';
          }
        }}
        style={{
          width: '100%',
          padding: 16,
          borderRadius: 12,
          background: (!account || !fromAmount || txLoading || (!toToken && !fromToken)) ? 'var(--kappa-chip-bg)' : 'var(--kappa-primary)',
          color: 'var(--kappa-text-on-primary)',
          border: 'none',
          cursor: (!account || !fromAmount || txLoading || (!toToken && !fromToken)) ? 'not-allowed' : 'pointer',
          fontSize: 16,
          fontWeight: 600,
          opacity: (!account || !fromAmount || txLoading || (!toToken && !fromToken)) ? 0.5 : 1,
          transition: 'all 0.2s ease',
          transform: 'scale(1)',
          boxShadow: 'none',
        }}
      >
        {txLoading ? 'Processing...' : 
         !account ? 'Connect Wallet' : 
         (!toToken || toToken === SUI_TOKEN) && (!fromToken || fromToken === SUI_TOKEN) ? 'Select a token' :
         !fromAmount ? 'Enter an amount' : 
         isBuy ? `Buy ${toToken?.symbol?.toUpperCase() || ''}` : 
         `Sell ${fromToken?.symbol?.toUpperCase() || ''}`}
      </button>

      {/* Token Select Modal */}
      <TokenSelectModal
        open={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSelect={handleTokenSelect}
        apiBase={apiBase}
        client={client}
      />

      {/* Slippage Modal */}
      <SlippageModal
        open={showSlippageModal}
        slippage={slippage}
        setSlippage={setSlippage}
        onClose={() => setShowSlippageModal(false)}
      />

      {/* Transaction Modal */}
      <TransactionModal
        open={txOpen}
        loading={txLoading}
        digest={txDigest}
        error={txError}
        spentLabel={isBuy ? `${fromAmount || 0} SUI` : `${fromAmount || 0} ${fromToken?.symbol || ''}`}
        forLabel={isBuy ? `${toToken?.symbol || ''}` : 'SUI'}
        receiveAmount={toAmount || '0'}
        onClose={() => {
          setTxOpen(false);
          setTxLoading(false);
          // Clear amounts when closing the modal after a successful transaction
          if (txDigest) {
            setFromAmount('');
            setToAmount('');
          }
        }}
      />

      {/* Powered by */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 16,
        gap: 4,
      }}>
        <span style={{ color: 'var(--kappa-muted)', fontSize: 12 }}>Powered by</span>
        <a
          href="https://kappa.meme"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--kappa-accent)',
            fontSize: 12,
            textDecoration: 'underline',
          }}
        >
          Kappa
        </a>
      </div>
    </div>
  );
}

export function WidgetV2Standalone(props: {
  theme?: Partial<Record<keyof typeof defaultTheme, string>>,
  defaultContract?: string,
  lockContract?: boolean,
  logoUrl?: string,
  projectName?: string,
  apiBase?: string,
  network?: any,
}) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <WidgetV2Embedded {...props} />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
