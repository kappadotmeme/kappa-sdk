const { buyWeb3, sellWeb3 } = require('../kappa');

function assertPositiveInteger(num, name) {
    if (typeof num !== 'number' || !Number.isFinite(num) || num < 0) {
        throw new Error(`INVALID_${name.toUpperCase()}`);
    }
}

async function buyTokens({ signerPrivateKey, signer, contract, packageId, name, suiInMist, minTokensOut = 0 }) {
    assertPositiveInteger(Number(suiInMist), 'suiInMist');
    assertPositiveInteger(Number(minTokensOut), 'minTokensOut');
    // contract is 0x..::Module::TOKEN; prefer passing packageId+name to match current web3 functions
    const token = {
        publishedObject: { packageId: packageId || (contract ? contract.split('::')[0] : undefined) },
        name: name || (contract ? contract.split('::')[1].replaceAll('_', ' ') : undefined),
        sui: Number(suiInMist),
        min_tokens: Number(minTokensOut),
    };
    const res = await buyWeb3(signer || signerPrivateKey, token);
    if (!res?.success) throw new Error(`BUY_FAILED: ${res?.error || 'unknown'}`);
    return res;
}

async function sellTokens({ signerPrivateKey, signer, contract, packageId, name, tokensIn, minSuiOut = 0 }) {
    assertPositiveInteger(Number(minSuiOut), 'minSuiOut');
    const token = {
        publishedObject: { packageId: packageId || (contract ? contract.split('::')[0] : undefined) },
        name: name || (contract ? contract.split('::')[1].replaceAll('_', ' ') : undefined),
        sell_token: String(tokensIn),
        min_sui: Number(minSuiOut),
    };
    const res = await sellWeb3(signer || signerPrivateKey, token);
    if (!res?.success) throw new Error(`SELL_FAILED: ${res?.error || 'unknown'}`);
    return res;
}

module.exports = { buyTokens, sellTokens };


