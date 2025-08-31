import { useState, useEffect } from 'react';

interface Factory {
  alias: string;
  displayName: string;
  imageUrl?: string;
  siteUrl?: string;
  xUrl?: string;
  packageName: string;
  packageID: string;
  configObjectID: string;
  pauseStatusObjectID: string;
  poolsObjectID: string;
  lpBurnManagerObjectID: string;
}

interface NetworkConfig {
  bondingContract: string;
  CONFIG: string;
  globalPauseStatusObjectId: string;
  poolsId: string;
  lpBurnManger: string;
  moduleName: string;
}

// Cache for factory configurations
const factoryCache = new Map<string, { data: Factory[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch and cache factory configurations
 */
export function useFactoryConfig(apiBase: string = 'https://api.kappa.fun') {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFactories = async () => {
      const cacheKey = `${apiBase}_factories`;
      const cached = factoryCache.get(cacheKey);
      
      // Use cached data if available and not expired
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setFactories(cached.data);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${apiBase}/v1/coins/factories`);
        if (!response.ok) {
          throw new Error(`Failed to fetch factories: ${response.statusText}`);
        }
        
        const json = await response.json();
        const factoriesData = json?.data?.factories || [];
        
        // Cache the result
        factoryCache.set(cacheKey, {
          data: factoriesData,
          timestamp: Date.now()
        });
        
        setFactories(factoriesData);
      } catch (err) {
        console.error('[useFactoryConfig] Error fetching factories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch factories');
        
        // Use cached data if available, even if expired
        if (cached) {
          setFactories(cached.data);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchFactories();
  }, [apiBase]);

  /**
   * Get factory by package ID
   */
  const getFactoryByPackageId = (packageId: string): Factory | null => {
    return factories.find(f => f.packageID === packageId) || null;
  };

  /**
   * Get factory by alias
   */
  const getFactoryByAlias = (alias: string): Factory | null => {
    return factories.find(f => f.alias === alias) || null;
  };

  /**
   * Convert factory to network config format
   */
  const factoryToNetworkConfig = (factory: Factory | null): NetworkConfig | null => {
    if (!factory) return null;
    
    return {
      bondingContract: factory.packageID,
      CONFIG: factory.configObjectID,
      globalPauseStatusObjectId: factory.pauseStatusObjectID,
      poolsId: factory.poolsObjectID,
      lpBurnManger: factory.lpBurnManagerObjectID,
      moduleName: factory.packageName
    };
  };

  /**
   * Get network config for a specific factory address
   */
  const getNetworkConfig = (factoryAddress: string): NetworkConfig | null => {
    const factory = getFactoryByPackageId(factoryAddress);
    return factoryToNetworkConfig(factory);
  };

  return {
    factories,
    loading,
    error,
    getFactoryByPackageId,
    getFactoryByAlias,
    getNetworkConfig,
    factoryToNetworkConfig
  };
}

/**
 * Clear the factory cache
 */
export function clearFactoryCache() {
  factoryCache.clear();
}
