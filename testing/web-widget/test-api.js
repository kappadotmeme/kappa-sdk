#!/usr/bin/env node

/**
 * Test script to verify API endpoints are accessible
 */

const API_BASE = 'http://localhost:4200';

async function testAPI() {
  console.log('🔍 Testing Local API Connection...\n');
  console.log(`API Base: ${API_BASE}\n`);
  
  // Test trending endpoint
  console.log('1. Testing Trending Coins Endpoint:');
  console.log(`   GET ${API_BASE}/v1/coins/trending?page=1&size=50`);
  try {
    const res = await fetch(`${API_BASE}/v1/coins/trending?page=1&size=50`);
    if (res.ok) {
      const data = await res.json();
      console.log(`   ✅ Success! Found ${data?.data?.length || 0} trending coins`);
      if (data?.data?.[0]) {
        console.log(`   First coin: ${data.data[0].name || 'N/A'} (${data.data[0].symbol || 'N/A'})`);
      }
    } else {
      console.log(`   ❌ Failed with status: ${res.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    console.log(`   Make sure your local API server is running on port 4200`);
  }
  
  console.log('\n2. Testing Search Endpoint:');
  const searchTerm = 'test';
  console.log(`   GET ${API_BASE}/v1/coins?nameOrSymbol=${searchTerm}`);
  try {
    const res = await fetch(`${API_BASE}/v1/coins?nameOrSymbol=${searchTerm}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`   ✅ Success! Found ${data?.data?.length || 0} results for "${searchTerm}"`);
    } else {
      console.log(`   ❌ Failed with status: ${res.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  }
  
  console.log('\n---');
  console.log('📝 Note: If the tests fail, ensure your local API server is running on port 4200');
  console.log('📝 The Testing webapp is configured to use local API (useProduction: false)');
}

testAPI();
