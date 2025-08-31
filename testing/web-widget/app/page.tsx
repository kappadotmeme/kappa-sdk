"use client";
// Import from local source instead of NPM package
import { WidgetStandalone } from '../../../src/react/Widget';

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <WidgetStandalone 
        projectName="KAPPA"
        // No apiBase needed - widget v2.0.25+ uses proxy by default
        // The proxy in next.config.js handles API calls
      />
    </div>
  );
}
