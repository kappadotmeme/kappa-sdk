"use client";
import { WidgetV2Standalone } from '../../../src/react/Widgetv2';

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <WidgetV2Standalone 
        projectName="KAPPA"
        // Widget v2.0.35+ includes the new lockContract prop
        // lockContract={true} // Uncomment to lock token selection
        // defaultContract="0x..." // Uncomment to set a default token
      />
    </div>
  );
}
