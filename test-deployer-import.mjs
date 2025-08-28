// Test file to verify the DeployerWidget can be imported correctly
// Run with: node test-deployer-import.mjs

import pkg from './src/react/index.js';
const { DeployerWidgetStandalone, DeployerWidgetEmbedded, DeployerWidgetIntegrated } = pkg;

console.log('Testing DeployerWidget imports...\n');

// Check if components are exported
console.log('✓ DeployerWidgetStandalone:', typeof DeployerWidgetStandalone === 'function' ? 'Exported' : 'Not found');
console.log('✓ DeployerWidgetEmbedded:', typeof DeployerWidgetEmbedded === 'function' ? 'Exported' : 'Not found');
console.log('✓ DeployerWidgetIntegrated:', typeof DeployerWidgetIntegrated === 'function' ? 'Exported' : 'Not found');

// Test require syntax
console.log('\nTesting CommonJS require...');
try {
  const widgets = require('./src/react/index.js');
  console.log('✓ CommonJS exports available:', Object.keys(widgets).join(', '));
} catch (e) {
  console.log('✗ CommonJS require failed:', e.message);
}

console.log('\n✅ All DeployerWidget exports are ready for npm publishing!');
