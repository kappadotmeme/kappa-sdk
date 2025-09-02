#!/usr/bin/env node

/**
 * Test CORS configuration for the local API server
 * This script checks which origins are allowed by the API
 */

const apiBase = 'http://localhost:4200';
const portsToTest = [3000, 3001, 3002, 8080];

async function testCORS(port) {
  const origin = `http://localhost:${port}`;
  
  try {
    const response = await fetch(`${apiBase}/v1/coins/trending?page=1&size=1`, {
      method: 'HEAD',
      headers: {
        'Origin': origin
      }
    });
    
    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowCredentials = response.headers.get('access-control-allow-credentials');
    
    if (allowOrigin === origin || allowOrigin === '*') {
      console.log(`✅ Port ${port}: ALLOWED (Origin: ${allowOrigin}, Credentials: ${allowCredentials})`);
      return true;
    } else {
      console.log(`❌ Port ${port}: BLOCKED (No matching Access-Control-Allow-Origin header)`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Port ${port}: ERROR - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Testing CORS configuration for API at', apiBase);
  console.log('=' .repeat(60));
  
  const results = [];
  for (const port of portsToTest) {
    const allowed = await testCORS(port);
    results.push({ port, allowed });
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('Summary:');
  const allowedPorts = results.filter(r => r.allowed).map(r => r.port);
  const blockedPorts = results.filter(r => !r.allowed).map(r => r.port);
  
  if (allowedPorts.length > 0) {
    console.log('✅ Allowed ports:', allowedPorts.join(', '));
  }
  if (blockedPorts.length > 0) {
    console.log('❌ Blocked ports:', blockedPorts.join(', '));
  }
  
  if (blockedPorts.includes(3001)) {
    console.log('\n⚠️  Port 3001 is blocked. To use port 3001, update your API server\'s CORS configuration.');
  }
}

main().catch(console.error);
