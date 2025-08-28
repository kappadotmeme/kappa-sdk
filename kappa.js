// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
const { bcs } = require("@mysten/bcs");
const { Transaction } = require("@mysten/sui/transactions");
const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");
const { toB64, fromB64 } = require("@mysten/sui/utils");

/**
 * Creates a SuiClient with optimal RPC endpoint configuration.
 * Falls back to default mainnet fullnode URL.
 */
const createSuiClient = () => {
    return new SuiClient({ url: getFullnodeUrl("mainnet") });
};

let client = createSuiClient();
let logger = null; // optional injected logger

// Default network config (mainnet)
let bondingContract = "0x32fb837874e2d42a77b77a058e170024daadc54245b29b5b8a684b0540010fbb";
let CONFIG = "0x93fbfbbe2f65326332a68ee930c069f8e3816f03c8a9f978ec5ce9c82cdae4b0";
let globalPauseStatusObjectId = "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f";
let poolsId = "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0";
let lpBurnManger = "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845";

// Allow SDK users to inject their own client and/or network constants
const setSuiClient = (customClient) => {
    client = customClient;
};
const setNetworkConfig = (cfg = {}) => {
    if (cfg.bondingContract) bondingContract = cfg.bondingContract;
    if (cfg.CONFIG) CONFIG = cfg.CONFIG;
    if (cfg.globalPauseStatusObjectId) globalPauseStatusObjectId = cfg.globalPauseStatusObjectId;
    if (cfg.poolsId) poolsId = cfg.poolsId;
    if (cfg.lpBurnManger) lpBurnManger = cfg.lpBurnManger;
};
const setLogger = (fn) => {
    logger = typeof fn === "function" ? fn : null;
};

const log = (...args) => {
    if (logger) {
        try {
            logger(...args);
        } catch {}
    }
};

/**
 * Updates the Move bytecode template for a custom coin with provided token data.
 *
 * This function:
 *   - Loads a base Move bytecode template for a coin.
 *   - Replaces address identifiers and string constants (name, symbol, description, icon) in the bytecode
 *     with values from the given tokenData object.
 *   - Returns the updated bytecode ready for publishing.
 *
 * @param {Object} tokenData - The token configuration object containing:
 *   - name: The name of the coin.
 *   - symbol: The symbol of the coin.
 *   - description: The description of the coin.
 *   - icon: The icon URL or data for the coin.
 * @returns {Uint8Array} The updated Move bytecode as a Uint8Array.
 */
