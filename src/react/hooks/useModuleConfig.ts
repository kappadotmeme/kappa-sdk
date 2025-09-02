import { useState, useEffect, useCallback } from 'react';
import { PARTNERS } from '../config/partners';

// Module configuration type
export interface ModuleConfig {
  bondingContract: string;
  CONFIG: string;
  globalPauseStatusObjectId: string;
  poolsId: string;
  lpBurnManger: string;
  moduleName: string;
}

// Cache for module configs to avoid redundant API calls
const moduleConfigCache = new Map<string, { config: ModuleConfig; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch and cache module configuration based on factory address
 */
export function useModuleConfig(factoryAddress: string | undefined, apiBase: string) {
  const [config, setConfig] = useState<ModuleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModuleConfig = useCallback(async () => {
    if (!factoryAddress) {
      setConfig(null);
      return;
    }

    // Check cache first
    const cached = moduleConfigCache.get(factoryAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[useModuleConfig] Using cached config for:', factoryAddress);
      setConfig(cached.config);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Local registry first
      const key = String(factoryAddress).toLowerCase();
      if (PARTNERS[key]) {
        const local = PARTNERS[key] as unknown as ModuleConfig;
        moduleConfigCache.set(factoryAddress, { config: local, timestamp: Date.now() });
        setConfig(local);
        setLoading(false);
        return;
      }

      // 2) Remote API as fallback
      console.log('[useModuleConfig] Fetching config for factory:', factoryAddress);
      const response = await fetch(`${apiBase}/v1/coins/factories/${factoryAddress}`);
      
      if (!response.ok) {
        // If factory endpoint fails, use default Kappa config
        console.warn('[useModuleConfig] Factory endpoint failed, using default config');
        const defaultConfig: ModuleConfig = {
          bondingContract: '0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc',
          CONFIG: '0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c',
          globalPauseStatusObjectId: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
          poolsId: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
          lpBurnManger: '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845',
          moduleName: 'kappadotmeme'
        };
        setConfig(defaultConfig);
        return;
      }

      const data = await response.json();
      const factoryData = data.data || data;

      // Map API response to our module config format
      const moduleConfig: ModuleConfig = {
        bondingContract: factoryData.address || factoryData.packageId,
        CONFIG: factoryData.configAddress || factoryData.configId,
        globalPauseStatusObjectId: factoryData.pauseStatusAddress || factoryData.pauseStatusObjectId || '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
        poolsId: factoryData.poolsAddress || factoryData.poolsId || '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
        lpBurnManger: factoryData.lpBurnManagerAddress || factoryData.lpBurnManger || '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845',
        moduleName: factoryData.moduleName || 'kappadotmeme'
      };

      // Cache the config
      moduleConfigCache.set(factoryAddress, {
        config: moduleConfig,
        timestamp: Date.now()
      });

      console.log('[useModuleConfig] Fetched and cached config:', moduleConfig);
      setConfig(moduleConfig);
    } catch (err) {
      console.error('[useModuleConfig] Error fetching config:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch module config');
      
      // Fallback to default config on error
      const defaultConfig: ModuleConfig = {
        bondingContract: '0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc',
        CONFIG: '0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c',
        globalPauseStatusObjectId: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
        poolsId: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
        lpBurnManger: '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845',
        moduleName: 'kappadotmeme'
      };
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, [factoryAddress, apiBase]);

  useEffect(() => {
    fetchModuleConfig();
  }, [fetchModuleConfig]);

  return { config, loading, error, refetch: fetchModuleConfig };
}

/**
 * Preload factory configs for a list of tokens
 * Useful for preloading configs when displaying token lists
 */
export async function preloadFactoryConfigs(tokens: any[], apiBase: string) {
  const uniqueFactories = new Set(tokens.map(t => t.factoryAddress).filter(Boolean));
  
  const promises = Array.from(uniqueFactories).map(async (factoryAddress) => {
    // Skip if already cached and fresh
    const cached = moduleConfigCache.get(factoryAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return;
    }

    try {
      const response = await fetch(`${apiBase}/v1/coins/factories/${factoryAddress}`);
      if (response.ok) {
        const data = await response.json();
        const factoryData = data.data || data;
        
        const moduleConfig: ModuleConfig = {
          bondingContract: factoryData.address || factoryData.packageId,
          CONFIG: factoryData.configAddress || factoryData.configId,
          globalPauseStatusObjectId: factoryData.pauseStatusAddress || '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
          poolsId: factoryData.poolsAddress || '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
          lpBurnManger: factoryData.lpBurnManagerAddress || '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845',
          moduleName: factoryData.moduleName || 'kappadotmeme'
        };
        
        moduleConfigCache.set(factoryAddress, {
          config: moduleConfig,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error(`[preloadFactoryConfigs] Error loading config for ${factoryAddress}:`, err);
    }
  });

  await Promise.all(promises);
  console.log(`[preloadFactoryConfigs] Preloaded configs for ${uniqueFactories.size} factories`);
}

/**
 * Clear the module config cache
 */
export function clearModuleConfigCache() {
  moduleConfigCache.clear();
  console.log('[clearModuleConfigCache] Cache cleared');
}
