// Test script to verify kappa.js values
const kappa = require('../../kappa.js');

console.log('Testing kappa.js module values:');
console.log('================================');

// Try to access the module's internal values (if exported)
console.log('Module exports:', Object.keys(kappa));

// Test setNetworkConfig
console.log('\nTesting setNetworkConfig...');

const testConfig = {
  bondingContract: '0xf1ba7eae2494f147cf4a67e8f87b894382ebe9261c5f1cd7c13fdacce82ebc37',
  CONFIG: '0x9b0fb19055c8b77f76203635ef6c4b4dac9928031d42c7e42131491adc3f87ae',
  globalPauseStatusObjectId: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
  poolsId: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
  moduleName: 'kappadotmeme_partner',
};

if (kappa.setNetworkConfig) {
  kappa.setNetworkConfig(testConfig);
  console.log('✓ setNetworkConfig called with partner module config');
} else {
  console.log('✗ setNetworkConfig not found');
}

console.log('\nAvailable methods:');
for (const key of Object.keys(kappa)) {
  if (typeof kappa[key] === 'function') {
    console.log(`  - ${key}()`);
  }
}
