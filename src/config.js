// Network configuration for required on-chain object IDs
const NETWORKS = {
    mainnet: {
        bondingContract: "0xa3c9483dcc4d9b96f83df045eecc327d567006ab3bcaeeec8c0ded313698e46a",
        CONFIG: "0x6cf2bc0c72ab45b9957448994bbba7de6567fdba921cedd749bbf57f152fc812",
        globalPauseStatusObjectId: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
        poolsId: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
        lpBurnManger: "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845",
    },
};

const getNetworkConfig = (network = "mainnet") => NETWORKS[network] || NETWORKS.mainnet;

module.exports = { getNetworkConfig };

// Concern - should we be passing these values to the module during tx? if so are these verified by the module / ca.