const updateTemplate = async (tokenData) => {
    console.log('[kappa.js] updateTemplate called with:', tokenData);
    
    // Lazy-load WASM module only when needed (avoids bundling in browser UIs)
    let wasm;
    try {
        wasm = require("./move-bytecode/move_bytecode");
        
        // In browser environment, we need to initialize WASM first
        if (typeof window !== 'undefined' && wasm.initWasm && !wasm.__wasm) {
            console.log('[kappa.js] Initializing WASM for browser environment...');
            // Try several strategies to locate the WASM bytes when consumed from npm
            const loadWasmBytes = async () => {
                const candidates = [];
                // App-provided override via global for frameworks that need a custom path
                try { if (typeof globalThis !== 'undefined' && globalThis.KAPPA_WASM_URL) candidates.push(String(globalThis.KAPPA_WASM_URL)); } catch {}
                // Common public-root paths for apps that copy the asset
                candidates.push('/move_bytecode.wasm');
                candidates.push('/move-bytecode/move_bytecode.wasm');
                // Attempt each candidate
                for (const url of candidates) {
                    try {
                        const resp = await fetch(url);
                        if (resp && resp.ok) {
                            const bytes = await resp.arrayBuffer();
                            // Heuristic: first 4 bytes should be \x00asm
                            const view = new Uint8Array(bytes, 0, 4);
                            if (view[0] === 0x00 && view[1] === 0x61 && view[2] === 0x73 && view[3] === 0x6d) {
                                return bytes;
                            }
                        }
                    } catch {}
                }
                throw new Error('move_bytecode.wasm not found. Ensure your app serves the wasm or set window.KAPPA_WASM_URL to its URL.');
            };
            const wasmBytes = await loadWasmBytes();
            await wasm.initWasm(wasmBytes);
            console.log('[kappa.js] WASM initialized successfully');
        }
        
        console.log('[kappa.js] WASM module loaded successfully');
    } catch (e) {
        console.error('[kappa.js] Failed to load WASM module:', e);
        throw new Error('Failed to load WASM module: ' + e.message);
    }
    
    // Get TextEncoder from various sources
    let encoder;
    
    console.log('[kappa.js] Starting TextEncoder detection...');
    console.log('[kappa.js] typeof TextEncoder:', typeof TextEncoder);
    console.log('[kappa.js] typeof globalThis:', typeof globalThis);
    console.log('[kappa.js] typeof window:', typeof window);
    console.log('[kappa.js] typeof global:', typeof global);
    
    // Try different ways to get TextEncoder
    try {
        // First try the most direct approach - check if TextEncoder exists globally
        if (typeof TextEncoder !== 'undefined') {
            console.log('[kappa.js] Found TextEncoder globally, attempting to create instance...');
            console.log('[kappa.js] TextEncoder constructor:', TextEncoder);
            console.log('[kappa.js] TextEncoder.prototype:', TextEncoder.prototype);
            encoder = new TextEncoder();
            console.log('[kappa.js] Successfully created TextEncoder instance');
        } else if (typeof globalThis !== 'undefined' && globalThis.TextEncoder) {
            console.log('[kappa.js] Found TextEncoder on globalThis');
            encoder = new globalThis.TextEncoder();
        } else if (typeof window !== 'undefined') {
            // eslint-disable-next-line no-undef
            if (window.TextEncoder) {
                console.log('[kappa.js] Found TextEncoder on window');
                // eslint-disable-next-line no-undef
                encoder = new window.TextEncoder();
            }
        } else if (typeof global !== 'undefined' && global.TextEncoder) {
            console.log('[kappa.js] Found TextEncoder on global');
            encoder = new global.TextEncoder();
        } else {
            console.log('[kappa.js] TextEncoder not found, trying Node.js util module...');
            // Fallback to Node.js util module
            const util = require('util');
            encoder = new util.TextEncoder();
        }
    } catch (e) {
        console.error('[kappa.js] Failed to create TextEncoder:', e);
        console.error('[kappa.js] Error name:', e.name);
        console.error('[kappa.js] Error message:', e.message);
        console.error('[kappa.js] Error stack:', e.stack);
        
        // Last resort - try to get it from any available global
        const availableGlobal = 
            (typeof globalThis !== 'undefined' && globalThis) ||
            // eslint-disable-next-line no-undef
            (typeof window !== 'undefined' && window) ||
            (typeof global !== 'undefined' && global) ||
            {};
        
        console.log('[kappa.js] Available global:', availableGlobal);
        console.log('[kappa.js] Available global.TextEncoder:', availableGlobal.TextEncoder);
        
        if (availableGlobal.TextEncoder) {
            try {
                console.log('[kappa.js] Attempting to create TextEncoder from available global...');
                encoder = new availableGlobal.TextEncoder();
                console.log('[kappa.js] Successfully created TextEncoder from available global');
            } catch (e2) {
                console.error('[kappa.js] Failed to create TextEncoder from global:', e2);
                throw new Error('TextEncoder is not available. Please ensure you are running in a modern browser environment.');
            }
        } else {
            throw new Error('TextEncoder is not available in any form. Please ensure you are running in a modern browser environment.');
        }
    }
    const bytecode =
        "oRzrCwYAAAAKAQAMAgweAyonBFEIBVlXB7AB1gEIhgNgBuYDJAqKBAUMjwQsAAcBDAIGAhECEgITAAACAAECBwEAAAIBDAEAAQIDDAEAAQQEAgAFBQcAAAoAAQABEAUGAQACCAgJAQIDDQUBAQwDDg4BAQwEDwsMAAULAwQAAQQCBwMKBA0CCAAHCAQAAgsDAQgACwIBCAABCgIBCAUBCQABCwEBCQABCAAHCQACCgIKAgoCCwEBCAUHCAQCCwMBCQALAgEJAAELAgEIAAEGCAQBBQELAwEIAAIJAAUNQ09JTl9URU1QTEFURQxDb2luTWV0YWRhdGEGT3B0aW9uC1RyZWFzdXJ5Q2FwCVR4Q29udGV4dANVcmwEY29pbg1jb2luX3RlbXBsYXRlD2NyZWF0ZV9jdXJyZW5jeQtkdW1teV9maWVsZARpbml0FW5ld191bnNhZmVfZnJvbV9ieXRlcwZvcHRpb24UcHVibGljX2ZyZWV6ZV9vYmplY3QPcHVibGljX3RyYW5zZmVyBnNlbmRlcgRzb21lCHRyYW5zZmVyCnR4X2NvbnRleHQDdXJsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCgIGBXNfc3VpCgIGBW5fc3VpCgIGBWRfc3VpCgIGBXVfc3VpAAIBCQEAAAAAAhQLADEJBwAHAQcCBwMRBjgACgE4AQwDDAILAzgCCwILAS4RBTgDAgA=";

    const d = wasm.deserialize(fromB64(bytecode));
    d.address_identifiers[0] = "0000000000000000000000000000000000000000000000000000000000000000";
    let updated = wasm.serialize(d);
    const formattedName = tokenData.name.replaceAll(" ", "_");

    updated = wasm.update_identifiers(updated, {
        COIN_TEMPLATE: formattedName.toUpperCase(),
        coin_template: formattedName,
    });

    // Helper for updating constants
    const updateConstant = (value, placeholder) =>
        wasm.update_constants(
            updated,
            bcs.vector(bcs.u8()).serialize(encoder.encode(value)).toBytes(),
            bcs.vector(bcs.u8()).serialize(encoder.encode(placeholder)).toBytes(),
            "Vector(U8)"
        );

    // Update name/symbol
    updated = updateConstant(tokenData.symbol, "s_sui");
    updated = updateConstant(tokenData.name, "n_sui");
    // Update description and icon
    updated = updateConstant(tokenData.description, "d_sui");
    updated = updateConstant(tokenData.icon, "u_sui");

    return updated;
};

