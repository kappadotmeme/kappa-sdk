import { bcs } from "@mysten/bcs";
import init from "@mysten/move-bytecode-template";
import * as wasm from "@mysten/move-bytecode-template/move_bytecode_template";
import { Transaction } from "@mysten/sui/transactions";
import { fromB64, toB64 } from "@mysten/sui/utils";

// const bytecode ="oRzrCwYAAAAKAQAMAgweAyotBFcKBWFjB8QB6AEIrANgBowEJAqwBAUMtQRAAAcBDQIGAhICEwIUAAACAAECBwEAAAIBDAEAAQIDDAEAAQQEAgAFBQcAAAoAAQABEQUGAQACCAgJAQICCwwBAQADDgUBAQwDDw8BAQwEEAoLAAUMAwQAAQQCBwMHBA0FDgIIAAcIBAACCwMBCAALAgEIAAEKAgEIBQEJAAELAQEJAAEIAAcJAAIKAgoCCgILAQEIBQcIBAILAwEJAAsCAQkAAQYIBAEFBAcLAwEJAAMFBwgEAQsCAQgAAQsDAQgAAgkABQ1DT0lOX1RFTVBMQVRFDENvaW5NZXRhZGF0YQZPcHRpb24LVHJlYXN1cnlDYXAJVHhDb250ZXh0A1VybARjb2luDWNvaW5fdGVtcGxhdGUPY3JlYXRlX2N1cnJlbmN5C2R1bW15X2ZpZWxkBGluaXQRbWludF9hbmRfdHJhbnNmZXIVbmV3X3Vuc2FmZV9mcm9tX2J5dGVzBm9wdGlvbhRwdWJsaWNfZnJlZXplX29iamVjdA9wdWJsaWNfdHJhbnNmZXIGc2VuZGVyBHNvbWUIdHJhbnNmZXIKdHhfY29udGV4dAN1cmwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIKAgYFc19zdWkKAgYFbl9zdWkKAgYFZF9zdWkKAgYFdV9zdWkAAgEJAQAAAAACGwsAMQkHAAcBBwIHAxEHOAAKATgBDAMMAg0CBgCAxqR+jQMACgEuEQYKATgCCwM4AwsCCwEuEQY4BAIA"
const bytecode =
    "oRzrCwYAAAAKAQAMAgweAyonBFEIBVlXB7AB1gEIhgNgBuYDJAqKBAUMjwQsAAcBDAIGAhECEgITAAACAAECBwEAAAIBDAEAAQIDDAEAAQQEAgAFBQcAAAoAAQABEAUGAQACCAgJAQIDDQUBAQwDDg4BAQwEDwsMAAULAwQAAQQCBwMKBA0CCAAHCAQAAgsDAQgACwIBCAABCgIBCAUBCQABCwEBCQABCAAHCQACCgIKAgoCCwEBCAUHCAQCCwMBCQALAgEJAAELAgEIAAEGCAQBBQELAwEIAAIJAAUNQ09JTl9URU1QTEFURQxDb2luTWV0YWRhdGEGT3B0aW9uC1RyZWFzdXJ5Q2FwCVR4Q29udGV4dANVcmwEY29pbg1jb2luX3RlbXBsYXRlD2NyZWF0ZV9jdXJyZW5jeQtkdW1teV9maWVsZARpbml0FW5ld191bnNhZmVfZnJvbV9ieXRlcwZvcHRpb24UcHVibGljX2ZyZWV6ZV9vYmplY3QPcHVibGljX3RyYW5zZmVyBnNlbmRlcgRzb21lCHRyYW5zZmVyCnR4X2NvbnRleHQDdXJsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCgIGBXNfc3VpCgIGBW5fc3VpCgIGBWRfc3VpCgIGBXVfc3VpAAIBCQEAAAAAAhQLADEJBwAHAQcCBwMRBjgACgE4AQwDDAILAzgCCwILAS4RBTgDAgA=";
