"use client";
import { WidgetStandalone } from 'kappa-create/react';

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <WidgetStandalone projectName="KAPPA" />
    </div>
  );
}