/**
 * Deploys a new custom coin on the Sui blockchain.
 *
 * This function:
 *   - Accepts an admin's Ed25519 private key and a token configuration object.
 *   - Uses the provided token data to generate and update the Move bytecode template for the new coin.
 *   - Publishes the new coin's Move module to the blockchain.
 *   - Transfers the upgrade capability to the admin address.
 *   - Signs and executes the transaction using the admin's keypair.
 *   - Extracts and returns the published package object, treasury cap object, and coin metadata object from the transaction result.
 *
 * @param {Uint8Array} ADMIN_PRIVATE_KEY - The admin's Ed25519 private key as a Uint8Array.
 * @param {Object} token - The token configuration object, containing fields such as name, symbol, description, and icon.
 * @returns {Promise<Object>} An object with:
 *   - success: Boolean indicating if the operation succeeded.
 *   - treasuryCapObject: The treasury cap object for the new coin.
 *   - coinMetadataObject: The coin metadata object for the new coin.
 *   - publishedObject: The published package object for the new coin.
 */
const createCoinWeb3 = async (ADMIN_CREDENTIAL, token) => {
    console.log('[kappa.js] createCoinWeb3 called');
    console.log('[kappa.js] About to call updateTemplate...');
    try {
        const adminKeypair =
            ADMIN_CREDENTIAL instanceof Uint8Array ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL) : ADMIN_CREDENTIAL; // assume signer/keypair compatible

        const tx = new Transaction();
        console.log('[kappa.js] Calling updateTemplate with token:', token);
        const updatedBytecode = await updateTemplate(token);
        const [upgradeCap] = tx.publish({
            modules: [toB64(updatedBytecode)],
            dependencies: ["0x1", "0x2"],
        });
        tx.transferObjects([upgradeCap], "0x0");

        const isWallet = adminKeypair && typeof adminKeypair.signAndExecuteTransaction === "function";
        const resData = isWallet
            ? await adminKeypair.signAndExecuteTransaction({
                  transaction: tx,
                  chain: "sui:mainnet",
                  options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              })
            : await client.signAndExecuteTransaction({
                  signer: adminKeypair,
                  transaction: tx,
                  options: {
                      showRawEffects: true,
                      showEffects: true,
                      showObjectChanges: true,
                  },
              });

        console.log("Full transaction response:", resData);
        
        // Parse the effects to get object changes
        let objectChanges = resData?.objectChanges || [];
        
        // If objectChanges is empty, try to parse from rawEffects
        if ((!objectChanges || objectChanges.length === 0) && resData?.rawEffects) {
            try {
                // rawEffects is an array that needs to be parsed
                const effects = resData.rawEffects;
                console.log("Parsing rawEffects:", effects);
                
                // The rawEffects contains created objects, we need to extract them
                // This is a simplified parser - in production you'd want a more robust solution
                if (Array.isArray(effects)) {
                    // Look for created objects in the effects
                    // The structure varies, but typically created objects are in specific positions
                    objectChanges = [];
                    
                    // Try to find published package
                    // In Sui effects, published packages are typically marked differently
                    // For now, we'll create mock objects with the data we need
                    // You'll need to parse the actual effects structure based on Sui's format
                }
            } catch (e) {
                console.error("Failed to parse rawEffects:", e);
            }
        }
        
        console.log("objectChanges:", objectChanges);
        
        // If we still don't have objectChanges, we need to construct them from the transaction
        // For a coin publish transaction, we know what was created
        if (objectChanges.length === 0 && resData?.digest) {
            // We'll need to fetch the transaction details to get the created objects
            console.log("No objectChanges found, will fetch transaction details");
            
            // For now, return the digest and let the caller handle fetching details
            return {
                success: true,
                digest: resData?.digest,
                effects: resData?.effects || resData?.rawEffects,
                objectChanges: undefined,
                needsFetch: true, // Flag to indicate we need to fetch transaction details
            };
        }
        
        const publishedObject = objectChanges.find((item) => item?.type === "published");
        const treasuryCapObject = objectChanges.find((item) => 
            item?.objectType?.includes("TreasuryCap") || 
            item?.type?.includes("TreasuryCap")
        );
        const coinMetadataObject = objectChanges.find((item) => 
            item?.objectType?.includes("CoinMetadata") || 
            item?.type?.includes("CoinMetadata")
        );

        log("publishedObject success", publishedObject);
        log("treasuryCapObject success", treasuryCapObject);
        log("coinMetadataObject success", coinMetadataObject);
        log("signAndExecuteTransaction success", resData);

        return {
            success: true,
            digest: resData?.digest,
            effects: resData?.effects,
            objectChanges: resData?.objectChanges,
            treasuryCapObject,
            coinMetadataObject,
            publishedObject,
        };
    } catch (err) {
        log("createCoinWeb3 error", err?.message || err);
        return { success: false, error: String(err?.message || err) };
    }
};

