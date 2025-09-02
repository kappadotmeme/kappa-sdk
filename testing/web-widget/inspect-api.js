#!/usr/bin/env node

/**
 * Inspect the structure of the new API responses
 */

const API_BASE = 'http://localhost:4200';

async function inspectAPI() {
  console.log('🔍 Inspecting New API Structure\n');
  console.log(`API Base: ${API_BASE}\n`);
  
  // Fetch trending coins
  console.log('1. Fetching Trending Coins:');
  try {
    const res = await fetch(`${API_BASE}/v1/coins/trending?page=1&size=2`);
    const data = await res.json();
    
    console.log('Response structure:');
    console.log('- status:', data.status);
    console.log('- data type:', typeof data.data);
    console.log('- data.coins exists:', !!data.data?.coins);
    console.log('- Number of coins:', data.data?.coins?.length || 0);
    
    if (data.data?.coins?.[0]) {
      const coin = data.data.coins[0];
      console.log('\nFirst coin fields:');
      const fields = Object.keys(coin).sort();
      fields.forEach(field => {
        const value = coin[field];
        const type = typeof value;
        const preview = type === 'string' 
          ? value.length > 50 ? value.substring(0, 50) + '...' : value
          : type === 'object' 
          ? JSON.stringify(value).substring(0, 50) + '...'
          : value;
        console.log(`  - ${field}: [${type}] ${preview}`);
      });
      
      // Look for bonding curve related fields
      console.log('\nBonding curve related fields:');
      fields.filter(f => f.toLowerCase().includes('bond') || f.toLowerCase().includes('curve') || f.toLowerCase().includes('object')).forEach(field => {
        console.log(`  - ${field}: ${coin[field]}`);
      });
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  // Test search
  console.log('\n2. Testing Search:');
  try {
    const res = await fetch(`${API_BASE}/v1/coins?nameOrSymbol=a`);
    const data = await res.json();
    
    console.log('Search response structure:');
    console.log('- status:', data.status);
    console.log('- data.coins exists:', !!data.data?.coins);
    console.log('- Number of results:', data.data?.coins?.length || 0);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

inspectAPI();
