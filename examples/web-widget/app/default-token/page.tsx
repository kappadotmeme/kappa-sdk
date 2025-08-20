"use client";
import { WidgetStandalone } from '../../../../src/react/Widget';

export default function Page() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', padding: 24, overflow: 'hidden' }}>
      <WidgetStandalone
        defaultContract="0x6cfc2ca529159922af37462f1dda84f319e1d7f20dc8229a2e931f57bcbbba96::Coin::COIN"
        lockContract
      />
    </div>
  );
}


