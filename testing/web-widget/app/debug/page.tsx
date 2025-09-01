"use client";
import { useState, useEffect } from 'react';
import { WidgetStandalone } from '../../../../src/react/Widget';
import { API_BASE } from '../../config/api';

export default function DebugPage() {
  const [apiTest, setApiTest] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Test API directly
    const testApi = async () => {
      try {
        const apiUrl = 'https://api.kappa.fun';
        console.log('Testing API at:', apiUrl);
        
        // Test trending
        const trendingRes = await fetch(`${apiUrl}/v1/coins/trending?page=1&size=5`);
        const trendingData = await trendingRes.json();
        console.log('Trending response:', trendingData);
        
        // Test search
        const searchRes = await fetch(`${apiUrl}/v1/coins?nameOrSymbol=a`);
        const searchData = await searchRes.json();
        console.log('Search response:', searchData);
        
        setApiTest({
          apiBase: apiUrl,
          trending: {
            status: trendingData?.status,
            coins: trendingData?.data?.coins?.length || 0,
            firstCoin: trendingData?.data?.coins?.[0]
          },
          search: {
            status: searchData?.status,
            coins: searchData?.data?.coins?.length || 0
          }
        });
      } catch (error) {
        console.error('API test error:', error);
        setApiTest({ error: error.message });
      } finally {
        setLoading(false);
      }
    };
    
    testApi();
    
    // Also log when Widget makes API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = String(args[0]);
      if (url.includes('/v1/coins')) {
        console.log('[Widget API Call]:', url);
      }
      const response = await originalFetch(...args);
      if (url.includes('/v1/coins')) {
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          console.log('[Widget API Response]:', url, data);
        } catch {}
      }
      return response;
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  
  return (
    <div style={{ width: '100%', minHeight: '100vh',justifyContent: 'center', background: 'rgb(23, 23, 23)', paddingTop: '100px' }}>
      {/* Widget */}
      <div style={{ display: 'flex', marginBottom: 40, width: '100%', justifyContent: 'center' }}>
        <WidgetStandalone 
          projectName="KAPPA DEBUG" 
          // No apiBase needed - widget v2.0.25+ uses proxy by default
          // The proxy in next.config.js will handle API calls
        />
      </div>
      
      {/* Debug Info Panel */}
      <div style={{ 
        background: '#1a1a1a', 
        border: '1px solid #333', 
        borderRadius: 8, 
        padding: 16, 
        maxWidth: 800,
        margin: '0 auto',
        color: '#e5e7eb',
        fontFamily: 'monospace',
        fontSize: 12
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#7aa6cc' }}>Debug Information</h3>
        {loading ? (
          <div>Loading API tests...</div>
        ) : (
          <div>
            <div>API Base: {apiTest.apiBase}</div>
            <div style={{ marginTop: 8 }}>
              <strong>Trending API:</strong>
              <div>- Status: {apiTest.trending?.status}</div>
              <div>- Coins count: {apiTest.trending?.coins}</div>
              {apiTest.trending?.firstCoin && (
                <>
                  <div>- First coin: {apiTest.trending.firstCoin.symbol} | {apiTest.trending.firstCoin.name}</div>
                  <div>- Address: {apiTest.trending.firstCoin.address}</div>
                </>
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Search API:</strong>
              <div>- Status: {apiTest.search?.status}</div>
              <div>- Results: {apiTest.search?.coins}</div>
            </div>
            {apiTest.error && (
              <div style={{ color: '#f87171', marginTop: 8 }}>Error: {apiTest.error}</div>
            )}
          </div>
        )}
        <div style={{ marginTop: 12, padding: 8, background: '#0a0a0a', borderRadius: 4 }}>
          <strong>Instructions:</strong>
          <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>Open browser console (F12)</li>
            <li>Click on the search input above in the widget</li>
            <li>Type something to search</li>
            <li>Watch console for API calls and responses</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
