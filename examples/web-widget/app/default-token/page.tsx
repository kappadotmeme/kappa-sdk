"use client";
import { WidgetStandalone } from 'kappa-create/react';

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', overflow: 'hidden' }}>
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
