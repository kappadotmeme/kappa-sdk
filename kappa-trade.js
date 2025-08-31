const { Transaction } = require("@mysten/sui/transactions");
const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");
const { getTokenNetworkConfig, getDefaultFactory, factoryToNetworkConfig } = require("./src/factory-config");

const createSuiClient = () => {
    return new SuiClient({ url: getFullnodeUrl("mainnet") });
};

let client = createSuiClient();
let logger = null;
let apiBase = "https://api.kappa.fun";

// Default configuration (will be overridden by API values)
let bondingContract = "0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc";
let CONFIG = "0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c";
let globalPauseStatusObjectId = "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f";
let poolsId = "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0";
let lpBurnManger = "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845";
let moduleName = "kappadotmeme"; // Default module name

// Track if we've loaded from API
let configLoaded = false;

const setSuiClient = (customClient) => {
    client = customClient;
};

const setApiBase = (base) => {
    apiBase = base;
    console.log('[kappa-trade] API base updated to:', apiBase);
};

const setNetworkConfig = (cfg = {}) => {
    console.log('[kappa-trade] setNetworkConfig called with:', cfg);
    if (cfg.bondingContract) bondingContract = cfg.bondingContract;
    if (cfg.CONFIG) CONFIG = cfg.CONFIG;
    if (cfg.globalPauseStatusObjectId) globalPauseStatusObjectId = cfg.globalPauseStatusObjectId;
    if (cfg.poolsId) poolsId = cfg.poolsId;
    if (cfg.lpBurnManger) lpBurnManger = cfg.lpBurnManger;
    if (cfg.moduleName) moduleName = cfg.moduleName;
    configLoaded = true; // Mark as manually configured
    console.log('[kappa-trade] Network config updated:', {
        bondingContract,
        CONFIG,
        globalPauseStatusObjectId,
        poolsId,
        lpBurnManger,
        moduleName
    });
};

// Auto-load default factory configuration
const ensureFactoryConfig = async () => {
    if (configLoaded) return; // Skip if already configured
    
    try {
        console.log('[kappa-trade] Loading default factory configuration from API...');
        const factory = await getDefaultFactory(apiBase);
        const config = factoryToNetworkConfig(factory);
        
        if (config) {
            bondingContract = config.bondingContract;
            CONFIG = config.CONFIG;
            globalPauseStatusObjectId = config.globalPauseStatusObjectId;
            poolsId = config.poolsId;
            lpBurnManger = config.lpBurnManger;
            moduleName = config.moduleName;
            configLoaded = true;
            
            console.log('[kappa-trade] Loaded factory config:', factory.alias);
        }
    } catch (error) {
        console.error('[kappa-trade] Failed to load factory config:', error);
        // Keep default values
    }
};
const setLogger = (fn) => {
    logger = typeof fn === "function" ? fn : null;
};
const log = (...args) => {
    // Always log to console for debugging
    console.log('[kappa-trade]', ...args);
    if (logger) {
        try {
            logger(...args);
        } catch {}
    }
};