/**
 * Creates a bonding curve for a specified token using the bonding contract.
 *
 * This function:
 *   - Authenticates with the provided admin private key.
 *   - Formats the token type argument for the transaction.
 *   - Prepares comprehensive metadata including social media links and tags.
 *   - Calls the bonding contract's `create` function with the appropriate arguments and type arguments.
 *   - Signs and executes the transaction, returning true on success or false on error.
 *
 * @param {Uint8Array} ADMIN_PRIVATE_KEY - The admin's Ed25519 private key as a Uint8Array.
 * @param {Object} token - The token object containing:
 *   - {Object} treasuryCapObject: The treasury cap object for the token.
 *   - {Object} coinMetadataObject: The coin metadata object for the token.
 *   - {Object} publishedObject: The published package info for the token.
 *   - {string} name: The token's name.
 *   - {string} description: The token's description.
 *   - {Array<string>} tags: The token's tags.
 *   - {string} website: The token's website URL.
 *   - {string} twitter: The token's Twitter URL.
 *   - {string} telegram: The token's Telegram URL.
 *   - {string|boolean} maxTx: Whether max transaction is enabled.
 * @returns {Promise<boolean>} True if the transaction succeeded, false otherwise.
 */
const createCurveWeb3 = async (ADMIN_CREDENTIAL, token) => {
    try {
        const adminKeypair =
            ADMIN_CREDENTIAL instanceof Uint8Array ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL) : ADMIN_CREDENTIAL;

        log("createCurveWeb3...", token?.name || "token");
        const tx = new Transaction();

        const { treasuryCapObject, coinMetadataObject, publishedObject } = token;
        
        // Get the global IDs from token or use module defaults
        const globalPauseStatusObjectIdToUse = token.globalPauseStatusObjectId || globalPauseStatusObjectId;
        const poolsIdToUse = token.poolsId || poolsId;
        const CONFIGToUse = token.CONFIG || CONFIG;
        const bondingContractToUse = token.bondingContract || bondingContract;

        if (process.env.NODE_ENV !== "production") {
            console.log("treasuryCapObject", treasuryCapObject);
            console.log("publishedObject", publishedObject);
            console.log("coinMetadataObject", coinMetadataObject);
            console.log("globalPauseStatusObjectId", globalPauseStatusObjectIdToUse);
            console.log("poolsId", poolsIdToUse);
            console.log("CONFIG", CONFIGToUse);
            console.log("bondingContract", bondingContractToUse);
        }

        const formattedName = token.name.replaceAll(" ", "_");
        const typeArguments = [`${publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`];

        const maxTx = token.maxTx !== "false";
        console.log('Creating curve - maxTx value:', token.maxTx, '-> boolean:', maxTx);

        // Create comprehensive metadata matching the platform's format
        const metadata = JSON.stringify({
            description: token.description || "",
            siteUrl: token.website || "",
            tgUrl: token.telegram || "",
            xUrl: token.twitter || "",
            tags: token.tags || [],
        });

        // Ensure we have the correct object IDs
        const treasuryCapId = treasuryCapObject.objectId || treasuryCapObject.id;
        const coinMetadataId = coinMetadataObject.objectId || coinMetadataObject.id;
        
        if (!treasuryCapId || !coinMetadataId) {
            throw new Error('Missing required object IDs for curve creation');
        }
        
        // Allow custom module name, default to 'kappadotmeme'
        const moduleName = token.moduleName || 'kappadotmeme';
        
        console.log('Creating curve with module:', moduleName);
        console.log('Full target:', `${bondingContractToUse}::${moduleName}::create`);
        
        tx.moveCall({
            target: `${bondingContractToUse}::${moduleName}::create`,
            arguments: [
                tx.object(CONFIGToUse),
                tx.object(globalPauseStatusObjectIdToUse),
                tx.object(poolsIdToUse),
                tx.object(treasuryCapId),
                tx.object(coinMetadataId),
                tx.pure.string(metadata),
                tx.pure.bool(maxTx),
                tx.object("0x6"),
            ],
            typeArguments,
        });
        
        // Set a reasonable gas budget
        tx.setGasBudget(100000000); // 0.1 SUI

        const isWallet = adminKeypair && typeof adminKeypair.signAndExecuteTransaction === "function";
        const resData = isWallet
            ? await adminKeypair.signAndExecuteTransaction({
                  transaction: tx,
                  chain: "sui:mainnet",
                  options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              })
            : await client.signAndExecuteTransaction({
                  signer: adminKeypair,
                  transaction: tx,
                  options: {
                      showRawEffects: true,
                      showEffects: true,
                      showObjectChanges: true,
                  },
              });

        log("createCurveWeb3 success", resData?.digest);
        return {
            success: true,
            digest: resData?.digest,
            effects: resData?.effects,
            objectChanges: resData?.objectChanges,
        };
    } catch (err) {
        log("createCurveWeb3 error", err?.message || err);
        return { success: false, error: String(err?.message || err) };
    }
};

