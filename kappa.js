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
const setSuiClient = (customClient) => { client = customClient; };
const setNetworkConfig = (cfg = {}) => {
    if (cfg.bondingContract) bondingContract = cfg.bondingContract;
    if (cfg.CONFIG) CONFIG = cfg.CONFIG;
    if (cfg.globalPauseStatusObjectId) globalPauseStatusObjectId = cfg.globalPauseStatusObjectId;
    if (cfg.poolsId) poolsId = cfg.poolsId;
    if (cfg.lpBurnManger) lpBurnManger = cfg.lpBurnManger;
};
const setLogger = (fn) => { logger = typeof fn === 'function' ? fn : null; };

const log = (...args) => { if (logger) { try { logger(...args); } catch {} } };

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
const updateTemplate = (tokenData) => {
    // Lazy-load WASM module only when needed (avoids bundling in browser UIs)
    const wasm = require("./move-bytecode/move_bytecode");
    const encoder = new TextEncoder();
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
    try {
        const adminKeypair = ADMIN_CREDENTIAL instanceof Uint8Array
            ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
            : ADMIN_CREDENTIAL; // assume signer/keypair compatible

        const tx = new Transaction();
        const [upgradeCap] = tx.publish({
            modules: [toB64(updateTemplate(token))],
            dependencies: ["0x1", "0x2"],
        });
        tx.transferObjects([upgradeCap], "0x0");

        const resData = await client.signAndExecuteTransaction({
            signer: adminKeypair,
            transaction: tx,
            options: {
                showRawEffects: true,
                showEffects: true,
                showObjectChanges: true,
            },
        });

        const objectChanges = resData?.objectChanges || [];
        const publishedObject = objectChanges.find(item => item?.type === "published");
        const treasuryCapObject = objectChanges.find(item => item?.objectType?.includes("TreasuryCap"));
        const coinMetadataObject = objectChanges.find(item => item?.objectType?.includes("CoinMetadata"));

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
        log('createCoinWeb3 error', err?.message || err);
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
        const adminKeypair = ADMIN_CREDENTIAL instanceof Uint8Array
            ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
            : ADMIN_CREDENTIAL;

        log("createCurveWeb3...", token?.name || 'token');
        const tx = new Transaction();

        const { treasuryCapObject, coinMetadataObject, publishedObject } = token;

        if (process.env.NODE_ENV !== "production") {
            console.log("treasuryCapObject", treasuryCapObject);
            console.log("publishedObject", publishedObject);
            console.log("coinMetadataObject", coinMetadataObject);
        }

        const formattedName = token.name.replaceAll(" ", "_");
        const typeArguments = [
            `${publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`,
        ];

        const maxTx = token.maxTx !== "false";
        
        // Create comprehensive metadata matching the platform's format
        const metadata = JSON.stringify({
            website: token.website || "",
            telegram: token.telegram || "",
            twitter: token.twitter || "",
            tags: token.tags || [],
        });

        tx.moveCall({
            target: `${bondingContract}::kappa_fun::create`,
            arguments: [
                tx.object(CONFIG),
                tx.object(globalPauseStatusObjectId),
                tx.object(poolsId),
                tx.object(treasuryCapObject.objectId),
                tx.object(coinMetadataObject.objectId),
                tx.pure.string(metadata),
                tx.pure.bool(maxTx),
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

        log("createCurveWeb3 success", resData?.digest);
        return { success: true, digest: resData?.digest, effects: resData?.effects, objectChanges: resData?.objectChanges };
    } catch (err) {
        log('createCurveWeb3 error', err?.message || err);
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
        const adminKeypair = ADMIN_CREDENTIAL instanceof Uint8Array
            ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
            : ADMIN_CREDENTIAL;
        log("firstBuyWeb3...");
        const tx = new Transaction();
        const { publishedObject } = token;

        // Use replaceAll for consistency with other functions
        const formattedName = token.name.replaceAll(" ", "_");
        const typeArguments = [
            `${publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`,
        ];

        // Use Math.floor for integer values, fallback to 0 if undefined
        const sui_for_buy = Math.floor(Number(token.sui) || 0);
        const max_tokens = Math.floor((Number(token.min_tokens) || 0) * 0.9);

        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_for_buy)]);
        tx.moveCall({
            target: `${bondingContract}::kappa_fun::first_buy`,
            arguments: [
                tx.object(CONFIG),
                coin,
                tx.pure.bool(true), // is_exact_out always true
                tx.pure.u64(max_tokens),
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

        log("firstBuyWeb3 success", resData?.digest);
        return { success: true, digest: resData?.digest, effects: resData?.effects, objectChanges: resData?.objectChanges };
    } catch (err) {
        log('firstBuyWeb3 error', err?.message || err);
        return { success: false, error: String(err?.message || err) };
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

        const adminKeypair = ADMIN_CREDENTIAL instanceof Uint8Array
            ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
            : ADMIN_CREDENTIAL;
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
            target: `${bondingContract}::kappa_fun::buy`,
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
        return { success: true, digest: resData?.digest, effects: resData?.effects, objectChanges: resData?.objectChanges };
    } catch (err) {
        log('buyWeb3 error', err?.message || err);
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
        const adminKeypair = ADMIN_CREDENTIAL instanceof Uint8Array
            ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
            : ADMIN_CREDENTIAL;
        log("sellWeb3...");
        const tx = new Transaction();

        const { publishedObject } = token;
        const formattedName = token.name.replaceAll(" ", "_");
        const typeArgument = `${publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`;

        // Efficiently fetch all coin objects by paginating, with a hard safety limit
        let allCoins = [];
        let temp, page = 0, hasNext = true, owner = adminKeypair.toSuiAddress();
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
        const selectedCoins = allCoins.filter(item => Number(item.balance) > 0);
        if (!selectedCoins.length) {
            throw new Error("No coins with positive balance found for sell.");
        }

        // Merge coins if more than one, up to 300
        if (selectedCoins.length > 1) {
            tx.mergeCoins(
                selectedCoins[0].coinObjectId,
                selectedCoins.slice(1, 301).map(item => item.coinObjectId)
            );
        }

        // Ensure sell_token is a string/BigInt and min_sui is a number
        const sellAmount = BigInt(token.sell_token || 0);
        const minSui = Math.floor(Number(token.min_sui) || 0);

        const [kappa_coin] = tx.splitCoins(selectedCoins[0].coinObjectId, [sellAmount]);
        const is_exact_out = true;

        const [coin] = tx.moveCall({
            target: `${bondingContract}::kappa_fun::sell_`,
            arguments: [
                tx.object(CONFIG),
                kappa_coin,
                tx.pure.bool(is_exact_out),
                tx.pure.u64(minSui),
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
        return { success: true, digest: resData?.digest, effects: resData?.effects, objectChanges: resData?.objectChanges };
    } catch (err) {
        log("sellWeb3 error:", err?.message || err);
        return { success: false, error: String(err?.message || err) };
    }
};

module.exports = { createCoinWeb3, createCurveWeb3, firstBuyWeb3, buyWeb3, sellWeb3, setSuiClient, setNetworkConfig, setLogger };
