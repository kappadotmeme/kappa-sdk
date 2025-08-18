import type { SuiClient } from '@mysten/sui/client';

export interface NetworkConfig {
  bondingContract?: string;
  CONFIG?: string;
  globalPauseStatusObjectId?: string;
  poolsId?: string;
  lpBurnManger?: string;
}

export interface InitKappaConfig {
  client?: SuiClient;
  networkConfig?: NetworkConfig;
  logger?: (...args: any[]) => void;
}

export interface TransactionResult {
  success: boolean;
  digest?: string;
  effects?: any;
  objectChanges?: any[];
  error?: string;
  // Additional fields for createToken response
  treasuryCapObject?: any;
  coinMetadataObject?: any;
  publishedObject?: any;
  curve?: TransactionResult;
}

export type SignerLike = Uint8Array | any; // Accepts Uint8Array secret key or a Keypair-like signer

export interface CreateTokenParams {
  signerPrivateKey?: Uint8Array;
  signer?: SignerLike;
  name: string;
  symbol: string;
  description: string;
  icon: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  tags?: string[];
  maxTx?: boolean;
  firstBuy?: {
    suiInMist: number; // in MIST
    minTokensOut?: number;
  };
}

export interface BuyTokensParams {
  signerPrivateKey?: Uint8Array;
  signer?: SignerLike;
  contract?: string; // 0x..::Module::TOKEN
  packageId?: string;
  name?: string; // Module name (spaces allowed, underscores will be normalized)
  suiInMist: number; // in MIST
  minTokensOut?: number;
}

export interface SellTokensParams {
  signerPrivateKey?: Uint8Array;
  signer?: SignerLike;
  contract?: string; // 0x..::Module::TOKEN
  packageId?: string;
  name?: string;
  tokensIn: number | string | bigint; // token smallest units
  minSuiOut?: number; // in MIST
}

export interface ListCoinsOptions {
  apiBaseUrl?: string; // default https://api.kappa.fun
  apiKey?: string; // optional (kept open for now)
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface KappaClient {
  createToken(params: CreateTokenParams): Promise<TransactionResult>;
  buyTokens(params: BuyTokensParams): Promise<TransactionResult>;
  sellTokens(params: SellTokensParams): Promise<TransactionResult>;
  listCoins(opts?: ListCoinsOptions): Promise<any>;
  setSuiClient(client: SuiClient): void;
  setNetworkConfig(cfg: NetworkConfig): void;
  setLogger(fn?: (...args: any[]) => void): void;
  math: {
    firstBuyMath(sui_for_buy: number | string): number;
    buyMath(realCurve: any, sui_for_buy: number | string): number;
    sellMath(realCurve: any, sell_token_amount: number | string): number;
    calculateSuiForTokens(realCurve: any, desiredTokens: number): number;
    calculateSuiForFirstBuy(desiredTokens: number): number;
    calculatePriceImpact(realCurve: any, suiAmount: number): {
      currentPrice: number;
      effectivePrice: number;
      priceImpact: string;
      tokensReceived: number;
    };
    simulateCurveAfterDevBuy(devBuySuiAmount: number): any;
    calculateSuiForBundledPurchase(tokenAmount: number, devBuySuiAmount: number): number;
  };
}

export function initKappa(config?: InitKappaConfig): KappaClient;

export function createToken(params: CreateTokenParams): Promise<TransactionResult>;
export function buyTokens(params: BuyTokensParams): Promise<TransactionResult>;
export function sellTokens(params: SellTokensParams): Promise<TransactionResult>;
export function listCoins(opts?: ListCoinsOptions): Promise<any>;

export function firstBuyMath(sui_for_buy: number | string): number;
export function buyMath(realCurve: any, sui_for_buy: number | string): number;
export function sellMath(realCurve: any, sell_token_amount: number | string): number;
export function calculateSuiForTokens(realCurve: any, desiredTokens: number): number;
export function calculateSuiForFirstBuy(desiredTokens: number): number;
export function calculatePriceImpact(realCurve: any, suiAmount: number): {
  currentPrice: number;
  effectivePrice: number;
  priceImpact: string;
  tokensReceived: number;
};
export function simulateCurveAfterDevBuy(devBuySuiAmount: number): any;
export function calculateSuiForBundledPurchase(tokenAmount: number, devBuySuiAmount: number): number;

export function setSuiClient(client: SuiClient): void;
export function setNetworkConfig(cfg: NetworkConfig): void;
export function setLogger(fn?: (...args: any[]) => void): void;