/**
 * Executes the initial buy transaction for a specified token using the bonding contract.
 *
 * This function:
 *   - Authenticates with the provided admin private key.
 *   - Formats the token type argument for the transaction.
 *   - Calculates the amount of SUI to use for the purchase and the maximum number of tokens to buy (90% of min_tokens).
 *   - Splits the required amount of SUI from the transaction gas.
 *   - Calls the bonding contract's `first_buy` function with the appropriate arguments and type arguments.
 *   - Signs and executes the transaction, returning true on success or false on error.
 *
 * @param {Uint8Array} ADMIN_PRIVATE_KEY - The admin's Ed25519 private key as a Uint8Array.
 * @param {Object} token - The token object containing:
 *   - {Object} publishedObject: The published package info for the token.
 *   - {string} name: The token's name.
 *   - {string|number} sui: The amount of SUI to use for the purchase.
 *   - {string|number} min_tokens: The minimum number of tokens to buy.
 * @returns {Promise<boolean>} True if the transaction succeeded, false otherwise.
 */
const firstBuyWeb3 = async (ADMIN_CREDENTIAL, token) => {
    try {
        const adminKeypair =
            ADMIN_CREDENTIAL instanceof Uint8Array ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL) : ADMIN_CREDENTIAL;
        log("firstBuyWeb3...");
        const tx = new Transaction();
        const { publishedObject } = token;

        // Get the IDs from token or use module defaults
        const CONFIGToUse = token.CONFIG || CONFIG;
        const bondingContractToUse = token.bondingContract || bondingContract;

        // Use replaceAll for consistency with other functions
        const formattedName = token.name.replaceAll(" ", "_");
        const typeArguments = [`${publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`];

        // Use Math.floor for integer values, fallback to 0 if undefined
        const sui_for_buy = Math.floor(Number(token.sui) || 0);
        const max_tokens = Math.floor(Number(token.min_tokens) || 0); // min_tokens already has slippage applied

        if (sui_for_buy <= 0) {
            throw new Error('Invalid SUI amount for first buy: ' + sui_for_buy);
        }

        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_for_buy)]);
        
        // Allow custom module name, default to 'kappadotmeme'
        const moduleName = token.moduleName || 'kappadotmeme';
        
        console.log('First buy with module:', moduleName);
        console.log('Full target:', `${bondingContractToUse}::${moduleName}::first_buy`);
        console.log('SUI amount:', sui_for_buy);
        console.log('Max tokens:', max_tokens);
        
        // Note: is_exact_out = true as per deployer-exmaple.md
        const is_exact_out = true;
        
        console.log('First buy parameters:');
        console.log('  is_exact_out:', is_exact_out);
        console.log('  coin amount (MIST):', sui_for_buy);
        console.log('  min_tokens expected:', max_tokens);
        
        tx.moveCall({
            target: `${bondingContractToUse}::${moduleName}::first_buy`,
            arguments: [
                tx.object(CONFIGToUse),
                coin,
                tx.pure.bool(is_exact_out),
                tx.pure.u64(max_tokens),
                tx.object("0x6"),
            ],
            typeArguments,
        });
        
        // Set gas budget (0.1 SUI)
        tx.setGasBudget(100000000);

        const isWallet = adminKeypair && typeof adminKeypair.signAndExecuteTransaction === "function";
        const resData = isWallet
            ? await adminKeypair.signAndExecuteTransaction({
                  transaction: tx,
                  chain: "sui:mainnet",
                  options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              })
            : await client.signAndExecuteTransaction({
                  signer: adminKeypair,
                  transaction: tx,
                  options: {
                      showRawEffects: true,
                      showEffects: true,
                      showObjectChanges: true,
                  },
              });

        log("firstBuyWeb3 success", resData?.digest);
        return {
            success: true,
            digest: resData?.digest,
            effects: resData?.effects,
            objectChanges: resData?.objectChanges,
        };
    } catch (err) {
        console.error("firstBuyWeb3 error:", err);
        console.error("Error details:", {
            message: err.message,
            stack: err.stack,
            data: err.data,
            code: err.code,
            fullError: err
        });
        log("firstBuyWeb3 error", err?.message || err);
        
        // If err.message is undefined, try to extract error from the object
        const errorMessage = err?.message || err?.error || JSON.stringify(err) || 'Unexpected error';
        return { success: false, error: errorMessage };
    }
};

