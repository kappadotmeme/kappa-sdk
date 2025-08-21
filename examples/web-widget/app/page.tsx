"use client";
import { WidgetStandalone } from 'kappa-sdk/react';

export default function Page() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', padding: 24, overflow: 'hidden' }}>
      <nav style={{ position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
        <a
          href="/"
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #2563eb', background: '#0b0f16', color: '#e5e7eb', textDecoration: 'none' }}
          title="Standalone widget"
        >
          Standalone
        </a>
        <a
          href="/default-token"
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #2a2f3a', background: '#0b0f16', color: '#e5e7eb', textDecoration: 'none' }}
          title="Default token widget"
        >
          Default token
        </a>
      </nav>
      
      <WidgetStandalone projectName="KAPPA" />
    </div>
  );
}