// const bytecode1 =
//     "oRzrCwYAAAAKAQAMAgweAyonBFEIBVlXB7AB1gEIhgNgBuYDGwqBBAUMhgQsAAcBDAIGAhECEgITAAACAAECBwEAAAIBDAEAAQIDDAEAAQQEAgAFBQcAAAoAAQABEAUGAQACCAgJAQIDDQUBAQwDDg4BAQwEDwsMAAULAwQAAQQCBwMKBA0CCAAHCAQAAgsDAQgACwIBCAABCgIBCAUBCQABCwEBCQABCAAHCQACCgIKAgoCCwEBCAUHCAQCCwMBCQALAgEJAAELAgEIAAEGCAQBBQELAwEIAAIJAAUNQ09JTl9URU1QTEFURQxDb2luTWV0YWRhdGEGT3B0aW9uC1RyZWFzdXJ5Q2FwCVR4Q29udGV4dANVcmwEY29pbg1jb2luX3RlbXBsYXRlD2NyZWF0ZV9jdXJyZW5jeQtkdW1teV9maWVsZARpbml0FW5ld191bnNhZmVfZnJvbV9ieXRlcwZvcHRpb24UcHVibGljX2ZyZWV6ZV9vYmplY3QPcHVibGljX3RyYW5zZmVyBnNlbmRlcgRzb21lCHRyYW5zZmVyCnR4X2NvbnRleHQDdXJsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCgIGBW5fc3VpCgIGBWRfc3VpCgIGBXVfc3VpAAIBCQEAAAAAAhQLADEJBwAHAAcBBwIRBjgACgE4AQwDDAILAzgCCwILAS4RBTgDAgA=";
const bondingContract =
    "0x32fb837874e2d42a77b77a058e170024daadc54245b29b5b8a684b0540010fbb";
const CONFIG =
    "0x93fbfbbe2f65326332a68ee930c069f8e3816f03c8a9f978ec5ce9c82cdae4b0";

// cetus config
const globalPauseStatusObjectId =
    "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f";
const poolsId =
    "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0";
const lpBurnManger =
    "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845";

// cetus config

const setupByteCode = async () => {
    try {
        await init("/code.wasm");
    } catch (err) {}
};

setupByteCode();

// Constants for calculations
const TOTAL_SUPPLY = 1_000_000_000;
const INITIAL_INPUT_RESERVE = 10;
// const INITIAL_OUTPUT_RESERVE = 876_800_000;
const INITIAL_OUTPUT_RESERVE = 2_200_000_000;
const FEE_BPS = 100;
const BPS_DENOMINATOR = 10000;
const PRECISION = 10000;

export const buyMathDev = (sui_for_buy: any) => {
    if (!sui_for_buy || isNaN(sui_for_buy)) return 0;

    try {
        const sui_amount = Number(sui_for_buy);
        const fee_amount = (sui_amount * FEE_BPS) / BPS_DENOMINATOR;
        const amount_after_fee = sui_amount - fee_amount;

        return (
            (amount_after_fee * INITIAL_OUTPUT_RESERVE) /
            (INITIAL_INPUT_RESERVE + amount_after_fee)
        );
    } catch {
        return 0;
    }
};

export const placeDevMath9 = async (percent: any) => {
    if (!percent || percent <= 0 || percent >= 1) return [0, 0];

    try {
        const target_token_amount = TOTAL_SUPPLY * percent;

        // Binary search for exact SUI amount
        let left = 0.001;
        let right = 7700;
        let exact_sui = 0;

        while (left <= right) {
            const mid = (left + right) / 2;
            const token_amount_dev = buyMathDev(mid);

            if (Math.abs(token_amount_dev - target_token_amount) < PRECISION) {
                exact_sui = mid;
                break;
            }

            if (token_amount_dev < target_token_amount) {
                left = mid + 0.00001;
            } else {
                right = mid - 0.00001;
            }
        }
        console.log("exact sui", exact_sui);

        if (exact_sui === 0) return [0, 0];

        return [exact_sui.toFixed(3), target_token_amount.toFixed(3)];
    } catch {
        return [0, 0];
    }
};

