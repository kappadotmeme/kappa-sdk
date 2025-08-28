// Module configuration for third-party integrations
export interface ModuleConfig {
  bondingContract?: string;
  CONFIG?: string;
  globalPauseStatusObjectId?: string;
  poolsId?: string;
  moduleName?: string;
  lpBurnManger?: string;
}

export type WidgetTheme = Record<string, string>;

export interface WidgetProps {
  theme?: Partial<WidgetTheme>;
  defaultContract?: string;
  lockContract?: boolean;
  logoUrl?: string;
  projectName?: string;
}

export declare function WidgetStandalone(props?: WidgetProps): JSX.Element;
export declare function WidgetEmbedded(props?: WidgetProps): JSX.Element;

export interface DeployerWidgetProps {
  network?: ModuleConfig;
  onSuccess?: (coinAddress: string) => void;
  defaultDevBuySui?: string;
  maxWidth?: number;
  logoUrl?: string;
  projectName?: string;
  theme?: Partial<WidgetTheme>;
}

export declare function DeployerWidgetStandalone(props?: DeployerWidgetProps): JSX.Element;
export declare function DeployerWidgetEmbedded(props?: DeployerWidgetProps): JSX.Element;
export declare function DeployerWidgetIntegrated(props?: DeployerWidgetProps): JSX.Element;

// Re-export the default export
declare const _default: typeof DeployerWidgetStandalone;
export default _default;