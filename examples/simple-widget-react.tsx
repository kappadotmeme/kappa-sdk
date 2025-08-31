import React from 'react';
import { WidgetStandalone } from 'kappa-create/react';

/**
 * Simple Widget Example
 * 
 * This example demonstrates using the Kappa trading widget with minimal configuration.
 * You only need to provide the contract address - the widget automatically fetches:
 * - Factory configuration from the API
 * - Module name (kappadotmeme, partner modules, etc.)
 * - Config IDs and pool addresses
 * - Token metadata and pricing information
 */

export default function SimpleWidgetExample() {
  // Just provide the contract address
  const contractAddress = '0x4722649f9f874823aec93834eda3a5c769dfd9aad216bda9d45afa2e4c0a1451::Trolf::TROLF';
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: '#1a1a1a',
      padding: '50px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
          Kappa Trading Widget
        </h1>
        
        <div style={{ 
          background: '#2a2a2a', 
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '30px',
          color: '#ccc'
        }}>
          <h3 style={{ color: '#4CAF50', marginTop: 0 }}>✨ Minimal Configuration</h3>
          <p>This widget only needs a contract address. Everything else is automatic!</p>
          <p><strong>Contract:</strong> <code style={{ 
            background: '#1a1a1a', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>{contractAddress.slice(0, 20)}...{contractAddress.slice(-10)}</code></p>
        </div>
        
        {/* The Widget - Just needs a contract address! */}
        <WidgetStandalone
          defaultContract={contractAddress}
          lockContract={true}
          projectName="My DEX"
          // That's it! No network configuration needed
          // The widget will fetch everything from the API
        />
      </div>
    </div>
  );
}

/**
 * Alternative: If you want to override the API endpoint
 */
export function WidgetWithCustomAPI() {
  return (
    <WidgetStandalone
      defaultContract="0x4722649f9f874823aec93834eda3a5c769dfd9aad216bda9d45afa2e4c0a1451::Trolf::TROLF"
      lockContract={true}
      projectName="My DEX"
      apiBase="https://api.kappa.fun"  // Optional - this is the default
    />
  );
}

/**
 * Alternative: If you want to manually provide network config
 * (Not recommended - let the widget fetch it automatically)
 */
export function WidgetWithManualConfig() {
  const manualConfig = {
    bondingContract: "0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc",
    CONFIG: "0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c",
    globalPauseStatusObjectId: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
    poolsId: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
    lpBurnManger: "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845",
    moduleName: "kappadotmeme",
  };
  
  return (
    <WidgetStandalone
      defaultContract="0x4722649f9f874823aec93834eda3a5c769dfd9aad216bda9d45afa2e4c0a1451::Trolf::TROLF"
      lockContract={true}
      projectName="My DEX"
      network={manualConfig}  // Only if you need to override the automatic config
    />
  );
}
