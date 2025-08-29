#!/usr/bin/env node

/**
 * Test script to verify search API functionality
 */

const API_BASE = 'http://localhost:4200';

async function testSearch(query) {
  console.log(`\n🔍 Testing search for: "${query}"`);
  console.log(`   GET ${API_BASE}/v1/coins?nameOrSymbol=${query}`);
  
  try {
    const res = await fetch(`${API_BASE}/v1/coins?nameOrSymbol=${query}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`   ✅ Success! Found ${data?.data?.length || 0} results`);
      
      // Show first 3 results
      if (data?.data && data.data.length > 0) {
        console.log('\n   First 3 results:');
        data.data.slice(0, 3).forEach((coin, i) => {
          console.log(`   ${i + 1}. ${coin.symbol || 'N/A'} | ${coin.name || 'N/A'}`);
          console.log(`      Contract: ${coin.contractAddress || 'N/A'}`);
        });
      }
    } else {
      console.log(`   ❌ Failed with status: ${res.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  }
}

async function main() {
  console.log('🔍 Testing Local API Search Functionality');
  console.log(`API Base: ${API_BASE}\n`);
  
  // Test different search terms
  const searchTerms = process.argv.slice(2);
  
  if (searchTerms.length === 0) {
    // Default test searches
    await testSearch('sui');
    await testSearch('test');
    await testSearch('a');
  } else {
    // User-provided search terms
    for (const term of searchTerms) {
      await testSearch(term);
    }
  }
  
  console.log('\n---');
  console.log('Usage: node test-search.js [search term 1] [search term 2] ...');
  console.log('Example: node test-search.js sui kappa test');
}

main();
