"use client";
import { useState, useEffect } from 'react';
import { WidgetStandalone } from '../../../../src/react/Widget';
import { API_BASE } from '../../config/api';
import { useModuleConfig } from '../../../../src/react/hooks/useModuleConfig';

// Example tokens from different modules
const MODULE_EXAMPLES = [
  {
    name: 'Kappa Module Token',
    contract: '0xcd732158b567038db304f073d1780ad0e892cd3aa3892a56b2b5abe5596e799a::Hat::HAT',
    factory: '0x9329aacc5381a7c6e419a22b7813361c4efc46cf20846f8247bf4a7bd352857c',
    description: 'Default Kappa factory'
  },
  {
    name: 'Patara Module Token',
    contract: '0x[example]::Token::TOKEN', // Replace with actual Patara token
    factory: '0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6',
    description: 'Partner Patara factory'
  }
];

export default function MultiModulePage() {
  const [selectedExample, setSelectedExample] = useState(MODULE_EXAMPLES[0]);
  const [factories, setFactories] = useState<any[]>([]);
  const [loadingFactories, setLoadingFactories] = useState(true);
  
  // Fetch the module config for the selected factory
  const { config, loading, error } = useModuleConfig(selectedExample.factory, API_BASE);
  
  // Fetch all available factories
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/coins/factories?page=1&size=50`);
        if (res.ok) {
          const data = await res.json();
          setFactories(data.data?.factories || []);
        }
      } catch (err) {
        console.error('Failed to fetch factories:', err);
      } finally {
        setLoadingFactories(false);
      }
    };
    
    fetchFactories();
  }, []);
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'rgb(23, 23, 23)', 
      padding: '100px 20px 40px',
      boxSizing: 'border-box'
    }}>
      {/* Module Selector */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto 40px',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 12,
        padding: 20,
      }}>
        <h2 style={{ color: '#fff', marginTop: 0 }}>Multi-Module Trading Demo</h2>
        
        {/* Factory List */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#999', fontSize: 14, marginBottom: 10 }}>Available Factories:</h3>
          {loadingFactories ? (
            <div style={{ color: '#666' }}>Loading factories...</div>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {factories.map((factory) => (
                <div
                  key={factory.address}
                  style={{
                    padding: '8px 12px',
                    background: selectedExample.factory === factory.address ? '#2563eb' : '#222',
                    border: '1px solid #444',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    const example = MODULE_EXAMPLES.find(e => e.factory === factory.address);
                    if (example) setSelectedExample(example);
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{factory.name}</div>
                  <div style={{ opacity: 0.7, fontSize: 10 }}>
                    {factory.address.slice(0, 6)}...{factory.address.slice(-4)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Module Config Display */}
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: '#999', fontSize: 14, marginBottom: 10 }}>
            Current Module Configuration:
          </h3>
          <div style={{
            background: '#111',
            border: '1px solid #333',
            borderRadius: 8,
            padding: 12,
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#888',
            overflow: 'auto',
          }}>
            {loading && 'Loading configuration...'}
            {error && <span style={{ color: '#f87171' }}>Error: {error}</span>}
            {config && !loading && (
              <pre style={{ margin: 0 }}>
{JSON.stringify({
  factory: selectedExample.factory,
  name: selectedExample.name,
  config: {
    packageId: config.bondingContract,
    configId: config.CONFIG,
    moduleName: config.moduleName,
    pauseStatus: config.globalPauseStatusObjectId?.slice(0, 10) + '...',
    pools: config.poolsId?.slice(0, 10) + '...',
    lpBurnManager: config.lpBurnManger?.slice(0, 10) + '...',
  }
}, null, 2)}
              </pre>
            )}
          </div>
        </div>
        
        {/* Example Token Selector */}
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: '#999', fontSize: 14, marginBottom: 10 }}>Select Example Token:</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {MODULE_EXAMPLES.map((example) => (
              <button
                key={example.contract}
                onClick={() => setSelectedExample(example)}
                style={{
                  padding: '10px 16px',
                  background: selectedExample.contract === example.contract ? '#2563eb' : '#333',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <div>{example.name}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                  {example.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Widget with Dynamic Config */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <WidgetStandalone
          projectName="MULTI-MODULE"
          apiBase={API_BASE}
          defaultContract={selectedExample.contract}
          // Pass the dynamic config
          network={config || undefined}
        />
      </div>
      
      {/* Info Panel */}
      <div style={{
        maxWidth: 400,
        margin: '40px auto 0',
        padding: 20,
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 12,
        color: '#999',
        fontSize: 13,
        lineHeight: 1.6,
      }}>
        <h3 style={{ color: '#fff', marginTop: 0 }}>How It Works</h3>
        <ol style={{ paddingLeft: 20 }}>
          <li>Each token is created via a specific factory module</li>
          <li>The widget fetches the token's factory address from metadata</li>
          <li>Factory config is loaded dynamically via <code>/v1/coins/factories/{'{address}'}</code></li>
          <li>Buy/Sell transactions use the correct module's package and config IDs</li>
          <li>Configs are cached for 5 minutes to optimize performance</li>
        </ol>
        
        <div style={{ marginTop: 20, padding: 12, background: '#111', borderRadius: 8 }}>
          <strong style={{ color: '#facc15' }}>⚡ Performance Tip:</strong><br/>
          The system automatically preloads factory configs when displaying token lists,
          reducing latency during trades.
        </div>
      </div>
    </div>
  );
}
