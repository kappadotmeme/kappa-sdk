"use client";
import { WidgetStandalone } from '@kappa/sdk/react';

export default function Page() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', padding: 24, overflow: 'hidden' }}>
      <WidgetStandalone projectName="KAPPA" />
    </div>
  );
}