/**
 * Executes a buy transaction for a specified token using the bonding contract.
 *
 * This function:
 *   - Authenticates with the provided admin private key.
 *   - Formats the token type argument for the transaction.
 *   - Calculates the amount of SUI to use for the purchase and the maximum number of tokens to buy.
 *   - Splits the required amount of SUI from the transaction gas.
 *   - Fetches metadata for both SUI and the target token in parallel.
 *   - Calls the bonding contract's `buy` function with the appropriate arguments and type arguments.
 *   - Signs and executes the transaction, returning true on success or false on error.
 *
 * @param {Uint8Array} ADMIN_PRIVATE_KEY - The admin's Ed25519 private key as a Uint8Array.
 * @param {Object} token - The token object containing:
 *   - {Object} publishedObject: The published package info for the token.
 *   - {string} name: The token's name.
 *   - {string|number} sui: The amount of SUI to use for the purchase.
 *   - {string|number} min_tokens: The minimum number of tokens to buy.
 * @returns {Promise<boolean>} True if the transaction succeeded, false otherwise.
 */
const buyWeb3 = async (ADMIN_CREDENTIAL, token) => {
    try {
        log("buyWeb3...");

        const adminKeypair =
            ADMIN_CREDENTIAL instanceof Uint8Array ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL) : ADMIN_CREDENTIAL;
        const tx = new Transaction();

        // Consistent formatting for type arguments
        const formattedName = token.name.replaceAll(" ", "_");
        const typeArgument = `${token.publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`;
        const typeArguments = [typeArgument];

        // Optimized numeric parsing
        const suiForBuy = Math.max(0, Math.floor(Number(token.sui) || 0));
        const maxTokens = Math.max(0, Math.floor((Number(token.min_tokens) || 0) * 0.9));

        // Split coins efficiently
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiForBuy)]);

        // Parallelize metadata fetches
        const tokenAType = "0x2::sui::SUI";
        const [tokenAMetadata, tokenBMetadata] = await Promise.all([
            client.getCoinMetadata({ coinType: tokenAType }),
            client.getCoinMetadata({ coinType: typeArgument }),
        ]);

        tx.moveCall({
            target: `${bondingContract}::kappadotmeme::buy`,
            arguments: [
                tx.object(globalPauseStatusObjectId),
                tx.object(poolsId),
                tx.object(lpBurnManger),
                tx.object(tokenAMetadata.id),
                tx.object(tokenBMetadata.id),
                tx.object(CONFIG),
                coin,
                tx.pure.bool(true), // is_exact_out always true
                tx.pure.u64(maxTokens),
                tx.object("0x6"),
            ],
            typeArguments,
        });

        const resData = await client.signAndExecuteTransaction({
            signer: adminKeypair,
            transaction: tx,
            options: {
                showRawEffects: true,
                showEffects: true,
                showObjectChanges: true,
            },
        });

        log("buyWeb3 success", resData?.digest);
        return {
            success: true,
            digest: resData?.digest,
            effects: resData?.effects,
            objectChanges: resData?.objectChanges,
        };
    } catch (err) {
        log("buyWeb3 error", err?.message || err);
        return { success: false, error: String(err?.message || err) };
    }
};

