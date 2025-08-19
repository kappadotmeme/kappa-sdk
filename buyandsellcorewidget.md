"use client";
import { CoinContext } from "@@/contexts/CoinContext";
import { buyMath, sellMath } from "@@/libs/web3";
import { bondingAbi, coinAbi, isProduction } from "@@/utils/constants";
import {
    bondingCurveConfigObjectId,
    bondingCurveGlobalPauseStatusObjectId,
    bondingCurveLpBurnMangerObjectId,
    bondingCurveModuleId,
    bondingCurvePoolsObjectId,
    getCoinTypeArgument,
} from "@@/utils/sui";
import { formatSuiWidget, formatTokens } from "@@/utils/utilitaryFunctions";
import { Coin, ContractAbi } from "@buzzdotfun/sdk";
import {
    useConnectWallet,
    useCurrentAccount,
    useCurrentWallet,
    useSignAndExecuteTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import Decimal from "decimal.js";
import Image from "next/image";
import React, { useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlinePlus } from "react-icons/ai";
import { FiMinus } from "react-icons/fi";
import { Abi } from "viem";
import { abstract, abstractTestnet } from "viem/chains";

interface BuyAndSellCoreWidgetProps {
    coinAddr: `0x${string}` | undefined;
    bondingCurveAddr: `0x${string}` | undefined;
    coinAbi: unknown | undefined;
    bondingAbi: unknown | undefined;
    coinProps?: Coin | null;
    close?: () => void;
    minHeightOverride?: number;
    metadataCache?: Map<string, any>;
}

const BuyAndSellCoreWidget: React.FC<BuyAndSellCoreWidgetProps> = ({
    coinAddr,
    bondingCurveAddr,
    coinAbi,
    bondingAbi,
    coinProps,
    close,
    minHeightOverride,
    metadataCache: propMetadataCache,
}) => {
    const [isApprovalTransaction, setIsApprovalTransaction] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [needsApproval, setNeedsApproval] = useState(false);

    const handleFlip = () => {
        setIsFlipped((prev) => !prev);
    };

    const { coin: coinContext } = useContext(CoinContext);
    const coin = coinProps || coinContext;

    // Log when we receive prefetched metadata cache
    useEffect(() => {
        if (propMetadataCache && propMetadataCache.size > 0) {
            console.log(
                "🎯 BuyAndSellCoreWidget: Received prefetched metadata cache",
                {
                    cachedTypes: Array.from(propMetadataCache.keys()),
                    coinType: coin?.contractAddress,
                    coinSymbol: coin?.symbol,
                    cacheSize: propMetadataCache.size,
                },
            );
        }
    }, [propMetadataCache, coin?.contractAddress, coin?.symbol]);

    const maxBuys = ["5", "10", "15", "20", "50", "MAX"];
    const maxSells = ["1/4", "1/2", "3/4", "MAX"];
    const [isBuying, setIsBuying] = useState(true);
    const [loadingTransaction, setLoadingTransaction] = useState(false);
    const [isTransactionPending, setIsTransactionPending] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [rawInputValue, setRawInputValue] = useState("0");
    const [customSlippage, setCustomSlippage] = useState("1");
    const [amountTokenIn, setAmountTokenIn] = useState(
        new Decimal(0).mul(10 ** 9),
    );
    const [amountSuiIn, setAmountSuiIn] = useState(new Decimal(0).mul(10 ** 9));
    const { isConnected } = useCurrentWallet();

    const [walletBalance, setWalletBalance] = useState(new Decimal(0));
    const [tokenBalance, setTokenBalance] = useState(new Decimal(0));

    const currentAccount = useCurrentAccount();
    const suiClient = useSuiClient();

    useEffect(() => {
        if (!currentAccount) return;

        (async function () {
            const suiBalance = await suiClient.getBalance({
                owner: currentAccount.address,
            });
            console.log({ suiBalance });

            setWalletBalance(new Decimal(suiBalance.totalBalance).div(10 ** 9));
        })();
    }, [
        currentAccount?.address,
        amountSuiIn,
        amountTokenIn,
        loadingTransaction,
    ]);

    useEffect(() => {
        if (!coin || !currentAccount) return;

        (async function () {
            const coinBalance = await suiClient.getBalance({
                owner: currentAccount.address,
                coinType: coin.contractAddress!,
            });

            console.log({ coinBalance });

            setTokenBalance(new Decimal(coinBalance.totalBalance).div(10 ** 9));
        })();
    }, [
        coin?.contractAddress,
        currentAccount?.address,
        amountSuiIn,
        amountTokenIn,
        loadingTransaction,
    ]);

    /** Dynamically select balance based on mode */
    const balanceValue = isBuying
        ? walletBalance.toString()
        : tokenBalance.toString();

    // console.log("tokenBalance", tokenBalance.toString());

    const handleInput = (input: any) => {
        const value = input || "0";
        console.log("walletBalance", walletBalance.toString());
        console.log("tokenBalance", tokenBalance.toString());
        console.log("value", value);
        if (isBuying) {
            switch (input) {
                case "MAX":
                    setAmountSuiIn(walletBalance.mul(10 ** 9));
                    setRawInputValue(walletBalance.toString());
                    break;
                default:
                    setAmountSuiIn(new Decimal(value).mul(10 ** 9));
                    setRawInputValue(input);
            }
        } else {
            switch (input) {
                case "1/2":
                    setAmountTokenIn(tokenBalance.mul(10 ** 9).div(2));
                    setRawInputValue(
                        tokenBalance.div(2).toFixed(2, Decimal.ROUND_DOWN),
                    );
                    break;
                case "1/4":
                    setAmountTokenIn(tokenBalance.mul(10 ** 9).div(4));
                    setRawInputValue(
                        tokenBalance.div(4).toFixed(2, Decimal.ROUND_DOWN),
                    );
                    break;
                case "3/4":
                    setAmountTokenIn(
                        tokenBalance
                            .mul(10 ** 9)
                            .div(4)
                            .mul(3),
                    );
                    setRawInputValue(
                        tokenBalance
                            .div(4)
                            .mul(3)
                            .toFixed(2, Decimal.ROUND_DOWN),
                    );
                    break;
                case "MAX":
                    // Round down to 2 decimal places for both display and transaction
                    const roundedBalance = tokenBalance.toFixed(
                        2,
                        Decimal.ROUND_DOWN,
                    );
                    setAmountTokenIn(new Decimal(roundedBalance).mul(10 ** 9));
                    setRawInputValue(roundedBalance);
                    break;
                default:
                    // For manual input, ensure it's a valid number and format to 2 decimal places
                    const numValue = new Decimal(value);
                    if (!numValue.isNaN()) {
                        setAmountTokenIn(numValue.mul(10 ** 9));
                        setRawInputValue(
                            numValue.toFixed(2, Decimal.ROUND_DOWN),
                        );
                    }
            }
        }
    };

    const refetchAll = () => {};

    useEffect(() => {
        refetchAll();
    }, [amountSuiIn, amountTokenIn]);

    const handleCustomSlippageChange = (value: string) => {
        let numericValue = parseFloat(value);

        if (isNaN(numericValue)) {
            setCustomSlippage("");
        } else {
            if (numericValue > 25) {
                numericValue = 25;
            }
            // Limit to 1 decimal place (if applicable)
            const formattedValue =
                numericValue % 1 === 0
                    ? numericValue.toString()
                    : numericValue.toFixed(1);

            setCustomSlippage(formattedValue);
        }
    };

    const transformedSlippage = customSlippage
        ? new Decimal(customSlippage.toString())
        : new Decimal(0);

    const [bondingCurveObject, setBondingCurveObject] = useState<any>(null);

    useEffect(() => {
        if (!coin?.bondingContractAddress) return;

        (async function () {
            const curve = await suiClient.getObject({
                id: coin.bondingContractAddress!,
                options: {
                    showContent: true,
                },
            });

            console.log("curve", { curve });
            setBondingCurveObject(curve.data);
        })();
    }, [coin?.bondingContractAddress]);

    const adjustedToken = bondingCurveObject
        ? new Decimal(buyMath(bondingCurveObject, amountSuiIn.toFixed(0))).div(
              10 ** 9,
          )
        : new Decimal(0);

    const {
        mutate: coinBuySignAndExecuteTransaction,
        data: coinBuySignAndExecuteTransactionData,
        error: coinBuySignAndExecuteTransactionError,
    } = useSignAndExecuteTransaction({
        execute: ({ bytes, signature }) => {
            return suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                    showObjectChanges: true,
                },
            });
        },
    });

    const {
        mutate: coinSellSignAndExecuteTransaction,
        data: coinSellSignAndExecuteTransactionData,
        error: coinSellSignAndExecuteTransactionError,
    } = useSignAndExecuteTransaction({
        execute: ({ bytes, signature }) => {
            return suiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                    showObjectChanges: true,
                },
            });
        },
    });

    useEffect(() => {
        if (
            coinBuySignAndExecuteTransactionData ||
            coinSellSignAndExecuteTransactionData
        ) {
            setLoadingTransaction(false);
            setIsTransactionPending(false);
            handleInput("0");
            // Refresh balances after successful transaction
            if (currentAccount) {
                (async function () {
                    const suiBalance = await suiClient.getBalance({
                        owner: currentAccount.address,
                    });
                    setWalletBalance(
                        new Decimal(suiBalance.totalBalance).div(10 ** 9),
                    );

                    if (coin?.contractAddress) {
                        const coinBalance = await suiClient.getBalance({
                            owner: currentAccount.address,
                            coinType: coin.contractAddress,
                        });
                        setTokenBalance(
                            new Decimal(coinBalance.totalBalance).div(10 ** 9),
                        );
                    }
                })();
            }
            if (close) {
                toast.success("Transaction successful");
                close();
            }
        }
    }, [
        coinBuySignAndExecuteTransactionData,
        coinSellSignAndExecuteTransactionData,
    ]);

    useEffect(() => {
        if (
            coinBuySignAndExecuteTransactionError ||
            coinSellSignAndExecuteTransactionError
        ) {
            setLoadingTransaction(false);
            setIsTransactionPending(false);
            // Check if the error is due to user rejection
            const error =
                coinBuySignAndExecuteTransactionError ||
                coinSellSignAndExecuteTransactionError;
            if (
                error?.message?.includes("User rejected the transaction") ||
                error?.message?.includes("User rejected the request")
            ) {
                toast.error("Transaction rejected");
            } else {
                toast.error("Transaction failed");
            }
        }
    }, [
        coinBuySignAndExecuteTransactionError,
        coinSellSignAndExecuteTransactionError,
    ]);

    const adjustedSui = bondingCurveObject
        ? new Decimal(
              sellMath(bondingCurveObject, amountTokenIn.toFixed(0)),
          ).div(10 ** 9)
        : new Decimal(0);

    const getCoinMetadataWithRetry = async (coinType: string, retries = 3) => {
        // Check cache first
        if (propMetadataCache && propMetadataCache.has(coinType)) {
            console.log(
                "✅ BuyAndSellCoreWidget: Using cached metadata for",
                coinType,
            );
            return propMetadataCache.get(coinType);
        }

        console.log("🔄 BuyAndSellCoreWidget: Fetching metadata for", coinType);

        for (let i = 0; i < retries; i++) {
            try {
                const metadata = await suiClient.getCoinMetadata({
                    coinType: coinType,
                });
                // Cache the result
                if (propMetadataCache) {
                    propMetadataCache.set(coinType, metadata);
                }
                return metadata;
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i === retries - 1) {
                    throw new Error(
                        `Failed to fetch metadata after ${retries} attempts. Please try again later.`,
                    );
                }
                // Exponential backoff with jitter
                const delay = Math.min(
                    1000 * Math.pow(2, i) + Math.random() * 1000,
                    10000,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    };

    async function handleBuy() {
        if (!coin) return;
        setLoadingTransaction(true);
        setIsTransactionPending(true);
        try {
            const sui_for_buy = amountSuiIn.toFixed(0);
            const max_tokens = 10;
            const buyTransaction = new Transaction();

            const typeArguments = [
                // getCoinTypeArgument(coin.contractAddress!, coin.name),
                coin.contractAddress!,
            ];
            const [coinObject] = buyTransaction.splitCoins(buyTransaction.gas, [
                buyTransaction.pure.u64(sui_for_buy),
            ]);
            const is_exact_out = true;

            const token_a_type = `0x2::sui::SUI`;

            try {
                // Use retry logic for metadata requests
                const token_a_metadata =
                    await getCoinMetadataWithRetry(token_a_type);
                if (!token_a_metadata) {
                    throw new Error("Failed to fetch SUI token metadata");
                }

                const token_b_metadata = await getCoinMetadataWithRetry(
                    typeArguments[0],
                );
                if (!token_b_metadata) {
                    throw new Error("Failed to fetch token metadata");
                }

                const token_a_metadata_id = token_a_metadata.id;
                const token_b_metadata_id = token_b_metadata.id;

                buyTransaction.moveCall({
                    target: `${bondingCurveModuleId}::kappa_fun::buy`,
                    arguments: [
                        buyTransaction.object(
                            bondingCurveGlobalPauseStatusObjectId,
                        ),
                        buyTransaction.object(bondingCurvePoolsObjectId),
                        buyTransaction.object(bondingCurveLpBurnMangerObjectId),
                        buyTransaction.object(token_a_metadata_id!),
                        buyTransaction.object(token_b_metadata_id!),
                        buyTransaction.object(bondingCurveConfigObjectId),
                        coinObject,
                        buyTransaction.pure.bool(is_exact_out),
                        buyTransaction.pure.u64(max_tokens),
                        buyTransaction.object("0x6"),
                    ],
                    typeArguments: typeArguments,
                });

                await coinBuySignAndExecuteTransaction({
                    transaction: buyTransaction,
                });
            } catch (error: any) {
                console.error("Metadata fetch failed:", error);
                toast.error(
                    "Network error. Please try again in a few moments.",
                );
                throw error;
            }
        } catch (error: any) {
            console.error("Buy transaction failed:", error);
            setLoadingTransaction(false);
            setIsTransactionPending(false);
            if (
                error?.message?.includes("User rejected the transaction") ||
                error?.message?.includes("User rejected the request")
            ) {
                toast.error("Transaction rejected");
            } else if (error?.message?.includes("Failed to fetch")) {
                toast.error(
                    "Network error. Please try again in a few moments.",
                );
            } else {
                toast.error("Transaction failed. Please try again.");
            }
        }
    }

    async function handleSell() {
        if (!coin || !currentAccount) return;
        setLoadingTransaction(true);
        setIsTransactionPending(true);
        try {
            const is_exact_out = true;
            const token_for_sell = Number(amountTokenIn.toFixed(0));
            const min_sui = Number(
                adjustedSui
                    .mul(10 ** 9)
                    .sub(
                        adjustedSui
                            .mul(10 ** 9)
                            .mul(transformedSlippage)
                            .div(100),
                    )
                    .toFixed(0),
            );
            console.log("-------------------------------------");
            console.log("adjustedSui", adjustedSui.toString());
            console.log("min_sui", min_sui.toString());
            console.log("-------------------------------------");
            const sellTransaction = new Transaction();

            const typeArguments = [
                // getCoinTypeArgument(coin.contractAddress!, coin.name),
                coin.contractAddress!,
            ];

            let allCoins = [];
            let temp = await suiClient.getCoins({
                owner: currentAccount.address,
                coinType: typeArguments[0],
            });
            allCoins = temp.data;

            let i = 0;
            while (temp.hasNextPage) {
                temp = await suiClient.getCoins({
                    owner: currentAccount.address,
                    coinType: typeArguments[0],
                    cursor: temp.nextCursor,
                });
                allCoins = [...allCoins, ...temp.data];
                i++;
                if (i > 30) break; // safety break
            }

            console.log("sell: coin data", { data: allCoins });

            // Merge coins if more than one
            const selectedCoin = allCoins.filter(
                (item) => Number(item.balance) > 0,
            );
            if (selectedCoin.length > 1) {
                sellTransaction.mergeCoins(
                    selectedCoin[0].coinObjectId,
                    selectedCoin
                        .slice(
                            1,
                            selectedCoin.length > 300
                                ? 300
                                : selectedCoin.length,
                        )
                        .map((item) => item.coinObjectId),
                );
            }
            const [kappa_coin] = sellTransaction.splitCoins(
                selectedCoin[0].coinObjectId,
                [token_for_sell],
            );

            console.log("sell: kappa coin", { kappa_coin });

            const [coinObject] = sellTransaction.moveCall({
                target: `${bondingCurveModuleId}::kappa_fun::sell_`,
                arguments: [
                    sellTransaction.object(bondingCurveConfigObjectId),
                    kappa_coin,
                    sellTransaction.pure.bool(is_exact_out),
                    sellTransaction.pure.u64(min_sui),
                ],
                typeArguments: typeArguments,
            });

            console.log("sell: coin object", { coinObject });

            sellTransaction.transferObjects(
                [coinObject],
                currentAccount.address,
            );

            await coinSellSignAndExecuteTransaction({
                transaction: sellTransaction,
            });
        } catch (error: any) {
            console.error("Sell transaction failed:", error);
            setLoadingTransaction(false);
            setIsTransactionPending(false);
            if (
                error?.message?.includes("User rejected the transaction") ||
                error?.message?.includes("User rejected the request")
            ) {
                toast.error("Transaction rejected");
            } else {
                toast.error("Transaction failed");
            }
        }
    }

    // **OPTIMIZED: Pre-defined status messages to prevent string concatenation memory leaks**
    const TRADE_STATUS_MESSAGES = useMemo(
        () => ({
            INSUFFICIENT_BALANCE: (tokenType: string) =>
                `Insufficient ${tokenType} balance`,
            APPROVAL_REQUIRED: "Approval required for selling tokens",
            EXTREME_SLIPPAGE:
                "⚠️ EXTREME RISK: Slippage ≥25% can result in massive losses. Your trade may execute at severely unfavorable prices. Consider reducing to <5% for safety.",
            HIGH_SLIPPAGE:
                "🚨 HIGH RISK: Slippage ≥15% significantly increases loss potential. You may receive much less than expected. Proceed with extreme caution.",
            ELEVATED_SLIPPAGE:
                "⚠️ ELEVATED RISK: 10%+ slippage can lead to substantial losses, especially on large trades. Consider lowering for better execution.",
            HIGH_SLIPPAGE_WARNING: "Warning: High slippage",
            READY_TO_TRADE: "Ready to trade",
        }),
        [],
    );

    // **OPTIMIZED: Memoized trade status calculation**
    const tradeStatus = useMemo(() => {
        const slippageValue = parseFloat(customSlippage);
        const hasInsufficientBalance =
            balanceValue &&
            balanceValue !== "0" &&
            parseFloat(balanceValue) < parseFloat(rawInputValue);

        if (hasInsufficientBalance) {
            return TRADE_STATUS_MESSAGES.INSUFFICIENT_BALANCE(
                isBuying ? "SUI" : "token",
            );
        }

        if (!isBuying && needsApproval) {
            return TRADE_STATUS_MESSAGES.APPROVAL_REQUIRED;
        }

        if (slippageValue >= 25) {
            return TRADE_STATUS_MESSAGES.EXTREME_SLIPPAGE;
        }

        if (slippageValue >= 15) {
            return TRADE_STATUS_MESSAGES.HIGH_SLIPPAGE;
        }

        if (slippageValue >= 10) {
            return TRADE_STATUS_MESSAGES.ELEVATED_SLIPPAGE;
        }

        if (slippageValue > 50) {
            return TRADE_STATUS_MESSAGES.HIGH_SLIPPAGE_WARNING;
        }

        return TRADE_STATUS_MESSAGES.READY_TO_TRADE;
    }, [
        customSlippage,
        balanceValue,
        rawInputValue,
        isBuying,
        needsApproval,
        TRADE_STATUS_MESSAGES,
    ]);

    // **OPTIMIZED: Pre-defined CSS classes to prevent string concatenation memory leaks**
    const CARD_CLASSES = useMemo(
        () => ({
            front: {
                visible:
                    "duration-400 transition-all ease-out scale-100 transform opacity-100 csm:gap-[20px] flex flex-col gap-[20px]",
                hidden: "duration-400 transition-all ease-out pointer-events-none scale-95 transform opacity-0 csm:gap-[20px] flex flex-col gap-[20px]",
            },
            back: {
                visible:
                    "duration-400 absolute left-0 top-0 w-full transition-all ease-out scale-100 transform opacity-100 flex h-full flex-col",
                hidden: "duration-400 absolute left-0 top-0 w-full transition-all ease-out pointer-events-none scale-105 transform opacity-0 flex h-full flex-col",
            },
        }),
        [],
    );

    const BUTTON_CLASSES = useMemo(
        () => ({
            buy: {
                active: "h-full w-full rounded-lg text-[22px] font-normal transition-all duration-200 border border-green-500/40 bg-green-500/20 text-green-400 hover:bg-green-500/30",
                inactive:
                    "h-full w-full rounded-lg text-[22px] font-normal transition-all duration-200 text-white-1/60 border border-[#579FCC]/20 bg-[#233B53]/20 hover:border-[#579FCC]/40 hover:bg-[#233B53]/30",
            },
            sell: {
                active: "h-full w-full rounded-lg text-[22px] font-normal transition-all duration-200 border border-red-500/40 bg-red-500/20 text-red-400 hover:bg-red-500/30",
                inactive:
                    "h-full w-full rounded-lg text-[22px] font-normal transition-all duration-200 text-white-1/60 border border-[#579FCC]/20 bg-[#233B53]/20 hover:border-[#579FCC]/40 hover:bg-[#233B53]/30",
            },
        }),
        [],
    );

    const MAX_BUTTON_CLASSES = useMemo(
        () => ({
            max: "csm:text-[16px] w-[48px] rounded-[4px] border border-[#579FCC]/20 bg-[#233B53]/20 px-[6px] py-[5px] text-[14px] font-normal transition-colors duration-150 text-red-400 hover:border-red-500/40 hover:bg-red-500/20",
            normal: "csm:text-[16px] w-[48px] rounded-[4px] border border-[#579FCC]/20 bg-[#233B53]/20 px-[6px] py-[5px] text-[14px] font-normal transition-colors duration-150 text-[#579FCC] hover:border-[#579FCC]/40 hover:bg-[#233B53]/30",
        }),
        [],
    );

    const TRADE_BUTTON_CLASSES = useMemo(
        () => ({
            base: "rounded-lg csm:min-h-[51px] flex min-h-[42px] w-full items-center justify-center text-[20px] font-normal transition-all duration-200",
            approval:
                "border border-[#579FCC]/40 bg-[#579FCC]/20 text-[#579FCC] hover:bg-[#579FCC]/30",
            buy: "border border-green-500/40 bg-green-500/20 text-green-400 hover:bg-green-500/30",
            sell: "border border-red-500/40 bg-red-500/20 text-red-400 hover:bg-red-500/30",
            disabled: "opacity-50",
        }),
        [],
    );

    const SLIPPAGE_BUTTON_CLASSES = useMemo(
        () => ({
            hidden: "csm:text-[16px] hidden rounded-[4px] border border-[#579FCC]/20 bg-[#233B53]/20 px-[8px] py-[6px] text-[14px] font-normal transition-colors duration-150 hover:border-[#579FCC]/40 hover:bg-[#233B53]/30 sm:inline-block",
            visible:
                "csm:text-[16px] rounded-[4px] border border-[#579FCC]/20 bg-[#233B53]/20 px-[8px] py-[6px] text-[14px] font-normal transition-colors duration-150 hover:border-[#579FCC]/40 hover:bg-[#233B53]/30",
            selected: "border-red-500/40 bg-red-500/20 text-red-400",
            normal: "text-[#579FCC]",
        }),
        [],
    );

    const SLIPPAGE_MESSAGE_CLASSES = useMemo(
        () => ({
            extreme:
                "w-full rounded-[4px] border-[1px] border-dotted px-2 py-[4px] text-[14px] font-normal border-red-500/60 bg-red-500/20 text-red-300",
            high: "w-full rounded-[4px] border-[1px] border-dotted px-2 py-[4px] text-[14px] font-normal border-red-500/40 bg-red-500/10 text-red-400",
            elevated:
                "w-full rounded-[4px] border-[1px] border-dotted px-2 py-[4px] text-[14px] font-normal border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
            moderate:
                "w-full rounded-[4px] border-[1px] border-dotted px-2 py-[4px] text-[14px] font-normal border-yellow-500/30 bg-yellow-500/5 text-yellow-300",
            normal: "w-full rounded-[4px] border-[1px] border-dotted px-2 py-[4px] text-[14px] font-normal text-white-1 border-[#579FCC]/40 bg-[#233B53]/10",
        }),
        [],
    );

    // **OPTIMIZED: Memoize class selection functions**
    const getCardClass = useMemo(() => {
        return (isFlipped: boolean, side: "front" | "back") => {
            if (side === "front") {
                return isFlipped
                    ? CARD_CLASSES.front.hidden
                    : CARD_CLASSES.front.visible;
            } else {
                return isFlipped
                    ? CARD_CLASSES.back.visible
                    : CARD_CLASSES.back.hidden;
            }
        };
    }, [CARD_CLASSES]);

    const getBuyButtonClass = useMemo(() => {
        return (isBuying: boolean) => {
            return isBuying
                ? BUTTON_CLASSES.buy.active
                : BUTTON_CLASSES.buy.inactive;
        };
    }, [BUTTON_CLASSES]);

    const getSellButtonClass = useMemo(() => {
        return (isBuying: boolean) => {
            return !isBuying
                ? BUTTON_CLASSES.sell.active
                : BUTTON_CLASSES.sell.inactive;
        };
    }, [BUTTON_CLASSES]);

    const getMaxButtonClass = useMemo(() => {
        return (item: string) => {
            return item === "MAX"
                ? MAX_BUTTON_CLASSES.max
                : MAX_BUTTON_CLASSES.normal;
        };
    }, [MAX_BUTTON_CLASSES]);

    const getTradeButtonClass = useMemo(() => {
        return (
            needsApproval: boolean,
            isBuying: boolean,
            isDisabled: boolean,
        ) => {
            let classes = TRADE_BUTTON_CLASSES.base;

            if (needsApproval) {
                classes += " " + TRADE_BUTTON_CLASSES.approval;
            } else if (isBuying) {
                classes += " " + TRADE_BUTTON_CLASSES.buy;
            } else {
                classes += " " + TRADE_BUTTON_CLASSES.sell;
            }

            if (isDisabled) {
                classes += " " + TRADE_BUTTON_CLASSES.disabled;
            }

            return classes;
        };
    }, [TRADE_BUTTON_CLASSES]);

    const getSlippageButtonClass = useMemo(() => {
        return (
            value: string,
            customSlippage: string,
            isHidden: boolean = false,
        ) => {
            let baseClass = isHidden
                ? SLIPPAGE_BUTTON_CLASSES.hidden
                : SLIPPAGE_BUTTON_CLASSES.visible;
            let stateClass =
                customSlippage === value
                    ? SLIPPAGE_BUTTON_CLASSES.selected
                    : SLIPPAGE_BUTTON_CLASSES.normal;
            return `${baseClass} ${stateClass}`;
        };
    }, [SLIPPAGE_BUTTON_CLASSES]);

    const getSlippageMessageClass = useMemo(() => {
        return (slippageValue: number) => {
            if (slippageValue >= 25) return SLIPPAGE_MESSAGE_CLASSES.extreme;
            if (slippageValue >= 15) return SLIPPAGE_MESSAGE_CLASSES.high;
            if (slippageValue >= 10) return SLIPPAGE_MESSAGE_CLASSES.elevated;
            if (slippageValue >= 5) return SLIPPAGE_MESSAGE_CLASSES.moderate;
            return SLIPPAGE_MESSAGE_CLASSES.normal;
        };
    }, [SLIPPAGE_MESSAGE_CLASSES]);

    return (
        <>
            {/* front card */}
            <div
                className={`flex h-auto min-h-[390px] w-full flex-col gap-5 [@media(min-width:541px)]:min-h-[420px]`}
                id={`${coinAddr}-widget`}
            >
                {/* Card fade container */}
                <div className="relative h-auto w-full">
                    <div className="relative w-full">
                        {/* Front of the card */}
                        <div className={getCardClass(isFlipped, "front")}>
                            {/* buttons */}
                            <div className="csm:min-h-[50px] grid min-h-[42px] w-full grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        setIsBuying(true);
                                    }}
                                    className={getBuyButtonClass(isBuying)}
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => {
                                        setIsBuying(false);
                                    }}
                                    className={getSellButtonClass(!isBuying)}
                                >
                                    Sell
                                </button>
                            </div>

                            {/* switch to coin */}
                            <div className="flex w-full items-center justify-between">
                                <p className="rounded-[3px] border border-[#579FCC]/20 bg-[#233B53]/20 px-[6px] text-[15px] font-normal text-[#579FCC]">
                                    Your balance:{" "}
                                    {isBuying
                                        ? formatSuiWidget(balanceValue)
                                        : formatTokens(balanceValue)}
                                </p>
                                <p
                                    onClick={handleFlip}
                                    className="cursor-pointer rounded-[3px] border border-[#579FCC]/40 bg-[#579FCC]/20 px-[6px] text-[15px] font-normal text-[#579FCC] transition-colors hover:bg-[#579FCC]/30"
                                >
                                    Slippage
                                </p>
                            </div>

                            {/* Ticker input */}
                            <div className="csm:min-h-[50px] grid min-h-[42px] w-full grid-cols-[1fr,110px] rounded-lg border-[1px] border-[#579FCC]/40 bg-[#233B53]/10 pl-2">
                                <input
                                    placeholder="0"
                                    type="numeric"
                                    value={rawInputValue}
                                    className="text-white-1 placeholder:text-white-1/60 h-full w-full border-r-[1px] border-[#579FCC]/40 bg-transparent text-[22px] font-normal focus:outline-none"
                                    name="ticker"
                                    id={coinAddr}
                                    onFocus={(e) => {
                                        if (rawInputValue === "0") {
                                            setRawInputValue("");
                                        }
                                    }}
                                    onChange={(e) =>
                                        handleInput(e.target.value)
                                    }
                                />
                                <div className="flex items-center justify-center gap-2">
                                    <p className="text-[15px] font-normal text-[#579FCC]">
                                        {isBuying
                                            ? "SUI"
                                            : `$${coin?.symbol?.slice(0, 6)}`}
                                    </p>
                                    <div className="flex h-[32px] w-[32px] items-center justify-center">
                                        <Image
                                            src={
                                                isBuying
                                                    ? "/assets/SUI.svg"
                                                    : coin?.avatarUrl ||
                                                      "/assets/general/kappaphl.jpg"
                                            }
                                            alt=""
                                            width={30}
                                            height={30}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Max */}
                            <div className="flex w-full items-center justify-center gap-2">
                                {isBuying
                                    ? maxBuys.map((item, index) => {
                                          return (
                                              <button
                                                  key={`${index}-buy`}
                                                  onClick={() =>
                                                      handleInput(item)
                                                  }
                                                  className={getMaxButtonClass(
                                                      item,
                                                  )}
                                              >
                                                  {item}
                                              </button>
                                          );
                                      })
                                    : maxSells.map((item, index) => {
                                          return (
                                              <button
                                                  key={`${index}-sell`}
                                                  onClick={() =>
                                                      handleInput(item)
                                                  }
                                                  className={getMaxButtonClass(
                                                      item,
                                                  )}
                                              >
                                                  {item}
                                              </button>
                                          );
                                      })}
                            </div>

                            {/* You receive */}
                            <div className="flex w-full items-center justify-between">
                                <p className="text-[14px] font-normal text-[#579FCC]">
                                    You receive:
                                </p>
                                <p className="text-white-1 text-[14px] font-normal">
                                    {isBuying
                                        ? `${adjustedToken} $${(coin?.symbol?.slice(0, 6) || "Ticker").toUpperCase()}`
                                        : `${adjustedSui} SUI`}
                                </p>
                            </div>

                            {/* System messages */}
                            <div className="flex w-full flex-col gap-1">
                                <div>
                                    <p className="text-[15px] font-normal text-[#579FCC]">
                                        System messages:{" "}
                                    </p>
                                    <p className="text-white-1 w-full rounded-[4px] border-[1px] border-dotted border-[#579FCC]/40 bg-[#233B53]/10 px-2 py-[4px] text-[14px] font-normal">
                                        {!isConnected
                                            ? "Please connect your wallet to continue"
                                            : !rawInputValue ||
                                                rawInputValue === "0" ||
                                                rawInputValue === "0."
                                              ? "Please enter amount to trade"
                                              : tradeStatus}
                                    </p>
                                </div>
                            </div>

                            {/* Place trade button */}
                            <button
                                onClick={async () => {
                                    if (isBuying) {
                                        await handleBuy();
                                    } else {
                                        await handleSell();
                                    }
                                }}
                                disabled={
                                    !isConnected ||
                                    !rawInputValue ||
                                    rawInputValue === "0" ||
                                    rawInputValue === "0." ||
                                    !(
                                        balanceValue &&
                                        parseFloat(balanceValue) >=
                                            parseFloat(rawInputValue)
                                    ) ||
                                    loadingTransaction ||
                                    isTransactionPending
                                }
                                className={getTradeButtonClass(
                                    needsApproval,
                                    isBuying,
                                    !(
                                        balanceValue &&
                                        parseFloat(balanceValue) >=
                                            parseFloat(rawInputValue)
                                    ),
                                )}
                            >
                                {loadingTransaction || isTransactionPending ? (
                                    <img
                                        src="/assets/cointurn.gif"
                                        alt="Loading..."
                                        width={48}
                                        height={48}
                                        className="opacity-90"
                                    />
                                ) : needsApproval ? (
                                    "Approve"
                                ) : isBuying ? (
                                    <span className="text-[24px] font-bold">
                                        Buy
                                    </span>
                                ) : (
                                    <span className="text-[24px] font-bold">
                                        Sell
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Back of the card */}
                        <div className={getCardClass(isFlipped, "back")}>
                            <div className="csm:gap-[24px] flex flex-grow flex-col gap-[20px]">
                                <p className="text-[12px] font-normal text-[#579FCC]">
                                    Set max. slippage (%)
                                </p>
                                {/* input ------>  */}
                                <div className="csm:min-h-[50px] grid min-h-[46px] w-full grid-cols-[1fr,110px] rounded-lg border-[1px] border-[#579FCC]/40 bg-[#233B53]/10 px-2">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={customSlippage}
                                        className="text-white-1 placeholder:text-white-1/60 h-full w-full border-r-[1px] border-[#579FCC]/40 bg-transparent text-[22px] font-normal focus:outline-none"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*\.?\d*$/.test(value)) {
                                                handleCustomSlippageChange(
                                                    value,
                                                );
                                            }
                                        }}
                                    />
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            className="flex items-center justify-center rounded-[2px] border-[1px] border-[#579FCC]/40 bg-[#233B53]/20 transition-colors hover:bg-[#233B53]/30"
                                            onClick={() => {
                                                const newValue = (
                                                    parseFloat(customSlippage) -
                                                    1
                                                ).toFixed(1);
                                                handleCustomSlippageChange(
                                                    newValue,
                                                );
                                            }}
                                        >
                                            <FiMinus className="text-[20px] text-[#579FCC]" />
                                        </button>
                                        <button
                                            className="flex items-center justify-center rounded-[2px] border-[1px] border-[#579FCC]/40 bg-[#233B53]/20 transition-colors hover:bg-[#233B53]/30"
                                            onClick={() => {
                                                const newValue = (
                                                    parseFloat(customSlippage) +
                                                    1
                                                ).toFixed(1);
                                                handleCustomSlippageChange(
                                                    newValue,
                                                );
                                            }}
                                        >
                                            <AiOutlinePlus className="text-[20px] text-[#579FCC]" />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick slippage options */}
                                <div className="flex w-full flex-wrap items-center justify-center gap-2">
                                    {[
                                        "0.1",
                                        "0.5",
                                        "1",
                                        "2",
                                        "5",
                                        "10",
                                        "15",
                                        // 20% only on sm and up
                                    ].map((value) =>
                                        value === "20" ? (
                                            <button
                                                key={value}
                                                onClick={() =>
                                                    handleCustomSlippageChange(
                                                        value,
                                                    )
                                                }
                                                className={getSlippageButtonClass(
                                                    value,
                                                    customSlippage,
                                                    true,
                                                )}
                                            >
                                                {value}%
                                            </button>
                                        ) : (
                                            <button
                                                key={value}
                                                onClick={() =>
                                                    handleCustomSlippageChange(
                                                        value,
                                                    )
                                                }
                                                className={getSlippageButtonClass(
                                                    value,
                                                    customSlippage,
                                                )}
                                            >
                                                {value}%
                                            </button>
                                        ),
                                    )}
                                </div>

                                {/* System messages */}
                                <div className="flex w-full flex-col gap-1">
                                    <p className="text-[15px] font-normal text-[#579FCC]">
                                        System messages:{" "}
                                    </p>
                                    <p
                                        className={getSlippageMessageClass(
                                            parseFloat(customSlippage),
                                        )}
                                    >
                                        {(() => {
                                            const slippageValue =
                                                parseFloat(customSlippage);
                                            if (slippageValue >= 25)
                                                return TRADE_STATUS_MESSAGES.EXTREME_SLIPPAGE;
                                            if (slippageValue >= 15)
                                                return TRADE_STATUS_MESSAGES.HIGH_SLIPPAGE;
                                            if (slippageValue >= 10)
                                                return TRADE_STATUS_MESSAGES.ELEVATED_SLIPPAGE;
                                            if (slippageValue >= 5)
                                                return "⚡ MODERATE RISK: 5%+ slippage may result in noticeable price differences. Monitor trade size and market conditions.";
                                            if (slippageValue >= 2)
                                                return "✅ REASONABLE: 2-5% slippage is acceptable for most trades while providing execution flexibility.";
                                            if (slippageValue >= 0.5)
                                                return "✅ CONSERVATIVE: Low slippage provides better price protection but may cause trade failures in volatile markets.";
                                            if (slippageValue > 0)
                                                return "⚡ VERY LOW: Extremely low slippage may cause frequent trade failures, especially during high volatility.";
                                            return "This is the maximum amount of slippage you are willing to accept when placing trades.";
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* Save and return button - positioned at bottom */}
                            <div className="mt-auto pt-4">
                                <button
                                    onClick={handleFlip}
                                    className="csm:min-h-[51px] flex min-h-[42px] w-full items-center justify-center rounded-lg border border-[#579FCC]/40 bg-[#579FCC]/20 text-[20px] font-normal text-[#579FCC] transition-all duration-200 hover:bg-[#579FCC]/30"
                                >
                                    Save & Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BuyAndSellCoreWidget;
