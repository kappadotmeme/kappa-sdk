// Network configuration for required on-chain object IDs
const NETWORKS = {
    mainnet: {
        bondingContract: "0x32fb837874e2d42a77b77a058e170024daadc54245b29b5b8a684b0540010fbb",
        CONFIG: "0x93fbfbbe2f65326332a68ee930c069f8e3816f03c8a9f978ec5ce9c82cdae4b0",
        globalPauseStatusObjectId: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
        poolsId: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
        lpBurnManger: "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845",
    },
};

const getNetworkConfig = (network = 'mainnet') => NETWORKS[network] || NETWORKS.mainnet;

module.exports = { getNetworkConfig };

// Concern - should we be passing these values to the module during tx? if so are these verified by the module / ca. 

