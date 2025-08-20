// Server-only SDK entry (Node environments)
const { createToken } = require('./deploy');
const { setSuiClient, setNetworkConfig, setLogger } = require('../kappa');

const initKappaServer = (config = {}) => {
  if (config.client) setSuiClient(config.client);
  if (config.networkConfig) setNetworkConfig(config.networkConfig);
  if (config.logger) setLogger(config.logger);
  return { createToken };
};

module.exports = { initKappaServer, createToken };


