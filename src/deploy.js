const { createCoinWeb3, createCurveWeb3, firstBuyWeb3 } = require('../kappa');

function requireString(value, name) {
    if (!value || typeof value !== 'string') throw new Error(`MISSING_${name.toUpperCase()}`);
}

async function createToken({
    signerPrivateKey,
    signer,
    name,
    symbol,
    description,
    icon,
    website = '',
    twitter = '',
    telegram = '',
    tags = [],
    maxTx = false,
    firstBuy,
}) {
    requireString(name, 'name');
    requireString(symbol, 'symbol');
    requireString(description, 'description');
    requireString(icon, 'icon');
    const tokenData = { name, symbol, description, icon };
    const deployRes = await createCoinWeb3(signer || signerPrivateKey, tokenData);
    if (!deployRes?.success) throw new Error('CREATE_TOKEN_PUBLISH_FAILED');

    const token = {
        ...deployRes,
        name,
        description,
        website,
        twitter,
        telegram,
        tags,
        maxTx,
    };

    const curveRes = await createCurveWeb3(signer || signerPrivateKey, token);
    if (!curveRes?.success) throw new Error(`CREATE_TOKEN_CURVE_FAILED: ${curveRes?.error || 'unknown'}`);

    if (firstBuy && firstBuy.suiInMist) {
        const fbRes = await firstBuyWeb3(signer || signerPrivateKey, {
            publishedObject: token.publishedObject,
            name,
            sui: Number(firstBuy.suiInMist),
            min_tokens: Number(firstBuy.minTokensOut || 0),
        });
        if (!fbRes?.success) throw new Error(`CREATE_TOKEN_FIRST_BUY_FAILED: ${fbRes?.error || 'unknown'}`);
    }

    return { ...deployRes, curve: curveRes };
}

module.exports = { createToken };


