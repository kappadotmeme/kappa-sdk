"use client";
import { useEffect, useState } from 'react';

export default function ApiTestPage() {
  const [trending, setTrending] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testApi() {
      try {
        console.log('Testing API at https://api.kappa.fun/v1/coins/trending');
        const response = await fetch('https://api.kappa.fun/v1/coins/trending?page=1&size=50');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        setTrending(data);
      } catch (err) {
        console.error('API Error:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    
    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>API Test Page</h1>
      <p>Testing: https://api.kappa.fun/v1/coins/trending</p>
      
      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ background: 'red', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
      {trending && (
        <div style={{ background: '#2a2a2a', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
          <h2>Success! Found {trending?.data?.coins?.length || 0} coins</h2>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(trending, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Check Browser Console for detailed logs</h3>
      </div>
    </div>
  );
}