// const updateTemplate = (tokenData: any) => {
//     const encoder = new TextEncoder();
//     const code = tokenData.symbol === tokenData.name ? bytecode1 : bytecode;
//     const d = wasm.deserialize(fromB64(code));
//     d.address_identifiers[0] =
//         "0000000000000000000000000000000000000000000000000000000000000000";

//     let updated = wasm.serialize(d);
//     const formattedName = tokenData.name.replaceAll(" ", "_");

//     // Update identifiers
//     updated = wasm.update_identifiers(updated, {
//         COIN_TEMPLATE: formattedName.toUpperCase(),
//         coin_template: formattedName,
//     });

//     // Helper function for updating constants
//     const updateConstant = (value: any, placeholder: any) => {
//         return wasm.update_constants(
//             updated,
//             bcs.vector(bcs.u8()).serialize(encoder.encode(value)).toBytes(),
//             bcs
//                 .vector(bcs.u8())
//                 .serialize(encoder.encode(placeholder))
//                 .toBytes(),
//             "Vector(U8)",
//         );
//     };

//     // Update name/symbol constants
//     if (tokenData.symbol === tokenData.name) {
//         updated = updateConstant(tokenData.name, "n_sui");
//         updated = updateConstant(tokenData.symbol, "s_sui");
//     } else {
//         updated = updateConstant(tokenData.symbol, "s_sui");
//         updated = updateConstant(tokenData.name, "n_sui");
//     }

//     // Update description and icon
//     updated = updateConstant(tokenData.description, "d_sui");
//     updated = updateConstant(tokenData.icon, "u_sui");

//     return updated;
// };

const updateTemplate = (tokenData: any) => {
    const encoder = new TextEncoder();
    const d = wasm.deserialize(fromB64(bytecode));
    d.address_identifiers[0] =
        "0000000000000000000000000000000000000000000000000000000000000000";
    const ddd = wasm.serialize(d);

    let updated = wasm.update_identifiers(ddd, {
        COIN_TEMPLATE: tokenData.name.replaceAll(" ", "_").toUpperCase(),
        coin_template: tokenData.name.replaceAll(" ", "_"),
    });

    updated = wasm.update_constants(
        updated,
        bcs
            .vector(bcs.u8())
            .serialize(encoder.encode(tokenData.symbol))
            .toBytes(),
        bcs.vector(bcs.u8()).serialize(encoder.encode("s_sui")).toBytes(),
        "Vector(U8)",
    );

    updated = wasm.update_constants(
        updated,
        bcs
            .vector(bcs.u8())
            .serialize(encoder.encode(tokenData.name))
            .toBytes(),
        bcs.vector(bcs.u8()).serialize(encoder.encode("n_sui")).toBytes(),
        "Vector(U8)",
    );

    updated = wasm.update_constants(
        updated,
        bcs
            .vector(bcs.u8())
            .serialize(encoder.encode(tokenData.description))
            .toBytes(),
        bcs.vector(bcs.u8()).serialize(encoder.encode("d_sui")).toBytes(),
        "Vector(U8)",
    );

    updated = wasm.update_constants(
        updated,
        bcs
            .vector(bcs.u8())
            .serialize(encoder.encode(tokenData.icon))
            .toBytes(),
        bcs.vector(bcs.u8()).serialize(encoder.encode("u_sui")).toBytes(),
        "Vector(U8)",
    );

    return updated;
};

export function getModifiedCoinBytecode(token: any) {
    return toB64(updateTemplate(token));
}

