"use client";

import { useWalletState } from "@@/components/shared/Modals/ConnectorModal";
import { SdkContext } from "@@/contexts/SdkContext";
import { UserContext } from "@@/contexts/UserContext";
import {
    bondingCurveConfigObjectId,
    bondingCurveGlobalPauseStatusObjectId,
    bondingCurveModuleId,
    bondingCurvePoolsObjectId,
    getCoinTypeArgument,
} from "@@/utils/sui";
import { Menu } from "@mantine/core";
import {
    useCurrentAccount,
    useCurrentWallet,
    useSignAndExecuteTransaction,
    useSuiClient,
} from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import localFont from "next/font/local";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiX } from "react-icons/hi";
import { IoIosArrowDown, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { RiArrowDownSLine } from "react-icons/ri";
import { RxCrossCircled } from "react-icons/rx";

import { ChainNameEnum } from "@kit/sdk";

import { buyMathDev, getModifiedCoinBytecode } from "../../../libs/web3";

// Import Doto-Semibold font
const dotoSemibold = localFont({
    src: "../../../fonts/Doto/Doto-SemiBold.ttf",
});

interface CoinData {
    name: string;
    ticker: string;
    file: File | null;
    imageUrl?: string;
    description: string;
    tags?: string[] | null | undefined;
    twitterLink?: string;
    telegramLink?: string;
    websiteLink?: string;
    hasMaxBuy: boolean;
}

interface DeployerTrayProps {
    onClose: () => void;
}

const DeployerTray: React.FC<DeployerTrayProps> = ({ onClose }) => {
    // **OPTIMIZED: Pre-defined CSS classes to prevent string concatenation memory leaks**
    const FORM_CONTAINER_CLASSES = useMemo(
        () => ({
            enabled: "flex flex-col gap-6",
            disabled: "flex flex-col gap-6 pointer-events-none opacity-50",
        }),
        [],
    );

    const INPUT_CLASSES = useMemo(
        () => ({
            normal: "h-[40px] w-full rounded-md border-[1px] bg-[#1E2025] px-4 text-[14px] font-normal text-white transition-colors placeholder:text-[#6D6D6D] focus:outline-none border-[#6D6D6D]/30 focus:border-[#38A1D0]",
            error: "h-[40px] w-full rounded-md border-[1px] bg-[#1E2025] px-4 text-[14px] font-normal text-white transition-colors placeholder:text-[#6D6D6D] focus:outline-none border-red-500",
        }),
        [],
    );

    const TEXTAREA_CLASSES = useMemo(
        () => ({
            normal: "h-[80px] w-full resize-none rounded-md border-[1px] bg-[#1E2025] px-4 py-2 text-[14px] font-normal text-white transition-colors placeholder:text-[#6D6D6D] focus:outline-none border-[#6D6D6D]/30 focus:border-[#38A1D0]",
            error: "h-[80px] w-full resize-none rounded-md border-[1px] bg-[#1E2025] px-4 py-2 text-[14px] font-normal text-white transition-colors placeholder:text-[#6D6D6D] focus:outline-none border-red-500",
        }),
        [],
    );

    const FILE_UPLOAD_CLASSES = useMemo(
        () => ({
            normal: "flex h-[40px] items-center gap-4 rounded-md border-[1px] border-[#6D6D6D]/30 bg-[#1E2025] pr-4 focus-within:border-[#38A1D0]",
            error: "flex h-[40px] items-center gap-4 rounded-md border-[1px] border-[#6D6D6D]/30 bg-[#1E2025] pr-4 focus-within:border-[#38A1D0] border-red-500",
        }),
        [],
    );

    const FILE_NAME_CLASSES = useMemo(
        () => ({
            hasFile: "text-[12px] text-white truncate font-normal",
            noFile: "text-[12px] text-[#6D6D6D] truncate font-normal",
        }),
        [],
    );

    const ARROW_CLASSES = useMemo(
        () => ({
            expanded:
                "h-5 w-5 text-[#38A1D0] transition-transform duration-200 rotate-180",
            collapsed:
                "h-5 w-5 text-[#38A1D0] transition-transform duration-200",
        }),
        [],
    );

    const SOCIAL_INPUT_CLASSES = useMemo(
        () => ({
            valid: "h-[40px] w-full rounded-lg border-[1px] bg-[#1E2025] px-4 text-[14px] font-normal text-white transition-colors placeholder:text-[#6D6D6D] focus:outline-none border-[#6D6D6D]/30 focus:border-[#38A1D0]",
            invalid:
                "h-[40px] w-full rounded-lg border-[1px] bg-[#1E2025] px-4 text-[14px] font-normal text-white transition-colors placeholder:text-[#6D6D6D] focus:outline-none border-red-500",
        }),
        [],
    );

    // **OPTIMIZED: Memoized class selection functions**
    const getFormContainerClass = useMemo(() => {
        return (isConnected: boolean) => {
            return isConnected
                ? FORM_CONTAINER_CLASSES.enabled
                : FORM_CONTAINER_CLASSES.disabled;
        };
    }, [FORM_CONTAINER_CLASSES]);

    const getInputClass = useMemo(() => {
        return (hasError: boolean) => {
            return hasError ? INPUT_CLASSES.error : INPUT_CLASSES.normal;
        };
    }, [INPUT_CLASSES]);

    const getTextareaClass = useMemo(() => {
        return (hasError: boolean) => {
            return hasError ? TEXTAREA_CLASSES.error : TEXTAREA_CLASSES.normal;
        };
    }, [TEXTAREA_CLASSES]);

    const getFileUploadClass = useMemo(() => {
        return (hasError: boolean) => {
            return hasError
                ? FILE_UPLOAD_CLASSES.error
                : FILE_UPLOAD_CLASSES.normal;
        };
    }, [FILE_UPLOAD_CLASSES]);

    const getFileNameClass = useMemo(() => {
        return (hasFile: boolean) => {
            return hasFile
                ? FILE_NAME_CLASSES.hasFile
                : FILE_NAME_CLASSES.noFile;
        };
    }, [FILE_NAME_CLASSES]);

    const getArrowClass = useMemo(() => {
        return (isExpanded: boolean) => {
            return isExpanded
                ? ARROW_CLASSES.expanded
                : ARROW_CLASSES.collapsed;
        };
    }, [ARROW_CLASSES]);

    const getSocialInputClass = useMemo(() => {
        return (isValid: boolean) => {
            return isValid
                ? SOCIAL_INPUT_CLASSES.valid
                : SOCIAL_INPUT_CLASSES.invalid;
        };
    }, [SOCIAL_INPUT_CLASSES]);

    // Prevent background scroll when tray is open, but allow tray scrolling
    useEffect(() => {
        // Check if device is mobile
        const isMobile =
            window.innerWidth < 768 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
            );

        // Only prevent background scroll on desktop
        if (isMobile) {
            return; // Allow all scrolling on mobile
        }

        // Save the current scroll position
        const scrollY = window.scrollY;

        // Prevent scroll events only if they're not from within the tray
        const preventBackgroundScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            const trayContent = target.closest("[data-tray-content]");

            // If scrolling within the tray, check for boundary conditions
            if (trayContent) {
                const scrollableElement = trayContent.querySelector(
                    "[data-tray-scroll]",
                ) as HTMLElement;
                if (scrollableElement && e.type === "wheel") {
                    const wheelEvent = e as WheelEvent;
                    const { scrollTop, scrollHeight, clientHeight } =
                        scrollableElement;

                    // Prevent scroll chaining at boundaries
                    const isAtTop = scrollTop === 0;
                    const isAtBottom =
                        scrollTop + clientHeight >= scrollHeight - 1;

                    if (
                        (isAtTop && wheelEvent.deltaY < 0) ||
                        (isAtBottom && wheelEvent.deltaY > 0)
                    ) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
                return; // Allow normal scrolling within tray
            }

            // Prevent all background scrolling
            e.preventDefault();
            e.stopPropagation();
            // Force scroll position to stay the same
            window.scrollTo(0, scrollY);
        };

        const preventKeyScroll = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;

            // Don't prevent keys if user is typing in an input or textarea
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            // Allow scrolling if the event originated from within the tray
            if (target.closest("[data-tray-content]")) {
                return;
            }

            // Prevent arrow keys, page up/down, home/end, spacebar from scrolling
            if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
                e.preventDefault();
                window.scrollTo(0, scrollY);
            }
        };

        // Add event listeners for background scroll prevention (desktop only)
        window.addEventListener("scroll", preventBackgroundScroll, {
            passive: false,
        });
        document.addEventListener("wheel", preventBackgroundScroll, {
            passive: false,
        });
        document.addEventListener("keydown", preventKeyScroll, {
            passive: false,
        });

        // Cleanup function to restore scroll when component unmounts
        return () => {
            window.removeEventListener("scroll", preventBackgroundScroll);
            document.removeEventListener("wheel", preventBackgroundScroll);
            document.removeEventListener("keydown", preventKeyScroll);
        };
    }, []);

    // State management (same as deployer page)
    const [fileName, setFileName] = useState<string>("No file chosen");
    const [isExpanded, setIsExpended] = useState(false);
    const [preListing, setPreListing] = useState<string>("option1");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isWalletTransactionPending, setIsWalletTransactionPending] =
        useState(false);
    const [coinData, setCoinData] = useState<CoinData>({
        name: "",
        ticker: "",
        file: null,
        imageUrl: "",
        description: "",
        tags: [],
        twitterLink: "",
        telegramLink: "",
        websiteLink: "",
        hasMaxBuy: false,
    });

    // Contexts and hooks
    const router = useRouter();
    const currentAccount = useCurrentAccount();
    const { currentWallet } = useCurrentWallet();
    const { user } = useContext(UserContext);
    const { sdk } = useContext(SdkContext);
    const walletSuiClient = useSuiClient();

    // Use centralized wallet state
    const {
        state: walletState,
        actions: walletActions,
        isModalOpen,
    } = useWalletState();

    // Transaction hooks
    const {
        mutate: coinCreateSignAndExecuteTransaction,
        data: coinCreateSignAndExecuteTransactionData,
        error: coinCreateSignAndExecuteTransactionError,
    } = useSignAndExecuteTransaction({
        execute: ({ bytes, signature }) => {
            return walletSuiClient.executeTransactionBlock({
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
        mutate: curveCreateSignAndExecuteTransaction,
        data: curveCreateSignAndExecuteTransactionData,
        error: curveCreateSignAndExecuteTransactionError,
    } = useSignAndExecuteTransaction({
        execute: ({ bytes, signature }) => {
            return walletSuiClient.executeTransactionBlock({
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
        mutate: firstBuySignAndExecuteTransaction,
        data: firstBuySignAndExecuteTransactionData,
        error: firstBuySignAndExecuteTransactionError,
    } = useSignAndExecuteTransaction({
        execute: ({ bytes, signature }) => {
            return walletSuiClient.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                    showObjectChanges: true,
                },
            });
        },
    });

    // Additional state
    const [publicSuiClient] = useState(
        new SuiClient({
            url: "https://fullnode.mainnet.sui.io",
        }),
    );
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [linkValidation, setLinkValidation] = useState({
        twitter: true,
        telegram: true,
        website: true,
    });
    const [fileSizeError, setFileSizeError] = useState(false);
    const [fileError, setFileError] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        name: false,
        ticker: false,
        file: false,
        description: false,
        uniqueness: false,
        nameTickerDuplicate: false,
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isImagePreviewValid, setIsImagePreviewValid] = useState<
        boolean | null
    >(null);
    const [devBuyAmount, setDevBuyAmount] = useState("");
    const [userSuiBalance, setUserSuiBalance] = useState("");
    const [suiToUsdRate, setSuiToUsdRate] = useState("");

    // Helper functions for capitalization display
    const capitalizeForDisplay = (value: string): string => {
        return value
            .split(" ")
            .map((word) => {
                if (word.length === 0) return word;
                return (
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                );
            })
            .join(" ");
    };

    const capitalizeTickerForDisplay = (value: string): string => {
        return value.toUpperCase();
    };

    const [coinCreateMetadata, setCoinCreateMetadata] = useState({
        decimals: 6,
        symbol: capitalizeTickerForDisplay(coinData.ticker),
        name: capitalizeForDisplay(coinData.name),
        description: coinData.description,
        supply: 9,
        icon: "",
        twitter: coinData.twitterLink,
        website: coinData.websiteLink,
        telegram: coinData.telegramLink,
        percent: 0,
        maxTx: "false",
        tags: coinData.tags,
    });
    const [publishedPackageId, setPublishedPackageId] = useState<string | null>(
        null,
    );
    const [hasRendered, setHasRendered] = useState(false);

    const maxTagLength = 12;
    const SHOW_SUPPLY_SECTION = false;

    // Validation functions (same as deployer page)
    const validateAllFields = () => {
        const nameValidation = validateName(coinData.name);
        const tickerValidation = validateTicker(coinData.ticker);
        const descriptionValidation =
            coinData.description?.trim() &&
            coinData.description.length >= 2 &&
            coinData.description.length <= 256;

        const usingImageUrl = !!coinData.imageUrl && !coinData.file;
        const hasValidImageUrl =
            usingImageUrl &&
            isValidHttpUrl(coinData.imageUrl) &&
            isImagePreviewValid === true;

        const nameLower = coinData.name.trim().toLowerCase();
        const tickerLower = coinData.ticker.trim().toLowerCase();
        const descriptionLower = coinData.description.trim().toLowerCase();
        const nameTrimmed = coinData.name.trim();
        const tickerTrimmed = coinData.ticker.trim();

        let uniquenessError = false;
        let nameTickerDuplicateError = false;

        if (
            nameTrimmed &&
            tickerTrimmed &&
            nameTrimmed === nameTrimmed.toUpperCase() &&
            tickerTrimmed === tickerTrimmed.toUpperCase() &&
            nameTrimmed === tickerTrimmed
        ) {
            nameTickerDuplicateError = true;
        }

        if (
            (nameLower && descriptionLower && nameLower === descriptionLower) ||
            (tickerLower &&
                descriptionLower &&
                tickerLower === descriptionLower)
        ) {
            uniquenessError = true;
        }

        const errors = {
            name: !nameValidation.isValid,
            ticker: !tickerValidation.isValid,
            file:
                !(coinData.file || hasValidImageUrl) ||
                fileSizeError ||
                fileError,
            description: !descriptionValidation,
            uniqueness: uniquenessError,
            nameTickerDuplicate: nameTickerDuplicateError,
        };

        setValidationErrors(errors);
        return !Object.values(errors).some((error) => error);
    };

    const validateName = (
        name: string,
    ): { isValid: boolean; error: string } => {
        if (!name || !name.trim()) {
            return { isValid: false, error: "Name is required" };
        }
        const trimmedName = name.trim();
        if (trimmedName.length < 1) {
            return {
                isValid: false,
                error: "Name must be at least 1 character",
            };
        }
        if (trimmedName.length > 32) {
            return {
                isValid: false,
                error: "Name cannot exceed 32 characters",
            };
        }
        const validCharRegex = /^[A-Za-z0-9\s]+$/;
        if (!validCharRegex.test(trimmedName)) {
            return {
                isValid: false,
                error: "Name can only contain letters, numbers, and spaces",
            };
        }
        return { isValid: true, error: "" };
    };

    const validateTicker = (
        ticker: string,
    ): { isValid: boolean; error: string } => {
        if (!ticker || !ticker.trim()) {
            return { isValid: false, error: "Ticker is required" };
        }
        const trimmedTicker = ticker.trim();
        if (trimmedTicker.length < 1) {
            return {
                isValid: false,
                error: "Ticker must be at least 1 character",
            };
        }
        if (trimmedTicker.length > 12) {
            return {
                isValid: false,
                error: "Ticker cannot exceed 12 characters",
            };
        }
        const validCharRegex = /^[A-Za-z0-9]+$/;
        if (!validCharRegex.test(trimmedTicker)) {
            return {
                isValid: false,
                error: "Ticker can only contain letters and numbers",
            };
        }
        return { isValid: true, error: "" };
    };

    const formatSocialLink = (
        url: string,
        type: "twitter" | "telegram" | "website",
    ): string => {
        if (!url) return "";
        let formattedUrl = url.trim().toLowerCase();
        formattedUrl = formattedUrl.replace(/^(https?:\/\/)?(www\.)?/, "");

        switch (type) {
            case "twitter":
                formattedUrl = formattedUrl.replace(
                    /^(twitter\.com|x\.com)\//,
                    "",
                );
                return `https://twitter.com/${formattedUrl}`;
            case "telegram":
                formattedUrl = formattedUrl.replace(
                    /^(t\.me|telegram\.me)\//,
                    "",
                );
                return `https://t.me/${formattedUrl}`;
            case "website":
                return `https://${formattedUrl}`;
            default:
                return formattedUrl;
        }
    };

    const validateTwitterLink = (url: string) => {
        if (!url) return true;
        const formattedUrl = formatSocialLink(url, "twitter");
        const twitterRegex = /^https:\/\/twitter\.com\/[a-zA-Z0-9_]{1,15}\/?$/;
        return twitterRegex.test(formattedUrl);
    };

    const validateTelegramLink = (url: string) => {
        if (!url) return true;
        const formattedUrl = formatSocialLink(url, "telegram");
        const telegramRegex = /^https:\/\/t\.me\/[a-zA-Z0-9_]{5,32}\/?$/;
        return telegramRegex.test(formattedUrl);
    };

    const validateWebsiteLink = (url: string) => {
        if (!url) return true;
        const formattedUrl = formatSocialLink(url, "website");
        try {
            new URL(formattedUrl);
            return true;
        } catch {
            return false;
        }
    };

    const isValidHttpUrl = (value?: string) => {
        if (!value) return false;
        try {
            const u = new URL(value);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    };

    // Event handlers
    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            e.preventDefault();
            const lowercaseTag = inputValue.trim().toLowerCase(); // Convert to lowercase
            if (
                lowercaseTag.length <= maxTagLength &&
                tags.length < 4 &&
                !tags.includes(lowercaseTag) // Check against lowercase tags
            ) {
                const newTags = [...tags, lowercaseTag]; // Store lowercase tag
                setTags(newTags);
                setCoinData({
                    ...coinData,
                    tags: newTags,
                });
                setInputValue("");
            }
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove);
        setTags(newTags);
        setCoinData({
            ...coinData,
            tags: newTags,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ["image/jpeg", "image/png"];
            if (!validTypes.includes(file.type)) {
                setFileError(true);
                toast.error("Only PNG and JPG files are allowed");
                e.target.value = "";
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setFileSizeError(true);
                setFileError(true);
                toast.error("Image file size must be less than 2MB");
                e.target.value = "";
                return;
            }

            setFileSizeError(false);
            setFileError(false);
            const parts = file.name.split(".");
            const ext = parts.pop() || "";
            const name = parts.join(".");
            const truncatedName = name.length > 4 ? name.substring(0, 4) : name;
            setFileName(`${truncatedName}.${ext}`);

            setCoinData({
                ...coinData,
                file: file,
            });

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
                setIsImagePreviewValid(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(false);
        const value = e.target.value;

        // Store in lowercase, but allow proper formatting for display
        const lowercaseValue = value.toLowerCase();

        setCoinData({
            ...coinData,
            name: lowercaseValue,
        });
        validateAllFields();
    };

    const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(false);
        const value = e.target.value;
        if (!/^[A-Za-z0-9]*$/.test(value)) {
            toast.error("Ticker can only contain letters and numbers");
            return;
        }

        // Store in lowercase
        const lowercaseValue = value.toLowerCase();

        setCoinData({
            ...coinData,
            ticker: lowercaseValue,
        });
        validateAllFields();
    };

    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setError(false);
        setCoinData({
            ...coinData,
            description: e.target.value,
        });
        validateAllFields();
    };

    // Effects
    useEffect(() => {
        if (!user) {
            onClose();
        }
    }, [user, onClose]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (currentAccount) {
                const client = new SuiClient({
                    url: "https://fullnode.mainnet.sui.io",
                });
                const balance = await client.getBalance({
                    owner: currentAccount.address,
                    coinType: "0x2::sui::SUI",
                });
                setUserSuiBalance(balance.totalBalance.toString());
            }
        };
        fetchBalance();
    }, [currentAccount]);

    useEffect(() => {
        async function fetchSuiPrice() {
            try {
                const res = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd",
                );
                const data = await res.json();
                if (data && data.sui && data.sui.usd) {
                    setSuiToUsdRate(data.sui.usd.toString());
                }
            } catch (e) {
                setSuiToUsdRate("0");
            }
        }
        fetchSuiPrice();
    }, []);

    // Form validation effect
    useEffect(() => {
        const nameValidation = validateName(coinData.name);
        const tickerValidation = validateTicker(coinData.ticker);
        const descriptionValidation =
            coinData.description?.trim() &&
            coinData.description.length >= 2 &&
            coinData.description.length <= 256;

        const name = coinData.name.trim().toLowerCase();
        const ticker = coinData.ticker.trim().toLowerCase();
        const description = coinData.description.trim().toLowerCase();
        const nameTrimmed = coinData.name.trim();
        const tickerTrimmed = coinData.ticker.trim();

        let uniquenessError = false;
        let nameTickerDuplicateError = false;

        if (
            nameTrimmed &&
            tickerTrimmed &&
            nameTrimmed === nameTrimmed.toUpperCase() &&
            tickerTrimmed === tickerTrimmed.toUpperCase() &&
            nameTrimmed === tickerTrimmed
        ) {
            nameTickerDuplicateError = true;
        }

        if (
            (name && description && name === description) ||
            (ticker && description && ticker === description)
        ) {
            uniquenessError = true;
        }

        const usingImageUrl = !!coinData.imageUrl && !coinData.file;
        const hasValidImageUrl =
            usingImageUrl &&
            isValidHttpUrl(coinData.imageUrl) &&
            isImagePreviewValid === true;
        const errors = {
            name: !nameValidation.isValid,
            ticker: !tickerValidation.isValid,
            file:
                !(coinData.file || hasValidImageUrl) ||
                fileSizeError ||
                fileError,
            description: !descriptionValidation,
            uniqueness: uniquenessError,
            nameTickerDuplicate: nameTickerDuplicateError,
        };

        setValidationErrors(errors);
        setIsFormValid(!Object.values(errors).some((error) => error));
    }, [
        coinData.name,
        coinData.ticker,
        coinData.file,
        coinData.imageUrl,
        coinData.description,
        fileSizeError,
        fileError,
        isImagePreviewValid,
    ]);

    // Calculate tokens helper
    // Use shared math from libs/web3: input in SUI, output in smallest token units

    const calculateTokens = (amount: number): string => {
        if (isNaN(amount) || amount <= 0) return "0";
        const tokensRaw = buyMathDev(amount);
        return tokensRaw.toLocaleString(undefined, {
            maximumFractionDigits: 2,
        });
    };

    // Main coin creation function
    const handleCreateCoin = async () => {
        if (!currentAccount) {
            toast.error("Wallet not connected.");
            walletActions.openConnectorModal();
            return;
        }

        if (!user) {
            toast.error("Please connect your account");
            return;
        }

        const { name, ticker, file, description } = coinData;

        // Validate name
        const nameValidation = validateName(name);
        if (!nameValidation.isValid) {
            toast.error(nameValidation.error);
            setError(true);
            return;
        }

        // Validate ticker
        const tickerValidation = validateTicker(ticker);
        if (!tickerValidation.isValid) {
            toast.error(tickerValidation.error);
            setError(true);
            return;
        }

        // Validate: require file OR (valid URL with successful preview)
        const usingImageUrlForCreation = !!coinData.imageUrl && !file;
        if (
            (!file && !coinData.imageUrl) ||
            (usingImageUrlForCreation &&
                (!isValidHttpUrl(coinData.imageUrl) ||
                    isImagePreviewValid !== true))
        ) {
            toast.error(
                "Please provide a valid image URL or upload a token image",
            );
            setError(true);
            return;
        }

        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        if (file && file.size > 2 * 1024 * 1024) {
            toast.error("Image file size must be less than 2MB");
            setError(true);
            return;
        }

        // Validate description
        if (
            !description?.trim() ||
            description.length < 2 ||
            description.length > 256
        ) {
            toast.error("Description must be between 2 and 256 characters");
            setError(true);
            return;
        }

        // Uniqueness check (case-insensitive, trimmed)
        const nameLower = name.trim().toLowerCase();
        const tickerLower = ticker.trim().toLowerCase();
        const descriptionLower = description.trim().toLowerCase();
        if (
            (nameLower && descriptionLower && nameLower === descriptionLower) ||
            (tickerLower &&
                descriptionLower &&
                tickerLower === descriptionLower)
        ) {
            toast.error("Description must be different from name and ticker.");
            setError(true);
            return;
        }

        setError(false);
        setIsWalletTransactionPending(true);

        let avatarUrl = "";
        if (coinData?.imageUrl) {
            // Use provided image URL directly
            avatarUrl = coinData.imageUrl.trim();
        } else if (coinData?.file) {
            const [resultAvatar] = await sdk.coins.uploadCoinAssets({
                avatar: coinData.file,
            });
            console.log("resultAvatar", resultAvatar);

            if (resultAvatar.status === "success") {
                avatarUrl = resultAvatar.data.avatarUrl!;
            }

            if (resultAvatar.status !== "success") {
                toast.error("Coin not created");
                setIsWalletTransactionPending(false);
                return;
            }
        }

        const coinMetadata = {
            decimals: 6,
            symbol: capitalizeTickerForDisplay(coinData.ticker),
            name: capitalizeForDisplay(coinData.name),
            description: coinData.description,
            supply: 9,
            icon: avatarUrl,
            twitter: coinData.twitterLink || "",
            website: coinData.websiteLink || "",
            telegram: coinData.telegramLink || "",
            percent: 0,
            maxTx: coinData.hasMaxBuy ? "true" : "false",
            tags: coinData.tags || [],
        };
        setCoinCreateMetadata(coinMetadata);
        console.log({ coinMetadata });

        const coinCreateTransaction = new Transaction();
        const [upgradeCap] = coinCreateTransaction.publish({
            modules: [getModifiedCoinBytecode(coinMetadata)],
            dependencies: ["0x1", "0x2"],
        });

        coinCreateTransaction.transferObjects([upgradeCap], "0x0");

        try {
            coinCreateSignAndExecuteTransaction({
                transaction: coinCreateTransaction,
            });
        } catch (error) {
            console.error("Transaction execution error:", error);
            setLoading(false);
            setIsWalletTransactionPending(false);

            // Check if it's a user rejection
            const errorMessage = String(error).toLowerCase();
            if (
                errorMessage.includes("user rejected") ||
                errorMessage.includes("user denied") ||
                (error as any)?.code === 4001
            ) {
                toast.error("User rejected the transaction");
            } else {
                toast.error("Failed to create coin");
            }
        }
    };

    // Transaction effect handlers
    useEffect(() => {
        if (!hasRendered) {
            setHasRendered(true);
            return;
        }

        // Handle any transaction errors
        const errors = [
            coinCreateSignAndExecuteTransactionError,
            curveCreateSignAndExecuteTransactionError,
            firstBuySignAndExecuteTransactionError,
        ].filter(Boolean);

        if (errors.length > 0) {
            // Reset loading states
            setLoading(false);
            setIsWalletTransactionPending(false);

            // Check if error is user rejection
            const isUserRejection = errors.some((error) => {
                const errorMessage = error?.message?.toLowerCase() || "";
                const errorString = String(error).toLowerCase();
                return (
                    errorMessage.includes("user rejected") ||
                    errorMessage.includes("user denied") ||
                    errorMessage.includes("rejected by user") ||
                    errorString.includes("user rejected") ||
                    errorString.includes("user denied") ||
                    (error as any)?.code === 4001 // Standard wallet rejection code
                );
            });

            if (isUserRejection) {
                toast.error("User rejected the transaction");
            } else {
                toast.error("Coin not created.");
            }

            console.log({
                coinCreateSignAndExecuteTransactionError,
                curveCreateSignAndExecuteTransactionError,
                firstBuySignAndExecuteTransactionError,
            });
        }
    }, [
        coinCreateSignAndExecuteTransactionError,
        curveCreateSignAndExecuteTransactionError,
        firstBuySignAndExecuteTransactionError,
        hasRendered,
    ]);

    useEffect(() => {
        if (!coinCreateSignAndExecuteTransactionData) return;
        if (!coinCreateSignAndExecuteTransactionData.objectChanges) return;

        console.log({
            coinCreateSignAndExecuteTransactionData,
        });

        const { objectChanges } = coinCreateSignAndExecuteTransactionData;

        const publishedObject = objectChanges
            .filter((item) => item.type == "published")
            .at(0);
        const treasuryCapObject = objectChanges
            .filter(
                (item) =>
                    item.type === "created" &&
                    item.objectType.includes("TreasuryCap"),
            )
            .at(0);
        const coinMetadataObject = objectChanges
            .filter(
                (item) =>
                    item.type === "created" &&
                    item.objectType.includes("CoinMetadata"),
            )
            .at(0);

        console.log({
            publishedObject,
            treasuryCapObject,
            coinMetadataObject,
        });

        setPublishedPackageId(
            publishedObject?.type === "published"
                ? publishedObject.packageId
                : null,
        );

        if (!publishedObject || !treasuryCapObject || !coinMetadataObject) {
            toast.error("Coin not created");
            setIsWalletTransactionPending(false);
            return;
        }

        const curveCreationTransaction = new Transaction();

        const typeArguments = [
            getCoinTypeArgument(
                publishedObject.packageId,
                coinCreateMetadata.name,
            ),
        ];
        console.log({ typeArguments });

        const maxTx = coinCreateMetadata.maxTx === "true";
        console.log("creating coin", coinCreateMetadata);

        const treasuryCapObjectId =
            treasuryCapObject.type === "created"
                ? treasuryCapObject.objectId
                : "0x0";
        const coinMetadataObjectId =
            coinMetadataObject.type === "created"
                ? coinMetadataObject.objectId
                : "0x0";

        console.log({
            treasuryCapObjectId,
            coinMetadataObjectId,
        });

        curveCreationTransaction.moveCall({
            target: `${bondingCurveModuleId}::kappadotmeme::create`,
            arguments: [
                curveCreationTransaction.object(bondingCurveConfigObjectId),
                curveCreationTransaction.object(
                    bondingCurveGlobalPauseStatusObjectId,
                ),
                curveCreationTransaction.object(bondingCurvePoolsObjectId),
                curveCreationTransaction.object(treasuryCapObjectId),
                curveCreationTransaction.object(coinMetadataObjectId),
                curveCreationTransaction.pure.string(
                    JSON.stringify({
                        description: coinCreateMetadata.description,
                        siteUrl: coinCreateMetadata.website,
                        tgUrl: coinCreateMetadata.telegram,
                        xUrl: coinCreateMetadata.twitter,
                        tags: coinCreateMetadata.tags,
                    }),
                ),
                curveCreationTransaction.pure.bool(maxTx),
                curveCreationTransaction.object("0x6"),
            ],
            typeArguments: typeArguments,
        });

        curveCreateSignAndExecuteTransaction({
            transaction: curveCreationTransaction,
        });
    }, [coinCreateSignAndExecuteTransactionData]);

    useEffect(() => {
        if (!curveCreateSignAndExecuteTransactionData) return;
        if (!curveCreateSignAndExecuteTransactionData.objectChanges) return;
        if (!publishedPackageId) return;

        const { objectChanges } = curveCreateSignAndExecuteTransactionData;

        const bondingCurve = objectChanges
            .filter(
                (item) =>
                    item.type == "created" &&
                    item.objectType.includes("BondingCurve"),
            )
            .at(0);

        if (!bondingCurve) {
            toast.error("Bonding curve not created");
            setIsWalletTransactionPending(false);
            return;
        }

        const suiAmount = (Number(devBuyAmount) * 10 ** 9).toFixed(0);
        const maxTokens = (
            buyMathDev(Number(devBuyAmount) * 0.9) * 1e9
        ).toFixed(0);

        console.log({ suiAmount, maxTokens });

        const firstBuyTransaction = new Transaction();

        const typeArguments = [
            getCoinTypeArgument(publishedPackageId, coinCreateMetadata.name),
        ];
        const [coin] = firstBuyTransaction.splitCoins(firstBuyTransaction.gas, [
            firstBuyTransaction.pure.u64(suiAmount),
        ]);
        const is_exact_out = true;

        firstBuyTransaction.moveCall({
            target: `${bondingCurveModuleId}::kappadotmeme::first_buy`,
            arguments: [
                firstBuyTransaction.object(bondingCurveConfigObjectId),
                coin,
                firstBuyTransaction.pure.bool(is_exact_out),
                firstBuyTransaction.pure.u64(maxTokens),
                firstBuyTransaction.object("0x6"),
            ],
            typeArguments: typeArguments,
        });

        firstBuySignAndExecuteTransaction({
            transaction: firstBuyTransaction,
        });
    }, [curveCreateSignAndExecuteTransactionData, publishedPackageId]);

    useEffect(() => {
        if (!firstBuySignAndExecuteTransactionData) return;
        if (!firstBuySignAndExecuteTransactionData.objectChanges) return;
        if (!publishedPackageId) return;

        let isCancelled = false;

        const finalizeAndNavigate = async () => {
            try {
                toast.success("Coin created successfully!");
                setIsWalletTransactionPending(false);

                const coinAddress = `${publishedPackageId}::${coinCreateMetadata.name.replaceAll(" ", "_")}::${coinCreateMetadata.name
                    .replaceAll(" ", "_")
                    .toUpperCase()}`;

                // Poll backend until coin is available
                const maxAttempts = 60; // ~60s
                const intervalMs = 1000;
                for (
                    let attempt = 0;
                    attempt < maxAttempts && !isCancelled;
                    attempt++
                ) {
                    try {
                        const [result] = await sdk.coins.getCoinByCoinAddress(
                            ChainNameEnum.SuiMainnet,
                            coinAddress,
                        );
                        if (result?.status === "success") {
                            if (isCancelled) return;
                            // Prefetch and grace period to allow backend to hydrate dependent data
                            try {
                                router.prefetch(`/coin/${coinAddress}`);
                            } catch {}
                            await new Promise((r) => setTimeout(r, 2000));
                            onClose();
                            router.push(`/coin/${coinAddress}`);
                            return;
                        }
                    } catch {}
                    await new Promise((r) => setTimeout(r, intervalMs));
                }

                // Timeout fallback
                if (!isCancelled) {
                    toast.error(
                        "Backend is still syncing this coin. Retrying took too long.",
                    );
                }
            } finally {
                // no-op
            }
        };

        finalizeAndNavigate();

        return () => {
            isCancelled = true;
        };
    }, [
        firstBuySignAndExecuteTransactionData,
        publishedPackageId,
        onClose,
        router,
        sdk,
    ]);

    return (
        <>
            {/* CSS styles for deployer title */}
            <style jsx global>{`
                /* Force large title styling */
                .deployer-large-title {
                    font-size: 48px !important;
                    line-height: 1.1 !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    color: white !important;
                }

                .deployer-large-title span {
                    font-size: 48px !important;
                    line-height: inherit !important;
                    display: inline-block !important;
                }

                /* Responsive title sizing for tray */
                @media (max-width: 640px) {
                    .deployer-large-title {
                        font-size: 36px !important;
                    }
                    .deployer-large-title span {
                        font-size: 36px !important;
                    }
                }
            `}</style>

            <div
                className="flex h-full w-full flex-col overflow-hidden md:border-l md:border-[#38A1D0]/30"
                data-tray-content
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-[#38A1D0]/30 bg-[#0E161C] p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8">
                            <Image
                                src="/assets/KappaSVG2.svg"
                                alt="Kappa Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h2
                            className={`${dotoSemibold.className} text-xl font-semibold text-[#38A1D0]`}
                        >
                            KAPPA DEPLOYER
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#38A1D0]/30 bg-[#38A1D0]/10 text-[#38A1D0] transition-all hover:border-[#38A1D0] hover:bg-[#38A1D0]/20 hover:text-white"
                    >
                        <HiX className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4" data-tray-scroll>
                    {/* Centered Content Container */}
                    <div className="flex w-full justify-center">
                        <div className="flex w-full max-w-[500px] flex-col items-center">
                            {/* Dance GIF */}
                            <div className="mb-8 mt-4 flex justify-center">
                                <Image
                                    src="/assets/dance2.gif"
                                    width={120}
                                    height={120}
                                    alt="Dancing Kappa"
                                    className="rounded-lg"
                                />
                            </div>

                            {/* Large Title Section */}
                            <div className="mb-[30px] text-center">
                                <h1
                                    className={`${dotoSemibold.className} deployer-large-title mb-3`}
                                >
                                    <span className="inline-block rounded-lg bg-[#38A1D0]/20 px-3 text-white">
                                        KAPPA
                                    </span>
                                    <span className="ml-3">DEPLOYER</span>
                                </h1>
                                <div className="mx-auto h-1 w-24 bg-gradient-to-r from-[#38A1D0] to-[#00C673] sm:w-32"></div>
                            </div>

                            <div className="flex w-full max-w-[500px] flex-col gap-6">
                                {/* Wallet Status - Must be connected to proceed */}
                                <div className="rounded-lg border border-[#38A1D0]/30 bg-[#0E161C] p-4">
                                    {currentAccount ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <IoIosCheckmarkCircleOutline className="text-[16px] text-[#00C673]" />
                                                <span className="text-[14px] font-medium text-white">
                                                    Wallet Connected
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-md bg-[#1E2025] px-3 py-2">
                                                <Image
                                                    src="/assets/SUI.svg"
                                                    width={16}
                                                    height={16}
                                                    alt="Wallet"
                                                    className="rounded-full"
                                                />
                                                <span className="text-[12px] text-white">
                                                    {currentAccount.address.slice(
                                                        0,
                                                        4,
                                                    )}
                                                    ..
                                                    {currentAccount.address.slice(
                                                        -3,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-[16px] w-[16px] rounded-full border-2 border-yellow-500"></div>
                                                <span className="text-[14px] font-medium text-white">
                                                    Connect wallet to continue
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (!user) {
                                                        toast.error(
                                                            "You need to be logged in to do that!",
                                                        );
                                                        return;
                                                    }
                                                    walletActions.openConnectorModal();
                                                }}
                                                className="flex h-10 items-center justify-center rounded-lg border border-[#38A1D0] bg-gradient-to-r from-[#38A1D0] to-[#00C673] px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                            >
                                                Connect
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Form Fields Section */}
                                <div
                                    className={getFormContainerClass(
                                        !!currentAccount,
                                    )}
                                >
                                    {/* Name */}
                                    <div className="flex w-full flex-col gap-2">
                                        <label className="flex flex-col gap-1">
                                            <span className="text-[16px] font-medium uppercase tracking-wide text-white">
                                                Name{" "}
                                                <span className="text-[12px] font-normal normal-case text-[#6D6D6D]">
                                                    | Choose a name for your
                                                    token
                                                </span>
                                            </span>
                                        </label>
                                        <div className="group relative w-full">
                                            <input
                                                type="text"
                                                placeholder="Insert coin name (max 32)"
                                                value={capitalizeForDisplay(
                                                    coinData?.name,
                                                )}
                                                maxLength={32}
                                                className={getInputClass(error)}
                                                onChange={handleNameChange}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6D6D6D] transition-colors group-focus-within:text-[#38A1D0]">
                                                {coinData.name.length}/32
                                            </span>
                                        </div>
                                        {validationErrors.nameTickerDuplicate && (
                                            <span className="text-[12px] text-red-500">
                                                Name cannot be identical
                                                lettering and casing as the
                                                Ticker.
                                            </span>
                                        )}
                                    </div>

                                    {/* Ticker */}
                                    <div className="flex w-full flex-col gap-2">
                                        <label className="flex flex-col gap-1">
                                            <span className="text-[16px] font-medium uppercase tracking-wide text-white">
                                                Ticker{" "}
                                                <span className="text-[12px] font-normal normal-case text-[#6D6D6D]">
                                                    | Choose a ticker symbol for
                                                    your token
                                                </span>
                                            </span>
                                        </label>
                                        <div className="group relative w-full">
                                            <input
                                                type="text"
                                                placeholder="Insert ticker (max 12 characters)"
                                                value={capitalizeTickerForDisplay(
                                                    coinData?.ticker,
                                                )}
                                                maxLength={12}
                                                className={getInputClass(error)}
                                                onChange={handleTickerChange}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6D6D6D] transition-colors group-focus-within:text-[#38A1D0]">
                                                {coinData.ticker.length}/12
                                            </span>
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="flex w-full flex-col gap-2">
                                        <label className="flex flex-col gap-1">
                                            <span className="text-[16px] font-medium uppercase tracking-wide text-white">
                                                Token Image{" "}
                                                <span className="text-[12px] font-normal normal-case text-[#6D6D6D]">
                                                    | Upload token logo
                                                    (PNG/JPG, max 2MB)
                                                </span>
                                            </span>
                                        </label>
                                        <div
                                            className={getFileUploadClass(
                                                fileError,
                                            )}
                                            style={{ paddingLeft: "6px" }}
                                        >
                                            <label
                                                className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-1 text-[#38A1D0] transition-all duration-200 ${
                                                    coinData.imageUrl
                                                        ? "pointer-events-none opacity-40 border-[#38A1D0]/30 bg-[#38A1D0]/5"
                                                        : "border-[#38A1D0] bg-[#38A1D0]/10 hover:border-[#38A1D0]/80 hover:bg-[#38A1D0]/20 hover:text-white"
                                                }`}
                                            >
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/png,image/jpeg"
                                                    onChange={handleFileChange}
                                                />
                                                <p className="text-[12px] font-semibold uppercase tracking-wide">
                                                    Choose File
                                                </p>
                                            </label>
                                            <p
                                                className={getFileNameClass(
                                                    !!coinData?.file?.name,
                                                )}
                                            >
                                                {fileName}
                                            </p>
                                        </div>
                                        {/* Or paste an image URL */}
                                        <div className="mt-2">
                                            <input
                                                type="url"
                                                placeholder="Or paste an image URL (https://...)"
                                                value={coinData.imageUrl || ""}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.trim();
                                                    setCoinData({
                                                        ...coinData,
                                                        imageUrl: value,
                                                        file: value
                                                            ? null
                                                            : coinData.file,
                                                    });
                                                    // If URL cleared, remove preview; otherwise show URL preview
                                                    setPreviewUrl(value);
                                                    setFileError(false);
                                                    setFileSizeError(false);
                                                }}
                                                className="h-[40px] w-full rounded-lg border-[1px] border-[#6D6D6D]/30 bg-[#1E2025] px-4 text-[14px] font-normal text-white placeholder:text-[#6D6D6D] focus:border-[#38A1D0] focus:outline-none"
                                            />
                                        </div>
                                        {fileError && (
                                            <p className="text-sm text-red-500">
                                                Please upload a valid image file
                                                (PNG/JPG, max 2MB)
                                            </p>
                                        )}
                                        {previewUrl && (
                                            <div className="mt-2">
                                                <p className="mb-2 text-[12px] text-[#6D6D6D]">
                                                    Preview:
                                                </p>
                                                <div className="flex items-center">
                                                    <div className="relative aspect-square w-20 overflow-hidden rounded-lg border border-[#6D6D6D]/30 flex items-center justify-center">
                                                        {coinData.imageUrl &&
                                                        (!isValidHttpUrl(
                                                            coinData.imageUrl,
                                                        ) ||
                                                            isImagePreviewValid ===
                                                                false) ? (
                                                            <MdOutlineImageNotSupported className="h-[44px] w-[44px] text-red-500" />
                                                        ) : (
                                                            <img
                                                                src={previewUrl}
                                                                alt="Preview"
                                                                className="h-full w-full object-cover"
                                                                onLoad={() =>
                                                                    setIsImagePreviewValid(
                                                                        true,
                                                                    )
                                                                }
                                                                onError={() =>
                                                                    setIsImagePreviewValid(
                                                                        false,
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                    {coinData.imageUrl &&
                                                        (!isValidHttpUrl(
                                                            coinData.imageUrl,
                                                        ) ||
                                                            isImagePreviewValid ===
                                                                false) && (
                                                            <span className="ml-2 text-[10px] font-medium text-red-500">
                                                                Invalid Image
                                                                URL
                                                            </span>
                                                        )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="flex w-full flex-col gap-2">
                                        <label className="flex flex-col gap-1">
                                            <span className="text-[16px] font-medium uppercase tracking-wide text-white">
                                                Description{" "}
                                                <span className="text-[12px] font-normal normal-case text-[#6D6D6D]">
                                                    | Describe your token (2-256
                                                    characters)
                                                </span>
                                            </span>
                                        </label>
                                        <div className="group relative w-full">
                                            <textarea
                                                placeholder="Insert description"
                                                value={coinData?.description}
                                                maxLength={256}
                                                className={getTextareaClass(
                                                    error,
                                                )}
                                                onChange={
                                                    handleDescriptionChange
                                                }
                                            />
                                            <span className="absolute bottom-2 right-4 text-[12px] text-[#6D6D6D] transition-colors group-focus-within:text-[#38A1D0]">
                                                {coinData.description.length}
                                                /256
                                            </span>
                                        </div>
                                        {validationErrors.uniqueness && (
                                            <span className="text-[12px] text-red-500">
                                                Description must be different
                                                from name and ticker.
                                            </span>
                                        )}
                                    </div>

                                    {/* Show More Options */}
                                    <div className="flex w-full flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsExpended(!isExpanded)
                                            }
                                            className="flex w-full items-center justify-between rounded-lg border border-[#38A1D0]/30 bg-[#38A1D0]/10 p-4 text-left transition-all hover:border-[#38A1D0] hover:bg-[#38A1D0]/20"
                                        >
                                            <span className="text-[14px] font-medium text-[#38A1D0]">
                                                Show more options
                                            </span>
                                            <RiArrowDownSLine
                                                className={getArrowClass(
                                                    isExpanded,
                                                )}
                                            />
                                        </button>

                                        {isExpanded && (
                                            <div className="flex flex-col gap-6 rounded-lg border border-[#38A1D0]/20 bg-[#0A1520] p-4">
                                                {/* Tags Section */}
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-[14px] font-medium uppercase tracking-wide text-white">
                                                            TAGS{" "}
                                                            <span className="text-[12px] font-normal normal-case text-[#6D6D6D]">
                                                                | Optional
                                                            </span>
                                                        </h4>
                                                        <div className="rounded-md border border-[#38A1D0]/30 bg-[#38A1D0]/10 px-2 py-1">
                                                            <span className="text-[11px] font-medium text-[#38A1D0]">
                                                                {tags.length}/4
                                                                used
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex w-full flex-col gap-2">
                                                        <div className="flex w-full flex-col gap-1">
                                                            <label className="text-[12px] text-[#6D6D6D]">
                                                                Add tags to help
                                                                people discover
                                                                your token (max
                                                                4 tags, 12 chars
                                                                each)
                                                            </label>
                                                            <div className="group relative w-full">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Type a tag and press Enter"
                                                                    value={
                                                                        inputValue
                                                                    }
                                                                    maxLength={
                                                                        maxTagLength
                                                                    }
                                                                    className="h-[40px] w-full rounded-lg border-[1px] border-[#6D6D6D]/30 bg-[#1E2025] px-4 pr-12 text-[14px] font-normal text-white transition-colors placeholder:text-[#6D6D6D] focus:border-[#38A1D0] focus:outline-none"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setInputValue(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    onKeyDown={
                                                                        handleAddTag
                                                                    }
                                                                    disabled={
                                                                        tags.length >=
                                                                        4
                                                                    }
                                                                />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[#6D6D6D] transition-colors group-focus-within:text-[#38A1D0]">
                                                                    {
                                                                        inputValue.length
                                                                    }
                                                                    /
                                                                    {
                                                                        maxTagLength
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* Tags Display */}
                                                        {tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {tags.map(
                                                                    (
                                                                        tag,
                                                                        index,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="flex items-center gap-1 rounded-md border border-[#38A1D0]/30 bg-[#38A1D0]/10 px-2 py-1"
                                                                        >
                                                                            <span className="text-[11px] font-medium text-[#38A1D0]">
                                                                                #
                                                                                {
                                                                                    tag
                                                                                }
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleRemoveTag(
                                                                                        tag,
                                                                                    )
                                                                                }
                                                                                className="flex h-4 w-4 items-center justify-center rounded-full text-[#38A1D0] transition-colors hover:bg-[#38A1D0]/20 hover:text-white"
                                                                            >
                                                                                <RxCrossCircled className="h-3 w-3" />
                                                                            </button>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Social Links & Trading Settings */}
                                                <div className="flex flex-col gap-4">
                                                    {/* Twitter */}
                                                    <div className="flex w-full flex-col gap-2">
                                                        <label className="text-[12px] font-medium text-white">
                                                            Twitter{" "}
                                                            <span className="font-normal text-[#6D6D6D]">
                                                                | Optional
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="twitter.com/username or @username"
                                                            value={
                                                                coinData?.twitterLink ||
                                                                ""
                                                            }
                                                            className={getSocialInputClass(
                                                                linkValidation.twitter,
                                                            )}
                                                            onChange={(e) => {
                                                                const value =
                                                                    e.target
                                                                        .value;
                                                                setCoinData({
                                                                    ...coinData,
                                                                    twitterLink:
                                                                        value,
                                                                });
                                                                setLinkValidation(
                                                                    {
                                                                        ...linkValidation,
                                                                        twitter:
                                                                            validateTwitterLink(
                                                                                value,
                                                                            ),
                                                                    },
                                                                );
                                                            }}
                                                            onBlur={(e) => {
                                                                const value =
                                                                    e.target
                                                                        .value;
                                                                if (
                                                                    value &&
                                                                    validateTwitterLink(
                                                                        value,
                                                                    )
                                                                ) {
                                                                    const formattedUrl =
                                                                        formatSocialLink(
                                                                            value,
                                                                            "twitter",
                                                                        );
                                                                    setCoinData(
                                                                        {
                                                                            ...coinData,
                                                                            twitterLink:
                                                                                formattedUrl,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        {coinData?.twitterLink &&
                                                            !linkValidation.twitter && (
                                                                <span className="text-[12px] text-red-500">
                                                                    Please enter
                                                                    a valid
                                                                    Twitter
                                                                    username
                                                                </span>
                                                            )}
                                                    </div>

                                                    {/* Telegram */}
                                                    <div className="flex w-full flex-col gap-2">
                                                        <label className="text-[12px] font-medium text-white">
                                                            Telegram{" "}
                                                            <span className="font-normal text-[#6D6D6D]">
                                                                | Optional
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="t.me/username or @username"
                                                            value={
                                                                coinData?.telegramLink ||
                                                                ""
                                                            }
                                                            className={getSocialInputClass(
                                                                linkValidation.telegram,
                                                            )}
                                                            onChange={(e) => {
                                                                const value =
                                                                    e.target
                                                                        .value;
                                                                setCoinData({
                                                                    ...coinData,
                                                                    telegramLink:
                                                                        value,
                                                                });
                                                                setLinkValidation(
                                                                    {
                                                                        ...linkValidation,
                                                                        telegram:
                                                                            validateTelegramLink(
                                                                                value,
                                                                            ),
                                                                    },
                                                                );
                                                            }}
                                                            onBlur={(e) => {
                                                                const value =
                                                                    e.target
                                                                        .value;
                                                                if (
                                                                    value &&
                                                                    validateTelegramLink(
                                                                        value,
                                                                    )
                                                                ) {
                                                                    const formattedUrl =
                                                                        formatSocialLink(
                                                                            value,
                                                                            "telegram",
                                                                        );
                                                                    setCoinData(
                                                                        {
                                                                            ...coinData,
                                                                            telegramLink:
                                                                                formattedUrl,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        {coinData?.telegramLink &&
                                                            !linkValidation.telegram && (
                                                                <span className="text-[12px] text-red-500">
                                                                    Please enter
                                                                    a valid
                                                                    Telegram
                                                                    username
                                                                </span>
                                                            )}
                                                    </div>

                                                    {/* Website */}
                                                    <div className="flex w-full flex-col gap-2">
                                                        <label className="text-[12px] font-medium text-white">
                                                            Website{" "}
                                                            <span className="font-normal text-[#6D6D6D]">
                                                                | Optional
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="example.com or https://example.com"
                                                            value={
                                                                coinData?.websiteLink ||
                                                                ""
                                                            }
                                                            className={getSocialInputClass(
                                                                linkValidation.website,
                                                            )}
                                                            onChange={(e) => {
                                                                const value =
                                                                    e.target
                                                                        .value;
                                                                setCoinData({
                                                                    ...coinData,
                                                                    websiteLink:
                                                                        value,
                                                                });
                                                                setLinkValidation(
                                                                    {
                                                                        ...linkValidation,
                                                                        website:
                                                                            validateWebsiteLink(
                                                                                value,
                                                                            ),
                                                                    },
                                                                );
                                                            }}
                                                            onBlur={(e) => {
                                                                const value =
                                                                    e.target
                                                                        .value;
                                                                if (
                                                                    value &&
                                                                    validateWebsiteLink(
                                                                        value,
                                                                    )
                                                                ) {
                                                                    const formattedUrl =
                                                                        formatSocialLink(
                                                                            value,
                                                                            "website",
                                                                        );
                                                                    setCoinData(
                                                                        {
                                                                            ...coinData,
                                                                            websiteLink:
                                                                                formattedUrl,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        {coinData?.websiteLink &&
                                                            !linkValidation.website && (
                                                                <span className="text-[12px] text-red-500">
                                                                    Please enter
                                                                    a valid
                                                                    website URL
                                                                </span>
                                                            )}
                                                    </div>

                                                    {/* Max Buy Toggle */}
                                                    <div className="flex flex-col gap-3">
                                                        <label className="text-[12px] text-[#6D6D6D]">
                                                            Max Buy Setting:
                                                        </label>
                                                        <div className="flex items-center justify-between rounded-lg border border-[#38A1D0]/20 bg-[#1E2025] p-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[12px] font-medium text-white">
                                                                    Enable Max
                                                                    Buy Limit
                                                                </span>
                                                                <span className="text-[10px] text-[#6D6D6D]">
                                                                    Prevents
                                                                    large single
                                                                    purchases
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setCoinData(
                                                                        {
                                                                            ...coinData,
                                                                            hasMaxBuy:
                                                                                !coinData.hasMaxBuy,
                                                                        },
                                                                    )
                                                                }
                                                                className={`relative inline-flex h-7 w-12 items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#38A1D0]/50 focus:ring-offset-2 focus:ring-offset-[#1E2025] ${
                                                                    coinData.hasMaxBuy
                                                                        ? "border-[#38A1D0] bg-[#38A1D0] shadow-lg shadow-[#38A1D0]/25"
                                                                        : "border-[#4A4A4A] bg-[#2A2A2A] hover:border-[#6D6D6D]"
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-5 w-5 transform rounded-full border-2 border-gray-300 bg-white shadow-lg transition-all duration-300 ease-in-out ${
                                                                        coinData.hasMaxBuy
                                                                            ? "translate-x-[22px] shadow-lg"
                                                                            : "translate-x-0.5 shadow-md"
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dev Buy Amount */}
                                <div className="flex w-full flex-col gap-4 rounded-lg border border-[#00C673] p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-[16px] font-medium uppercase tracking-wide text-white">
                                                Dev Buy
                                            </h3>
                                            <h4 className="text-[12px] font-normal uppercase tracking-wide text-white opacity-80">
                                                Amount (SUI)
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg border border-[#38A1D0]/30 bg-[#38A1D0]/10 px-3 py-2">
                                            <Image
                                                src="/assets/SUI.svg"
                                                width={14}
                                                height={14}
                                                alt="SUI"
                                                className="rounded-full"
                                            />
                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#38A1D0]">
                                                Balance:
                                            </span>
                                            <span className="text-[12px] font-bold text-white">
                                                {(
                                                    parseFloat(userSuiBalance) /
                                                    10 ** 9
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative w-full">
                                        <input
                                            type="number"
                                            placeholder="Enter SUI amount"
                                            value={devBuyAmount}
                                            onChange={(e) =>
                                                setDevBuyAmount(e.target.value)
                                            }
                                            className={`h-[40px] w-full rounded-lg border-[1px] bg-[#1E2025] px-4 text-[14px] font-normal text-white transition-colors placeholder:text-[#6D6D6D] focus:outline-none ${
                                                parseFloat(devBuyAmount) >
                                                parseFloat(userSuiBalance) /
                                                    10 ** 9
                                                    ? "border-red-500"
                                                    : "border-[#38A1D0]"
                                            }`}
                                        />
                                    </div>
                                    <p className="text-[12px] text-[#6D6D6D]">
                                        This will equate to approximately{" "}
                                        <span className="text-white">
                                            {calculateTokens(
                                                parseFloat(devBuyAmount),
                                            )}
                                        </span>{" "}
                                        tokens.
                                    </p>
                                </div>

                                {/* Create Coin Button */}
                                <div className="flex w-full items-center justify-center">
                                    <button
                                        disabled={
                                            !currentAccount ||
                                            !isFormValid ||
                                            loading ||
                                            isNaN(parseFloat(devBuyAmount)) ||
                                            parseFloat(devBuyAmount) <= 0 ||
                                            parseFloat(devBuyAmount) >
                                                parseFloat(userSuiBalance) /
                                                    10 ** 9
                                        }
                                        onClick={handleCreateCoin}
                                        className="flex h-[45px] w-full items-center justify-center rounded-lg border border-[#38A1D0] bg-gradient-to-r from-[#38A1D0] to-[#00C673] text-[16px] font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {loading ||
                                        isWalletTransactionPending ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Image
                                                    src="/assets/cointurn.gif"
                                                    width={20}
                                                    height={20}
                                                    alt="Loading"
                                                    className="rounded-full"
                                                />
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            "Create coin"
                                        )}
                                    </button>
                                </div>

                                {/* Cost to deploy */}
                                <div className="flex items-center justify-between rounded-lg border border-[#38A1D0]/30 p-4">
                                    <p className="text-[14px] font-normal text-white">
                                        Cost to deploy
                                    </p>
                                    <p className="text-[16px] font-medium text-white">
                                        Free + Gas Only
                                    </p>
                                </div>

                                {/* Note */}
                                <div className="w-full rounded-lg border-[1px] border-[#38A1D0] p-4">
                                    <p className="text-[11px] font-normal text-[#38A1D0]">
                                        Once the curve completes, it's game over
                                        🎯 — token auto-lists on SUI, LP drops
                                        on-chain 💧, contracts renounce forever
                                        🔒. You get 1% of the raise, clean 🧾.
                                        The pool migrates to a full-range 1%
                                        sniper zone 🎯📈 — creator slice baked
                                        in, community eats too 🍽️. No levers, no
                                        keys, no edits. The only rug here… is
                                        you 🫵.
                                    </p>
                                </div>

                                {/* Extra bottom spacing */}
                                <div className="h-4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export type { DeployerTrayProps };
export default DeployerTray;
