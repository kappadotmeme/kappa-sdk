// Test script to verify kappa.js values
const kappa = require('../../kappa.js');

console.log('Testing kappa.js module values:');
console.log('================================');

// Try to access the module's internal values (if exported)
console.log('Module exports:', Object.keys(kappa));

// Test setNetworkConfig
console.log('\nTesting setNetworkConfig...');

const testConfig = {
  bondingContract: '0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6',
  CONFIG: '0xad40a309c9172ccd67463faeedf3515509a1d89a6c8966336366c3f988016df8',
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
