#!/usr/bin/env node

// Test script to verify factory configuration fetching

const API_BASE = 'http://localhost:4200';

// Test tokens (from trending list)
const TEST_TOKENS = [
  {
    name: 'Default Module Token (HAT)',
    address: '0xcd732158b567038db304f073d1780ad0e892cd3aa3892a56b2b5abe5596e799a::Hat::HAT',
    expectedFactory: '0x9329aacc5381a7c6e419a22b7813361c4efc46cf20846f8247bf4a7bd352857c',
    expectedModule: 'kappadotmeme'
  },
  {
    name: 'Partner Module Token (Orange Hand)', 
    address: '0xaf81b0eaf5ab0e8c9362a067fb0d97aa2de374904081c071d73755155718242c::Orange_Hand::ORANGE_HAND',
    expectedFactory: '0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6',
    expectedModule: 'kappadotmeme_partner'
  }
];

async function testFactoryConfig() {
  console.log('Testing Factory Configuration Fetching\n');
  console.log('=' .repeat(60));
  
  for (const token of TEST_TOKENS) {
    console.log(`\nTesting: ${token.name}`);
    console.log(`Address: ${token.address}`);
    console.log('-'.repeat(40));
    
    // Step 1: Get token from trending
    try {
      const trendingRes = await fetch(`${API_BASE}/v1/coins/trending?page=1&size=50`);
      const trendingJson = await trendingRes.json();
      const coins = trendingJson?.data?.coins || [];
      const found = coins.find(c => c.address === token.address);
      
      if (found) {
        console.log('✅ Found in trending');
        console.log(`   Factory Address: ${found.factoryAddress}`);
        
        if (found.factoryAddress === token.expectedFactory) {
          console.log(`   ✅ Factory address matches expected`);
        } else {
          console.log(`   ❌ Factory address mismatch!`);
          console.log(`      Expected: ${token.expectedFactory}`);
          console.log(`      Got: ${found.factoryAddress}`);
        }
        
        // Step 2: Fetch factory configuration
        if (found.factoryAddress) {
          const factoryRes = await fetch(`${API_BASE}/v1/coins/factories/${found.factoryAddress}`);
          const factoryJson = await factoryRes.json();
          const factory = factoryJson?.data?.factory || factoryJson?.data || factoryJson;
          
          console.log('\n   Factory Configuration:');
          console.log(`   - Name: ${factory.name}`);
          console.log(`   - Address (bondingContract): ${factory.address}`);
          console.log(`   - Config Address: ${factory.configAddress}`);
          
          // Determine module name
          let moduleName = 'kappadotmeme';
          if (factory.address === '0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6') {
            moduleName = 'kappadotmeme_partner';
          }
          
          console.log(`   - Module Name (inferred): ${moduleName}`);
          
          if (moduleName === token.expectedModule) {
            console.log(`   ✅ Module name correct`);
          } else {
            console.log(`   ❌ Module name mismatch!`);
            console.log(`      Expected: ${token.expectedModule}`);
            console.log(`      Got: ${moduleName}`);
          }
        }
        
      } else {
        console.log('❌ Not found in trending');
      }
      
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Complete!\n');
}

testFactoryConfig().catch(console.error);
