const DEFAULT_API_BASE = 'https://api.kappa.fun';

async function listCoins({ apiBaseUrl = DEFAULT_API_BASE, apiKey, signal, timeoutMs = 10_000 } = {}) {
    const headers = { accept: 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;
    const controller = signal ? null : new AbortController();
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    const res = await fetch(`${apiBaseUrl}/v1/coins/`, { headers, signal: signal || controller?.signal }).catch((e) => {
        if (timer) clearTimeout(timer);
        throw e;
    });
    if (timer) clearTimeout(timer);
    if (!res.ok) {
        throw new Error(`API_ERROR_${res.status}`);
    }
    return res.json();
}

module.exports = { listCoins };