/**
 * Sells a specified amount of a token for SUI using the bonding contract.
 *
 * This function:
 *   - Authenticates with the provided admin private key.
 *   - Fetches all owned coins of the specified token type, paginating up to 30 pages for safety.
 *   - Filters out coins with zero balance.
 *   - Merges up to 300 coins if more than one is found, to optimize the transaction.
 *   - Splits the desired sell amount from the available coins.
 *   - Calls the bonding contract's `sell_` function to perform the sale, specifying the minimum SUI to receive.
 *   - Transfers the resulting SUI coin back to the admin's address.
 *   - Signs and executes the transaction, returning true on success or false on error.
 *
 * @param {Uint8Array} ADMIN_PRIVATE_KEY - The admin's Ed25519 private key as a Uint8Array.
 * @param {Object} token - The token object containing:
 *   - {Object} publishedObject: The published package info for the token.
 *   - {string} name: The token's name.
 *   - {string|number|BigInt} sell_token: The amount of token to sell.
 *   - {string|number} min_sui: The minimum amount of SUI to receive.
 * @returns {Promise<boolean>} True if the transaction succeeded, false otherwise.
 */
const sellWeb3 = async (ADMIN_CREDENTIAL, token) => {
    try {
        const adminKeypair =
            ADMIN_CREDENTIAL instanceof Uint8Array ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL) : ADMIN_CREDENTIAL;
        log("sellWeb3...");
        const tx = new Transaction();

        const { publishedObject } = token;
        const formattedName = token.name.replaceAll(" ", "_");
        const typeArgument = `${publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`;

        // Efficiently fetch all coin objects by paginating, with a hard safety limit
        let allCoins = [];
        let temp,
            page = 0,
            hasNext = true,
            owner = adminKeypair.toSuiAddress();
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

        // Filter coins with positive balance
        const selectedCoins = allCoins.filter((item) => Number(item.balance) > 0);
        if (!selectedCoins.length) {
            throw new Error("No coins with positive balance found for sell.");
        }

        // Merge coins if more than one, up to 300
        if (selectedCoins.length > 1) {
            tx.mergeCoins(
                selectedCoins[0].coinObjectId,
                selectedCoins.slice(1, 301).map((item) => item.coinObjectId)
            );
        }

        // Ensure sell_token is a string/BigInt and min_sui is a number
        const sellAmount = BigInt(token.sell_token || 0);
        const minSui = Math.floor(Number(token.min_sui) || 0);

        const [kappa_coin] = tx.splitCoins(selectedCoins[0].coinObjectId, [sellAmount]);
        const is_exact_out = true;

        const [coin] = tx.moveCall({
            target: `${bondingContract}::kappadotmeme::sell_`,
            arguments: [
                tx.object(CONFIG),
                kappa_coin,
                tx.pure.bool(is_exact_out),
                tx.pure.u64(minSui),
                tx.object("0x6"),
            ],
            typeArguments: [typeArgument],
        });

        tx.transferObjects([coin], adminKeypair.toSuiAddress());

        const resData = await client.signAndExecuteTransaction({
            signer: adminKeypair,
            transaction: tx,
            options: {
                showRawEffects: true,
                showEffects: true,
                showObjectChanges: true,
            },
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

module.exports = {
    createCoinWeb3,
    createCurveWeb3,
    firstBuyWeb3,
    buyWeb3,
    sellWeb3,
    setSuiClient,
    setNetworkConfig,
    setLogger,
};
