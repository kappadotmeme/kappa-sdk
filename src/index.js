// Public SDK entry (browser-safe)
const { buyTokens, sellTokens } = require('./trade');
const { listCoins } = require('./api');
const { setSuiClient, setNetworkConfig, setLogger } = require('../kappa');

// Re-export math helpers
const {
    firstBuyMath,
    buyMath,
    sellMath,
    calculateSuiForTokens,
    calculateSuiForFirstBuy,
    calculatePriceImpact,
    simulateCurveAfterDevBuy,
    calculateSuiForBundledPurchase,
} = require('../math');

const initKappa = (config = {}) => {
    if (config.client) setSuiClient(config.client);
    if (config.networkConfig) setNetworkConfig(config.networkConfig);
    if (config.logger) setLogger(config.logger);
    return {
        buyTokens,
        sellTokens,
        listCoins,
        setSuiClient,
        setNetworkConfig,
        setLogger,
        math: {
            firstBuyMath,
            buyMath,
            sellMath,
            calculateSuiForTokens,
            calculateSuiForFirstBuy,
            calculatePriceImpact,
            simulateCurveAfterDevBuy,
            calculateSuiForBundledPurchase,
        },
    };
};

module.exports = {
    initKappa,
    buyTokens,
    sellTokens,
    listCoins,
    setSuiClient,
    setNetworkConfig,
    setLogger,
    firstBuyMath,
    buyMath,
    sellMath,
    calculateSuiForTokens,
    calculateSuiForFirstBuy,
    calculatePriceImpact,
    simulateCurveAfterDevBuy,
    calculateSuiForBundledPurchase,
    // React widget re-exports (from src/react)
    get WidgetStandalone() {
        try { return require('./react').WidgetStandalone; } catch { return undefined; }
    },
    get WidgetEmbedded() {
        try { return require('./react').WidgetEmbedded; } catch { return undefined; }
    },
};