const buyWeb3 = async (ADMIN_CREDENTIAL, token) => {
    try {
        log("buyWeb3...");
        if (!ADMIN_CREDENTIAL) throw new Error("WALLET_NOT_CONNECTED");
        
        // Ensure factory config is loaded
        await ensureFactoryConfig();
        
        const isWallet = ADMIN_CREDENTIAL && typeof ADMIN_CREDENTIAL.signAndExecuteTransaction === "function";
        const adminKeypair =
            !isWallet && ADMIN_CREDENTIAL instanceof Uint8Array
                ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
                : ADMIN_CREDENTIAL;
        if (!isWallet && !(ADMIN_CREDENTIAL instanceof Uint8Array)) {
            throw new Error("INVALID_SIGNER");
        }
        const tx = new Transaction();

        // Support both old format (name) and new format (moduleName, typeName)
        let typeArgument;
        if (token.moduleName && token.typeName) {
            typeArgument = `${token.publishedObject.packageId}::${token.moduleName}::${token.typeName}`;
        } else {
            const formattedName = token.name.replaceAll(" ", "_");
            typeArgument = `${token.publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`;
        }
        const typeArguments = [typeArgument];
        log("buyWeb3 typeArgument:", typeArgument);

        const suiForBuy = Math.max(0, Math.floor(Number(token.sui) || 0));
        // Note: min_tokens from widget already has slippage applied, multiply by 0.9 for additional safety
        const maxTokens = Math.max(0, Math.floor((Number(token.min_tokens) || 0) * 0.9));

        log("Amounts:", { suiForBuy, maxTokens, originalMinTokens: token.min_tokens });
        
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiForBuy)]);

        const tokenAType = "0x2::sui::SUI";
        log("Fetching metadata for:", tokenAType, "and", typeArgument);
        
        let tokenAMetadata, tokenBMetadata;
        try {
            const tokenAMeta = await client.getCoinMetadata({ coinType: tokenAType });
            const tokenBMeta = await client.getCoinMetadata({ coinType: typeArgument });
            
            tokenAMetadata = tokenAMeta?.id;
            tokenBMetadata = tokenBMeta?.id;
            
            log("Metadata fetched:", {
                tokenA: tokenAMetadata,
                tokenB: tokenBMetadata,
                tokenAFull: tokenAMeta,
                tokenBFull: tokenBMeta
            });
            
            if (!tokenAMetadata) {
                throw new Error("SUI metadata ID not found");
            }
            if (!tokenBMetadata) {
                throw new Error(`Token metadata ID not found for ${typeArgument}`);
            }
        } catch (metadataError) {
            log("Error fetching metadata:", metadataError);
            throw new Error("Failed to fetch coin metadata: " + metadataError.message);
        }

        log("Transaction parameters:", {
            bondingContract,
            globalPauseStatusObjectId,
            poolsId,
            lpBurnManger,
            CONFIG,
            tokenAMetadata: tokenAMetadata,
            tokenBMetadata: tokenBMetadata,
            suiForBuy,
            maxTokens,
            typeArgument
        });

        // The module for the buy function is always the configured module (kappadotmeme), not the token module
        const moveCallTarget = `${bondingContract}::${moduleName}::buy`;
        const isExactOut = true; // This should be true based on web3ts.md
        
        log("Move call target:", moveCallTarget);
        log("Move call arguments:", {
            globalPauseStatusObjectId,
            poolsId,
            lpBurnManger,
            tokenAMetadataId: tokenAMetadata,
            tokenBMetadataId: tokenBMetadata,
            CONFIG,
            isExactOut,
            maxTokens,
            typeArgument
        });
        
        try {
            tx.moveCall({
                target: moveCallTarget,
                arguments: [
                    tx.object(globalPauseStatusObjectId),
                    tx.object(poolsId),
                    tx.object(lpBurnManger),
                    tx.object(tokenAMetadata),  // Already just the ID string
                    tx.object(tokenBMetadata),  // Already just the ID string
                    tx.object(CONFIG),
                    coin,
                    tx.pure.bool(isExactOut),
                    tx.pure.u64(maxTokens),
                    tx.object("0x6"),
                ],
                typeArguments,
            });
        } catch (moveCallError) {
            log("Error building move call:", moveCallError);
            throw moveCallError;
        }

        log("Attempting to sign and execute transaction...");
        const resData = isWallet
            ? await ADMIN_CREDENTIAL.signAndExecuteTransaction({
                  transaction: tx,
                  chain: "sui:mainnet",
                  options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              })
            : await client.signAndExecuteTransaction({
                  signer: adminKeypair,
                  transaction: tx,
                  options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              });

        log("buyWeb3 success", resData?.digest);
        return {
            success: true,
            digest: resData?.digest,
            effects: resData?.effects,
            objectChanges: resData?.objectChanges,
        };
    } catch (err) {
        log("buyWeb3 error:", err?.message || err);
        log("Error stack:", err?.stack);
        return { success: false, error: String(err?.message || err) };
    }
};

