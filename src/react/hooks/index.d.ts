export interface ModuleConfig {
  bondingContract: string;
  CONFIG: string;
  globalPauseStatusObjectId: string;
  poolsId: string;
  lpBurnManger: string;
  moduleName: string;
}

export interface UseModuleConfigResult {
  config: ModuleConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useModuleConfig(
  factoryAddress: string | undefined,
  apiBase: string
): UseModuleConfigResult;

export function preloadFactoryConfigs(
  tokens: Array<{ factoryAddress?: string }>,
  apiBase: string
): Promise<void>;

export function clearModuleConfigCache(): void;
