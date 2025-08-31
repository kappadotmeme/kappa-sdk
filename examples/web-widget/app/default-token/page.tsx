"use client";
import { WidgetStandalone } from 'kappa-create/react';

export default function Page() {
  // Example using just a contract address
  // The widget will automatically fetch the factory configuration from the API
  const defaultContract = '0x4722649f9f874823aec93834eda3a5c769dfd9aad216bda9d45afa2e4c0a1451::Trolf::TROLF';
  
  return (
    <div style={{ width: '100%', height: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <WidgetStandalone
        defaultContract={defaultContract}
        lockContract
        projectName="KAPPA"
      />
    </div>
  );
}
