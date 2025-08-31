import { WidgetStandalone } from 'kappa-create/react';

export default function MyApp() {
  // Option 1: Let the widget auto-detect (requires proxy in next.config.js)
  return (
    <WidgetStandalone
      defaultContract="0x4722649f9f874823aec93834eda3a5c769dfd9aad216bda9d45afa2e4c0a1451::Trolf::TROLF"
      projectName="My DEX"
    />
  );
  
  // Option 2: If proxy is not working, explicitly set apiBase to use proxy
  // return (
  //   <WidgetStandalone
  //     apiBase="/api"  // Force use of proxy path
  //     defaultContract="0x4722649f9f874823aec93834eda3a5c769dfd9aad216bda9d45afa2e4c0a1451::Trolf::TROLF"
  //     projectName="My DEX"
  //   />
  // );
}
