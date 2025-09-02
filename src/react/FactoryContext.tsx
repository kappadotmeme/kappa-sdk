// @ts-nocheck
import React, { createContext, useContext, useState, useCallback } from 'react';

// Types for factory configuration
export interface FactoryConfig {
  name: string;
  address: string;
  packageId: string;
  configAddress: string;
  pauseStatusAddress: string;
  poolsAddress: string;
  lpBurnManagerAddress: string;
  moduleName?: string;
  cachedAt?: number;
}

export interface FactoryContextType {
  factories: Map<string, FactoryConfig>;
  getFactoryConfig: (factoryAddress: string, apiBase: string) => Promise<FactoryConfig>;
  clearCache: () => void;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Create context
const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

// Provider component
export const FactoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [factories, setFactories] = useState<Map<string, FactoryConfig>>(new Map());

  const getFactoryConfig = useCallback(async (factoryAddress: string, apiBase: string): Promise<FactoryConfig> => {
    // Check cache first
    const cached = factories.get(factoryAddress);
    if (cached && cached.cachedAt && (Date.now() - cached.cachedAt < CACHE_DURATION)) {
      console.log('[FactoryContext] Using cached config for:', factoryAddress);
      return cached;
    }

    console.log('[FactoryContext] Fetching factory config for:', factoryAddress);
    
    try {
      // Fetch all factories and find the matching one
      const response = await fetch(`${apiBase}/v1/coins/factories`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch factories: ${response.statusText}`);
      }
      
      const json = await response.json();
      const factories = json?.data?.factories || [];
      
      // Find the matching factory by packageID
      const factoryData = factories.find((f: any) => 
        f.packageID === factoryAddress
      );
      
      if (!factoryData) {
        throw new Error(`No factory found with address: ${factoryAddress}`);
      }
      
      // Transform API response to our internal format
      const config: FactoryConfig = {
        name: factoryData.packageName || 'Unknown',
        address: factoryAddress,
        packageId: factoryData.packageID || factoryAddress,
        configAddress: factoryData.configObjectID,
        pauseStatusAddress: factoryData.pauseStatusObjectID,
        poolsAddress: factoryData.poolsObjectID,
        lpBurnManagerAddress: factoryData.lpBurnManagerObjectID,
        moduleName: factoryData.packageName || 'kappadotmeme', // Use packageName from API
        cachedAt: Date.now()
      };
      
      // Update cache
      setFactories(prev => {
        const newMap = new Map(prev);
        newMap.set(factoryAddress, config);
        return newMap;
      });
      
      console.log('[FactoryContext] Cached factory config:', config);
      return config;
      
    } catch (error) {
      console.error('[FactoryContext] Error fetching factory config:', error);
      
      // Return default Kappa config as fallback
      const defaultConfig: FactoryConfig = {
        name: 'Kappa',
        address: factoryAddress,
        packageId: '0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc',
        configAddress: '0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c',
        pauseStatusAddress: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
        poolsAddress: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
        lpBurnManagerAddress: '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845',
        moduleName: 'kappadotmeme',
        cachedAt: Date.now()
      };
      
      return defaultConfig;
    }
  }, [factories]);

  const clearCache = useCallback(() => {
    setFactories(new Map());
    console.log('[FactoryContext] Cache cleared');
  }, []);

  return (
    <FactoryContext.Provider value={{ factories, getFactoryConfig, clearCache }}>
      {children}
    </FactoryContext.Provider>
  );
};

// Custom hook to use the factory context
export const useFactoryConfig = () => {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error('useFactoryConfig must be used within a FactoryProvider');
  }
  return context;
};

// Standalone hook for components that need factory config
export const useTokenFactory = (tokenData: any, apiBase: string) => {
  const { getFactoryConfig } = useFactoryConfig();
  const [config, setConfig] = useState<FactoryConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!tokenData?.factoryAddress) {
      return;
    }

    let cancelled = false;

    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const factoryConfig = await getFactoryConfig(tokenData.factoryAddress, apiBase);
        if (!cancelled) {
          setConfig(factoryConfig);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch factory config');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, [tokenData?.factoryAddress, apiBase, getFactoryConfig]);

  return { config, loading, error };
};
