const { Transaction } = require("@mysten/sui/transactions");
const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");

const createSuiClient = () => {
    return new SuiClient({ url: getFullnodeUrl("mainnet") });
};

let client = createSuiClient();
let logger = null;

let bondingContract = "0x32fb837874e2d42a77b77a058e170024daadc54245b29b5b8a684b0540010fbb";
let CONFIG = "0x93fbfbbe2f65326332a68ee930c069f8e3816f03c8a9f978ec5ce9c82cdae4b0";
let globalPauseStatusObjectId = "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f";
let poolsId = "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0";
let lpBurnManger = "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845";

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

const buyWeb3 = async (ADMIN_CREDENTIAL, token) => {
    try {
        log("buyWeb3...");
        if (!ADMIN_CREDENTIAL) throw new Error('WALLET_NOT_CONNECTED');
        const isWallet = ADMIN_CREDENTIAL && typeof ADMIN_CREDENTIAL.signAndExecuteTransaction === 'function';
        const adminKeypair = !isWallet && ADMIN_CREDENTIAL instanceof Uint8Array
            ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
            : ADMIN_CREDENTIAL;
        if (!isWallet && !(ADMIN_CREDENTIAL instanceof Uint8Array)) {
            throw new Error('INVALID_SIGNER');
        }
        const tx = new Transaction();

        const formattedName = token.name.replaceAll(" ", "_");
        const typeArgument = `${token.publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`;
        const typeArguments = [typeArgument];

        const suiForBuy = Math.max(0, Math.floor(Number(token.sui) || 0));
        const maxTokens = Math.max(0, Math.floor((Number(token.min_tokens) || 0) * 0.9));

        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(suiForBuy)]);

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
                tx.pure.bool(true),
                tx.pure.u64(maxTokens),
                tx.object("0x6"),
            ],
            typeArguments,
        });

        const resData = isWallet
            ? await ADMIN_CREDENTIAL.signAndExecuteTransaction({
                transaction: tx,
                chain: 'sui:mainnet',
                options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              })
            : await client.signAndExecuteTransaction({
                signer: adminKeypair,
                transaction: tx,
                options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              });

        log("buyWeb3 success", resData?.digest);
        return { success: true, digest: resData?.digest, effects: resData?.effects, objectChanges: resData?.objectChanges };
    } catch (err) {
        log('buyWeb3 error', err?.message || err);
        return { success: false, error: String(err?.message || err) };
    }
};

const sellWeb3 = async (ADMIN_CREDENTIAL, token) => {
    try {
        if (!ADMIN_CREDENTIAL) throw new Error('WALLET_NOT_CONNECTED');
        const isWallet = ADMIN_CREDENTIAL && typeof ADMIN_CREDENTIAL.signAndExecuteTransaction === 'function';
        const adminKeypair = !isWallet && ADMIN_CREDENTIAL instanceof Uint8Array
            ? Ed25519Keypair.fromSecretKey(ADMIN_CREDENTIAL)
            : ADMIN_CREDENTIAL;
        if (!isWallet && !(ADMIN_CREDENTIAL instanceof Uint8Array)) {
            throw new Error('INVALID_SIGNER');
        }
        log("sellWeb3...");
        const tx = new Transaction();

        const { publishedObject } = token;
        const formattedName = token.name.replaceAll(" ", "_");
        const typeArgument = `${publishedObject.packageId}::${formattedName}::${formattedName.toUpperCase()}`;

        let allCoins = [];
        let temp, page = 0, hasNext = true, owner = isWallet ? ADMIN_CREDENTIAL.address : adminKeypair.toSuiAddress();
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

        const selectedCoins = allCoins.filter(item => Number(item.balance) > 0);
        if (!selectedCoins.length) {
            throw new Error("No coins with positive balance found for sell.");
        }

        if (selectedCoins.length > 1) {
            tx.mergeCoins(
                selectedCoins[0].coinObjectId,
                selectedCoins.slice(1, 301).map(item => item.coinObjectId)
            );
        }

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

        tx.transferObjects([coin], owner);

        const resData = isWallet
            ? await ADMIN_CREDENTIAL.signAndExecuteTransaction({
                transaction: tx,
                chain: 'sui:mainnet',
                options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              })
            : await client.signAndExecuteTransaction({
                signer: adminKeypair,
                transaction: tx,
                options: { showRawEffects: true, showEffects: true, showObjectChanges: true },
              });

        log("sellWeb3 success", resData?.digest);
        return { success: true, digest: resData?.digest, effects: resData?.effects, objectChanges: resData?.objectChanges };
    } catch (err) {
        log("sellWeb3 error:", err?.message || err);
        return { success: false, error: String(err?.message || err) };
    }
};

module.exports = { buyWeb3, sellWeb3, setSuiClient, setNetworkConfig, setLogger };


