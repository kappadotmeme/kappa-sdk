"use client";
import { useEffect, useState } from 'react';
import { API_CONFIG } from '../config/api';

export default function DebugPanel() {
  const [apiCalls, setApiCalls] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const apiBase = API_CONFIG.getApiBase();

  useEffect(() => {
    // Intercept fetch calls for debugging
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const url = String(args[0]);
      if (url.includes('/v1/coins')) {
        const timestamp = new Date().toLocaleTimeString();
        setApiCalls(prev => [...prev.slice(-9), `${timestamp}: ${url}`]);
        console.log(`[API Call] ${url}`);
      }
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    left: 20,
    maxWidth: 400,
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 8,
    color: '#e5e7eb',
    fontSize: 11,
    fontFamily: 'monospace',
    zIndex: 9998,
    transition: 'all 0.3s ease',
  };

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    background: '#2a2a2a',
    borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const contentStyle: React.CSSProperties = {
    maxHeight: 200,
    overflowY: 'auto',
    padding: '8px 12px',
    borderTop: '1px solid #333',
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle} onClick={() => setIsExpanded(!isExpanded)}>
        <span>🐛 Debug: API Calls ({apiCalls.length})</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>
      {isExpanded && (
        <div style={contentStyle}>
          <div style={{ marginBottom: 8, color: '#7aa6cc' }}>
            Current API: {apiBase}
          </div>
          {apiCalls.length === 0 ? (
            <div style={{ color: '#666' }}>No API calls yet...</div>
          ) : (
            apiCalls.map((call, i) => (
              <div key={i} style={{ marginBottom: 4, wordBreak: 'break-all' }}>
                {call}
              </div>
            ))
          )}
          {apiCalls.length > 0 && (
            <button 
              onClick={() => setApiCalls([])} 
              style={{ 
                marginTop: 8, 
                padding: '4px 8px', 
                background: '#333', 
                border: 'none', 
                borderRadius: 4, 
                color: '#999', 
                cursor: 'pointer', 
                fontSize: 10 
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
