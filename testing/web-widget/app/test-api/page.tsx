"use client";
import { useEffect } from 'react';
import { WidgetStandalone } from '../../../../src/react/Widget';

export default function TestApiPage() {
  useEffect(() => {
    // Log all fetch calls to see what's happening
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = String(args[0]);
      console.log('[FETCH INTERCEPTED] URL:', url);
      console.log('[FETCH INTERCEPTED] Full args:', args);
      
      // Call original fetch
      const response = await originalFetch.apply(this, args);
      
      // Log response
      console.log('[FETCH RESPONSE] Status:', response.status, 'for URL:', url);
      
      return response;
    };
    
    // Test direct API call
    console.log('[TEST] Making direct API call to https://api.kappa.fun/v1/coins/trending');
    fetch('https://api.kappa.fun/v1/coins/trending?page=1&size=5')
      .then(res => res.json())
      .then(data => {
        console.log('[TEST] Direct API call success:', data);
      })
      .catch(err => {
        console.error('[TEST] Direct API call failed:', err);
      });
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'rgb(23, 23, 23)', 
      padding: '20px',
      color: 'white'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>API Test Page</h1>
        <p>Open browser console (F12) to see all API calls</p>
        <p>Click on the search input below and type something to trigger API calls</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <WidgetStandalone 
          projectName="API TEST"
        />
      </div>
    </div>
  );
}