const sellWeb3 = async (ADMIN_CREDENTIAL, token) => {
    try {
        if (!ADMIN_CREDENTIAL) throw new Error("WALLET_NOT_CONNECTED");
        
        // Ensure factory config is loaded
        await ensureFactoryConfig();
        
        const isWallet = ADMIN_CREDENTIAL && typeof ADMIN_CREDENTIAL.signAndExecuteTransaction === "function";
        const adminKeypair =
            !isWallet && ADMIN_CREDENTIAL instanceof Uint8Array
                ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
                : ADMIN_CREDENTIAL;
        if (!isWallet && !(ADMIN_CREDENTIAL instanceof Uint8Array)) {
            throw new Error("INVALID_SIGNER");
        }
        log("sellWeb3...");
        const tx = new Transaction();

        const { publishedObject } = token;
        // Support both old format (name) and new format (moduleName, typeName)
        let typeArgument;
        if (token.moduleName && token.typeName) {
            typeArgument = `${publishedObject.packageId}::${token.moduleName}::${token.typeName}`;
        } else {
            const formattedName = token.name.replaceAll(" ", "_");
            typeArgument = `${publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`;
        }
        log("sellWeb3 typeArgument:", typeArgument);

        let allCoins = [];
        let temp,
            page = 0,
            hasNext = true,
            owner = isWallet ? ADMIN_CREDENTIAL.address : adminKeypair.toSuiAddress();
        while (hasNext && page < 30) {
            temp = await client.getCoins({
                owner,
                coinType: typeArgument,
                ...(temp?.nextCursor ? { cursor: temp.nextCursor } : {}),
            });
            allCoins.push(...(temp.data || []));
            hasNext = temp.hasNextPage;
            page++;
        }

        const selectedCoins = allCoins.filter((item) => Number(item.balance) > 0);
        if (!selectedCoins.length) {
            throw new Error("No coins with positive balance found for sell.");
        }

        if (selectedCoins.length > 1) {
            tx.mergeCoins(
                selectedCoins[0].coinObjectId,
                selectedCoins.slice(1, 301).map((item) => item.coinObjectId)
            );
        }

        const sellAmount = BigInt(token.sell_token || 0);
        const minSui = Math.floor(Number(token.min_sui) || 0);

        const [kappa_coin] = tx.splitCoins(selectedCoins[0].coinObjectId, [sellAmount]);
        const is_exact_out = true;

        // The module for the sell function is always the configured module (kappadotmeme), not the token module
        const moveCallTarget = `${bondingContract}::${moduleName}::sell_`;
        log("Sell move call target:", moveCallTarget);
        log("Sell typeArgument:", typeArgument);
        log("Sell amounts:", { sellAmount: sellAmount.toString(), minSui });
        
        const [coin] = tx.moveCall({
            target: moveCallTarget,
            arguments: [
                tx.object(CONFIG),
                kappa_coin,
                tx.pure.bool(is_exact_out),
                tx.pure.u64(minSui),
                tx.object("0x6"),
            ],
            typeArguments: [typeArgument],
        });

        tx.transferObjects([coin], owner);

        const resData = isWallet
            ? await ADMIN_CREDENTIAL.signAndExecuteTransaction({
                  transaction: tx,
                  chain: "sui:mainnet",
                  options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              })
            : await client.signAndExecuteTransaction({
                  signer: adminKeypair,
                  transaction: tx,
                  options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              });

        log("sellWeb3 success", resData?.digest);
        return {
            success: true,
            digest: resData?.digest,
            effects: resData?.effects,
            objectChanges: resData?.objectChanges,
        };
    } catch (err) {
        log("sellWeb3 error:", err?.message || err);
        return { success: false, error: String(err?.message || err) };
    }
};

module.exports = { buyWeb3, sellWeb3, setSuiClient, setNetworkConfig, setApiBase, setLogger, ensureFactoryConfig };
