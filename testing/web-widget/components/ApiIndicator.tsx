"use client";
import { API_CONFIG } from '../config/api';
import { useState, useEffect } from 'react';

export default function ApiIndicator() {
  const isProduction = API_CONFIG.useProduction;
  const isProxy = API_CONFIG.mode === 'proxy';
  const apiBase = API_CONFIG.getApiBase();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const res = await fetch(`${apiBase}/v1/coins/trending?page=1&size=1`);
        setIsConnected(res.ok);
      } catch {
        setIsConnected(false);
      }
    };
    testConnection();
  }, [apiBase]);
  
  const indicatorStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    padding: '8px 16px',
    borderRadius: 8,
    background: isProxy ? '#8b5cf6' : (isProduction ? '#059669' : '#eab308'),
    color: isProxy ? '#ffffff' : (isProduction ? '#ffffff' : '#000000'),
    fontSize: 12,
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };
  
  const dotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: isConnected === false ? '#ef4444' : isProduction ? '#10b981' : '#facc15',
    animation: isConnected === null ? 'pulse 2s infinite' : isConnected ? 'pulse 2s infinite' : 'none',
  };
  
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div 
        style={indicatorStyle} 
        title={`Mode: ${isProxy ? 'Proxy (No CORS)' : 'Direct'}\nAPI: ${apiBase}\nStatus: ${isConnected === null ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}`}
      >
        <div style={dotStyle} />
        <span>
          {isProxy ? 'PROXY MODE' : (isProduction ? 'PRODUCTION' : 'LOCAL')} API
          {isConnected === false && ' ⚠️'}
        </span>
      </div>
    </>
  );
}