export const createCoinWeb3 = async (wallet: any, client: any, token: any) => {
    try {
        const tx = new Transaction();
        console.log("initialized transaction");

        const [upgradeCap] = tx.publish({
            modules: [toB64(updateTemplate(token))],
            dependencies: ["0x1", "0x2"],
        });
        console.log("published upgradeCap", upgradeCap);
        tx.transferObjects([upgradeCap], "0x0");
        console.log("transferred upgradeCap");
        const resData = await wallet.signAndExecuteTransaction(
            {
                transaction: tx,
            },
            {
                execute: ({
                    bytes,
                    signature,
                }: {
                    bytes: any;
                    signature: any;
                }) => {
                    return client.executeTransactionBlock({
                        transactionBlock: bytes,
                        signature,
                        options: {
                            showRawEffects: true,
                            showObjectChanges: true,
                        },
                    });
                },
            },
        );

        const objectChanges = resData?.objectChanges;
        console.log(objectChanges);
        const publishedObject = objectChanges.filter(
            (item: any) => item?.type == "published",
        );
        const treasuryCapObject = objectChanges.filter((item: any) =>
            item?.objectType?.includes("TreasuryCap"),
        );
        const coinMetadataObject = objectChanges.filter((item: any) =>
            item?.objectType?.includes("CoinMetadata"),
        );

        localStorage.setItem(
            "publishedObject",
            JSON.stringify(publishedObject[0]),
        );
        localStorage.setItem(
            "treasuryCapObject",
            JSON.stringify(treasuryCapObject[0]),
        );
        localStorage.setItem(
            "coinMetadataObject",
            JSON.stringify(coinMetadataObject[0]),
        );

        console.log("publishedObject success", publishedObject[0]);
        // console.log("connectorObject success", connectorObject);
        console.log("treasuryCapObject success", treasuryCapObject);
        console.log("coinMetadataObject success", coinMetadataObject);

        console.log("signAndExecuteTransaction success", resData);
        localStorage.setItem("meme_step", String(1));
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const createCurveWeb3 = async (wallet: any, client: any, token: any) => {
    try {
        const tx = new Transaction();

        const treasuryCapObject = JSON.parse(
            localStorage.getItem("treasuryCapObject") || "{}",
        );
        const publishedObject = JSON.parse(
            localStorage.getItem("publishedObject") || "{}",
        );

        console.log("treasuryCapObject ", treasuryCapObject);
        console.log("publishedObject ", publishedObject);

        const typeArguments = [
            `${publishedObject.packageId}::${token.name}::${token.name.toUpperCase()}`,
        ];

        let maxTx = true;
        if (token.maxTx == "false") {
            maxTx = false;
        }

        tx.moveCall({
            target: `${bondingContract}::kappadotmeme::create`,
            arguments: [
                tx.object(CONFIG),
                tx.object(globalPauseStatusObjectId),
                tx.object(poolsId),
                tx.object(treasuryCapObject.objectId),
                tx.pure.bool(maxTx),
                tx.object("0x6"),
            ],
            typeArguments: typeArguments,
        });

        const resData = await wallet.signAndExecuteTransaction(
            {
                transaction: tx,
            },
            {
                execute: ({
                    bytes,
                    signature,
                }: {
                    bytes: any;
                    signature: any;
                }) => {
                    return client.executeTransactionBlock({
                        transactionBlock: bytes,
                        signature,
                        options: {
                            showRawEffects: true,
                            showObjectChanges: true,
                        },
                    });
                },
            },
        );
        console.log("signAndExecuteTransaction success", resData);

        const objectChanges = resData?.objectChanges;
        const bondingCurve = objectChanges.filter(
            (item: any) =>
                item?.type == "created" &&
                item?.objectType.includes("BondingCurve"),
        );
        localStorage.setItem("bondingCurve", JSON.stringify(bondingCurve));
        localStorage.setItem("tx", resData?.digest);
        localStorage.setItem("meme_step", String(2));
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const buyMath = (realCurve: any, sui_for_buy: any) => {
    try {
        const sui_amount = Number(sui_for_buy);
        const _fee_bps = 100;
        const input_reserve_val = Number(
            realCurve.content.fields.virtual_sui_reserve,
        );
        const output_reserve_val = Number(
            realCurve.content.fields.virtual_coin_reserve,
        );

        const _fee_amount = (sui_amount * _fee_bps) / 10000;
        const _amount_after_fee = sui_amount - _fee_amount;
        const out =
            (_amount_after_fee * output_reserve_val) /
            (input_reserve_val + _amount_after_fee);
        const out_fee = _fee_amount;

        console.log("buy input_reserve_val ", input_reserve_val);
        console.log("buy output_reserve_val ", output_reserve_val);
        console.log("buy in ", sui_for_buy);
        console.log(
            "buy out ",
            out,
            (out / Number(1_000_000_000)).toLocaleString(),
        );
        return out;
    } catch (err) {
        return 0;
    }
};

export const buyWeb3 = async (
    wallet: any,
    client: any,
    memeData: any,
    sui: any,
    _min_tokens: any,
) => {
    try {
        console.log("buying....", memeData, sui, _min_tokens);
        const sui_for_buy = (sui * Number(1000000000)).toFixed(0);
        const max_tokens = (_min_tokens * 0.9).toFixed(0);

        const tx = new Transaction();
        const publishedObject = JSON.parse(memeData.publishedObject);
        const token = JSON.parse(memeData.token);

        const typeArguments = [
            `${publishedObject.packageId}::${token.name}::${token.name.toUpperCase()}`,
        ];
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_for_buy)]);
        const is_exact_out = true;

        const token_a_type = `0x2::sui::SUI`;

        const token_a_metadata = await (
            await client.getCoinMetadata({ coinType: token_a_type })
        ).id;
        const token_b_metdatadata = (
            await client.getCoinMetadata({ coinType: typeArguments[0] })
        ).id;

        tx.moveCall({
            target: `${bondingContract}::kappadotmeme::buy`,
            arguments: [
                tx.object(globalPauseStatusObjectId),
                tx.object(poolsId),
                tx.object(lpBurnManger),
                tx.object(token_a_metadata),
                tx.object(token_b_metdatadata),

                tx.object(CONFIG),
                coin,
                tx.pure.bool(is_exact_out),
                tx.pure.u64(max_tokens),
                tx.object("0x6"),
            ],
            typeArguments: typeArguments,
        });

        const resData = await wallet.signAndExecuteTransaction(
            {
                transaction: tx,
            },
            {
                execute: ({
                    bytes,
                    signature,
                }: {
                    bytes: any;
                    signature: any;
                }) => {
                    console.log("signature ", signature);
                    return client.executeTransactionBlock({
                        transactionBlock: bytes,
                        signature,
                        options: {
                            showRawEffects: true,
                            showObjectChanges: true,
                        },
                    });
                },
            },
        );

        // console.log("signAndExecuteTransaction success", resData);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const firstBuyWeb3 = async (
    wallet: any,
    client: any,
    token: any,
    sui: any,
    _min_tokens: any,
) => {
    try {
        console.log("buying....", token, sui, _min_tokens);
        const sui_for_buy = sui.toFixed(0);
        const max_tokens = (_min_tokens * 0.9).toFixed(0);

        const tx = new Transaction();
        const publishedObject = JSON.parse(
            localStorage.getItem("publishedObject") || "{}",
        );

        const typeArguments = [
            `${publishedObject.packageId}::${token.name}::${token.name.toUpperCase()}`,
        ];
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(sui_for_buy)]);
        const is_exact_out = true;

        tx.moveCall({
            target: `${bondingContract}::kappadotmeme::first_buy`,
            arguments: [
                tx.object(CONFIG),
                coin,
                tx.pure.bool(is_exact_out),
                tx.pure.u64(max_tokens),
                tx.object("0x6"),
            ],
            typeArguments: typeArguments,
        });

        const resData = await wallet.signAndExecuteTransaction(
            {
                transaction: tx,
            },
            {
                execute: ({
                    bytes,
                    signature,
                }: {
                    bytes: any;
                    signature: any;
                }) => {
                    console.log("signature ", signature);
                    return client.executeTransactionBlock({
                        transactionBlock: bytes,
                        signature,
                        options: {
                            showRawEffects: true,
                            showObjectChanges: true,
                        },
                    });
                },
            },
        );

        // console.log("signAndExecuteTransaction success", resData);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const sellMath = (realCurve: any, sell_token_amount: any) => {
    console.log("selling ");
    console.log("token_amount", sell_token_amount);

    sell_token_amount = Number(sell_token_amount);

    const input_reserve_val = Number(
        realCurve.content.fields.virtual_coin_reserve,
    ); //1066665874.667254726 //800_000_000 + 266_666_666;
    const output_reserve_val = Number(
        realCurve.content.fields.virtual_sui_reserve,
    ); // 1_333.333;
    const _fee_bps = 100;

    const _output_amount =
        (sell_token_amount * output_reserve_val) /
        (input_reserve_val + sell_token_amount);
    const _fee_amount = (_output_amount * _fee_bps) / 10000; // + 1;

    const sui_out = _output_amount - _fee_amount;
    const sui_out_fee = _fee_amount;

    console.log("sell_token_amount out ", sell_token_amount);
    console.log("sui out ", sui_out);
    console.log("sui_out_fee  ", sui_out_fee);

    // return [sell_token_amount.toFixed(0), sui_out.toFixed(0)];
    return sui_out;
};

export const sellWeb3 = async (
    wallet: any,
    client: any,
    memeData: any,
    sell_token: any,
    min_sui: any,
) => {
    try {
        console.log("selling..");

        console.log("sell_token ", sell_token, " min_sui ", min_sui);

        const tx = new Transaction();

        const publishedObject = JSON.parse(memeData.publishedObject);
        const token = JSON.parse(memeData.token);

        const typeArguments = [
            `${publishedObject.packageId}::${token.name}::${token.name.toUpperCase()}`,
        ];

        // Fetch all coin objects by paginating
        let allCoins = [];
        let temp = await client.getCoins({
            owner: wallet?.account?.address?.toString(),
            coinType: typeArguments[0],
        });
        allCoins = temp.data;

        let i = 0;
        while (temp.hasNextPage) {
            temp = await client.getCoins({
                owner: wallet?.account?.address?.toString(),
                coinType: typeArguments[0],
                cursor: temp.nextCursor,
            });
            allCoins = [...allCoins, ...temp.data];
            i++;
            if (i > 30) break; // safety break
        }

        // Merge coins if more than one
        const selectedCoin = allCoins.filter(
            (item: any) => Number(item.balance) > 0,
        );
        if (selectedCoin.length > 1) {
            tx.mergeCoins(
                selectedCoin[0].coinObjectId,
                selectedCoin
                    .slice(
                        1,
                        selectedCoin.length > 300 ? 300 : selectedCoin.length,
                    )
                    .map((item: any) => item.coinObjectId),
            );
        }

        const [kappa_coin] = tx.splitCoins(selectedCoin[0].coinObjectId, [
            sell_token,
        ]);
        const is_exact_out = true;

        const [coin] = tx.moveCall({
            target: `${bondingContract}::kappadotmeme::sell_`,
            arguments: [
                tx.object(CONFIG),
                kappa_coin,
                tx.pure.bool(is_exact_out),
                tx.pure.u64(min_sui),
            ],
            typeArguments: typeArguments,
        });

        tx.transferObjects([coin], wallet?.account?.address);

        const resData = await wallet.signAndExecuteTransaction(
            {
                transaction: tx,
            },
            {
                execute: ({
                    bytes,
                    signature,
                }: {
                    bytes: any;
                    signature: any;
                }) => {
                    return client.executeTransactionBlock({
                        transactionBlock: bytes,
                        signature,
                        options: {
                            showRawEffects: true,
                            showObjectChanges: true,
                        },
                    });
                },
            },
        );
        console.log("signAndExecuteTransaction success", resData);
        localStorage.setItem("tx", resData?.digest);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export {};
