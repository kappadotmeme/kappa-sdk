"use client";
import { WidgetStandalone } from '../../../../src/react/Widget';

export default function Page() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', padding: 24, overflow: 'hidden' }}>
      <WidgetStandalone
        defaultContract={
          '0xe7ff5f841fca7b4886acd909884e7d9f42d3f46b935ca129df49fe33090ec5c4::Dev_Test::DEV_TEST'
        }
        lockContract
        projectName="KAPPA"
      />
    </div>
  );
}


