// Constants for calculations
const TOTAL_SUPPLY = 1_000_000_000;
const INITIAL_INPUT_RESERVE = 1_900 * 1e9;      // 1,900 SUI in MIST (corrected)
const INITIAL_OUTPUT_RESERVE = 876_800_000 * 1e9; // 876.8M tokens in smallest unit (corrected)
const FEE_BPS = 100;
const BPS_DENOMINATOR = 10000;
const PRECISION = 10000;

/**
 * Calculates the amount of output tokens received for the first buy in a bonding curve.
 *
 * This function:
 *   - Takes the amount of SUI to be used for the purchase.
 *   - Applies a fee to the input amount.
 *   - Uses the bonding curve formula with initial reserves to determine the output.
 *   - Returns the number of output tokens the buyer would receive.
 *
 * @param {number|string} sui_for_buy - The amount of SUI to use for the first buy.
 * @returns {number} The amount of output tokens received, or 0 on error/invalid input.
 */
const firstBuyMath = (sui_for_buy) => {
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


/**
 * Calculates the amount of output tokens received when buying from a bonding curve.
 *
 * This function:
 *   - Takes the current curve state (`realCurve`) and the amount of SUI to use for the purchase.
 *   - Applies a fee to the input amount.
 *   - Uses the bonding curve formula with the current virtual reserves to determine the output.
 *   - Returns the number of output tokens the buyer would receive.
 *
 * @param {object} realCurve - The current curve state, containing virtual reserves.
 * @param {number|string} sui_for_buy - The amount of SUI to use for the buy.
 * @returns {number} The amount of output tokens received, or 0 on error/invalid input.
 */
const buyMath = (realCurve, sui_for_buy) => {
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


/**
 * Calculates the amount of SUI received when selling tokens to a bonding curve.
 *
 * This function:
 *   - Takes the current curve state (`realCurve`) and the amount of tokens to sell.
 *   - Uses the bonding curve formula with the current virtual reserves to determine the SUI output.
 *   - Applies a fee to the output amount.
 *   - Returns the net amount of SUI the seller would receive after fees.
 *
 * @param {object} realCurve - The current curve state, containing virtual reserves.
 * @param {number|string} sell_token_amount - The amount of tokens to sell.
 * @returns {number} The amount of SUI received after fees, or 0 on error/invalid input.
 */
const sellMath = (realCurve, sell_token_amount) => {
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

    return sui_out;
};

/**
 * Calculates the amount of SUI needed to buy a specific amount of tokens (REVERSE calculation)
 * This is the inverse of the buyMath function
 * 
 * @param {Object} realCurve - The current curve state, containing virtual reserves
 * @param {number} desiredTokens - The amount of tokens you want to buy
 * @returns {number} The amount of SUI needed (in MIST), or 0 on error
 */
const calculateSuiForTokens = (realCurve, desiredTokens) => {
    try {
        const input_reserve_val = Number(realCurve.content.fields.virtual_sui_reserve);
        const output_reserve_val = Number(realCurve.content.fields.virtual_coin_reserve);
        const desired_tokens = Number(desiredTokens);
        
        // Check if we have enough tokens available
        if (desired_tokens >= output_reserve_val) {
            console.log("Error: Not enough tokens available in reserve");
            return 0;
        }
        
        // Reverse AMM formula: sui_before_fee = (desired_tokens * input_reserve) / (output_reserve - desired_tokens)
        const sui_before_fee = (desired_tokens * input_reserve_val) / (output_reserve_val - desired_tokens);
        
        // Add fee back (since fee is deducted from input)
        // If amount_after_fee = amount * (1 - fee_rate), then amount = amount_after_fee / (1 - fee_rate)
        const fee_rate = FEE_BPS / BPS_DENOMINATOR; // 0.01 (1%)
        const sui_with_fee = sui_before_fee / (1 - fee_rate);
        
        console.log("calculateSuiForTokens input_reserve_val:", input_reserve_val);
        console.log("calculateSuiForTokens output_reserve_val:", output_reserve_val);
        console.log("calculateSuiForTokens desired_tokens:", desired_tokens);
        console.log("calculateSuiForTokens sui_needed:", sui_with_fee);
        
        return sui_with_fee;
        
    } catch (err) {
        console.error("Error calculating SUI for tokens:", err);
        return 0;
    }
};

/**
 * Calculates the amount of SUI needed for the first buy (PRE-LAUNCH)
 * Uses initial reserves since no curve exists yet
 * 
 * @param {number} desiredTokens - The amount of tokens you want to buy
 * @returns {number} The amount of SUI needed (in MIST), or 0 on error
 */
const calculateSuiForFirstBuy = (desiredTokens) => {
    try {
        const desired_tokens = Number(desiredTokens);
        
        // Check if we have enough tokens available
        if (desired_tokens >= INITIAL_OUTPUT_RESERVE) {
            console.log("Error: Not enough tokens available in initial reserve");
            return 0;
        }
        
        // Reverse AMM formula with initial reserves
        const sui_before_fee = (desired_tokens * INITIAL_INPUT_RESERVE) / (INITIAL_OUTPUT_RESERVE - desired_tokens);
        
        // Add fee back
        const fee_rate = FEE_BPS / BPS_DENOMINATOR; // 0.01 (1%)
        const sui_with_fee = sui_before_fee / (1 - fee_rate);
        
        console.log("calculateSuiForFirstBuy initial_input_reserve:", INITIAL_INPUT_RESERVE);
        console.log("calculateSuiForFirstBuy initial_output_reserve:", INITIAL_OUTPUT_RESERVE);
        console.log("calculateSuiForFirstBuy desired_tokens:", desired_tokens);
        console.log("calculateSuiForFirstBuy sui_needed:", sui_with_fee);
        
        return sui_with_fee;
        
    } catch (err) {
        console.error("Error calculating SUI for first buy:", err);
        return 0;
    }
};

/**
 * Estimates price impact for a given purchase
 * @param {Object} realCurve - Current curve state
 * @param {number} suiAmount - Amount of SUI to spend
 * @returns {Object} Price impact information
 */
const calculatePriceImpact = (realCurve, suiAmount) => {
    try {
        const input_reserve_val = Number(realCurve.content.fields.virtual_sui_reserve);
        const output_reserve_val = Number(realCurve.content.fields.virtual_coin_reserve);
        
        // Current price (tokens per SUI)
        const currentPrice = output_reserve_val / input_reserve_val;
        
        // Tokens received for this purchase
        const tokensReceived = buyMath(realCurve, suiAmount);
        
        // Effective price for this purchase
        const effectivePrice = tokensReceived / suiAmount;
        
        // Price impact percentage
        const priceImpact = ((currentPrice - effectivePrice) / currentPrice) * 100;
        
        return {
            currentPrice,
            effectivePrice,
            priceImpact: priceImpact.toFixed(2),
            tokensReceived
        };
        
    } catch (err) {
        console.error("Error calculating price impact:", err);
        return {
            currentPrice: 0,
            effectivePrice: 0,
            priceImpact: "0.00",
            tokensReceived: 0
        };
    }
};

/**
 * Simulates the curve state after a dev buy (first buy)
 * This allows us to calculate bundled purchases based on the updated curve state
 * @param {number} devBuySuiAmount - Amount of SUI used for dev buy (in MIST)
 * @returns {Object} Simulated curve state after dev buy
 */
const simulateCurveAfterDevBuy = (devBuySuiAmount) => {
    try {
        const devBuyAmount = Number(devBuySuiAmount);
        
        // Calculate tokens received from dev buy
        const tokensFromDevBuy = firstBuyMath(devBuyAmount);
        
        // Calculate new reserves after dev buy
        const fee_amount = (devBuyAmount * FEE_BPS) / BPS_DENOMINATOR;
        const amount_after_fee = devBuyAmount - fee_amount;
        
        // New reserves after dev buy
        const newSuiReserve = INITIAL_INPUT_RESERVE + amount_after_fee;
        const newTokenReserve = INITIAL_OUTPUT_RESERVE - tokensFromDevBuy;
        
        console.log(`Dev buy simulation:`);
        console.log(`  Dev buy SUI: ${devBuyAmount / 1_000_000_000} SUI`);
        console.log(`  Tokens from dev buy: ${tokensFromDevBuy.toLocaleString()}`);
        console.log(`  New SUI reserve: ${newSuiReserve}`);
        console.log(`  New token reserve: ${newTokenReserve.toLocaleString()}`);
        
        // Return simulated curve state in the format expected by buyMath
        return {
            content: {
                fields: {
                    virtual_sui_reserve: newSuiReserve.toString(),
                    virtual_coin_reserve: newTokenReserve.toString()
                }
            }
        };
        
    } catch (error) {
        console.error('Error simulating curve after dev buy:', error);
        return null;
    }
};

/**
 * Calculates SUI needed for bundled purchases after dev buy
 * This is the proper way to calculate distribution funding
 * @param {number} tokenAmount - Amount of tokens to buy
 * @param {number} devBuySuiAmount - Amount of SUI used for dev buy (in MIST)
 * @returns {number} SUI amount needed (in MIST)
 */
const calculateSuiForBundledPurchase = (tokenAmount, devBuySuiAmount) => {
    try {
        // Simulate curve state after dev buy
        const curveAfterDevBuy = simulateCurveAfterDevBuy(devBuySuiAmount);
        
        if (!curveAfterDevBuy) {
            console.warn('Failed to simulate curve after dev buy, using fallback');
            return calculateSuiForFirstBuy(tokenAmount);
        }
        
        // Calculate SUI needed using the updated curve state
        const suiNeeded = calculateSuiForTokens(curveAfterDevBuy, tokenAmount);
        
        console.log(`Bundled purchase calculation:`);
        console.log(`  Token amount: ${tokenAmount.toLocaleString()}`);
        console.log(`  SUI needed: ${(suiNeeded / 1_000_000_000).toFixed(6)} SUI`);
        
        return suiNeeded;
        
    } catch (error) {
        console.error('Error calculating SUI for bundled purchase:', error);
        // Fallback to first buy calculation
        return calculateSuiForFirstBuy(tokenAmount);
    }
};

module.exports = { 
    firstBuyMath, 
    buyMath, 
    sellMath, 
    calculateSuiForTokens, 
    calculateSuiForFirstBuy, 
    calculatePriceImpact,
    simulateCurveAfterDevBuy,
    calculateSuiForBundledPurchase
};
