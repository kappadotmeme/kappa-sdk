/**
 * Factory Configuration Manager
 * Handles fetching and caching factory configurations from the Kappa API
 */

const factoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Fetches all available factories from the API
 * @param {string} apiBase - The API base URL (defaults to https://api.kappa.fun)
 * @returns {Promise<Array>} Array of factory configurations
 */
async function fetchFactories(apiBase = 'https://api.kappa.fun') {
    const cacheKey = `${apiBase}_factories`;
    const cached = factoryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('[factory-config] Using cached factories');
        return cached.data;
    }
    
    try {
        console.log('[factory-config] Fetching factories from:', `${apiBase}/v1/coins/factories`);
        const response = await fetch(`${apiBase}/v1/coins/factories`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch factories: ${response.statusText}`);
        }
        
        const json = await response.json();
        const factories = json?.data?.factories || [];
        
        console.log('[factory-config] Fetched factories:', factories.length);
        
        // Cache the result
        factoryCache.set(cacheKey, {
            data: factories,
            timestamp: Date.now()
        });
        
        return factories;
    } catch (error) {
        console.error('[factory-config] Error fetching factories:', error);
        // Return cached data if available, even if expired
        if (cached) {
            console.log('[factory-config] Using expired cache due to fetch error');
            return cached.data;
        }
        throw error;
    }
}

/**
 * Gets factory configuration by package ID
 * @param {string} packageId - The package ID to look up
 * @param {string} apiBase - The API base URL
 * @returns {Promise<Object|null>} Factory configuration or null if not found
 */
async function getFactoryByPackageId(packageId, apiBase = 'https://api.kappa.fun') {
    const factories = await fetchFactories(apiBase);
    return factories.find(f => f.packageID === packageId) || null;
}

/**
 * Gets factory configuration by alias (e.g., 'kappadotmeme', 'patara')
 * @param {string} alias - The factory alias
 * @param {string} apiBase - The API base URL
 * @returns {Promise<Object|null>} Factory configuration or null if not found
 */
async function getFactoryByAlias(alias, apiBase = 'https://api.kappa.fun') {
    const factories = await fetchFactories(apiBase);
    return factories.find(f => f.alias === alias) || null;
}

/**
 * Gets the default factory configuration (Kappa)
 * @param {string} apiBase - The API base URL
 * @returns {Promise<Object>} Default factory configuration
 */
async function getDefaultFactory(apiBase = 'https://api.kappa.fun') {
    const factory = await getFactoryByAlias('kappadotmeme', apiBase);
    if (!factory) {
        // Fallback to hardcoded values if API fails
        console.warn('[factory-config] Using fallback factory configuration');
        return {
            alias: 'kappadotmeme',
            displayName: 'Kappa',
            packageName: 'kappadotmeme',
            packageID: '0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc',
            configObjectID: '0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c',
            pauseStatusObjectID: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
            poolsObjectID: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
            lpBurnManagerObjectID: '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845'
        };
    }
    return factory;
}

/**
 * Converts factory configuration to network config format used by kappa.js and kappa-trade.js
 * @param {Object} factory - Factory configuration from API
 * @returns {Object} Network configuration object
 */
function factoryToNetworkConfig(factory) {
    if (!factory) return null;
    
    return {
        bondingContract: factory.packageID,
        CONFIG: factory.configObjectID,
        globalPauseStatusObjectId: factory.pauseStatusObjectID,
        poolsId: factory.poolsObjectID,
        lpBurnManger: factory.lpBurnManagerObjectID,
        moduleName: factory.packageName
    };
}

/**
 * Gets network configuration for a specific token
 * @param {string} tokenAddress - The token contract address
 * @param {string} apiBase - The API base URL
 * @returns {Promise<Object|null>} Network configuration or null
 */
async function getTokenNetworkConfig(tokenAddress, apiBase = 'https://api.kappa.fun') {
    try {
        // First try to get token metadata which should include factory address
        console.log('[factory-config] Fetching token metadata for:', tokenAddress);
        const response = await fetch(`${apiBase}/v1/coins/${encodeURIComponent(tokenAddress)}`);
        
        if (response.ok) {
            const json = await response.json();
            const tokenData = json?.data || json;
            
            if (tokenData?.factoryAddress) {
                // Look up factory by package ID
                const factory = await getFactoryByPackageId(tokenData.factoryAddress, apiBase);
                if (factory) {
                    console.log('[factory-config] Found factory for token:', factory.alias);
                    return factoryToNetworkConfig(factory);
                }
            }
        }
    } catch (error) {
        console.error('[factory-config] Error fetching token config:', error);
    }
    
    // Fallback to default factory
    console.log('[factory-config] Using default factory for token');
    const defaultFactory = await getDefaultFactory(apiBase);
    return factoryToNetworkConfig(defaultFactory);
}

/**
 * Clears the factory cache
 */
function clearCache() {
    factoryCache.clear();
    console.log('[factory-config] Cache cleared');
}

module.exports = {
    fetchFactories,
    getFactoryByPackageId,
    getFactoryByAlias,
    getDefaultFactory,
    factoryToNetworkConfig,
    getTokenNetworkConfig,
    clearCache
};
