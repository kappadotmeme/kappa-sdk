"use client";
// Import from local source instead of NPM package
import { WidgetStandalone } from '../../../../src/react/Widget';
import { API_BASE } from '../../config/api';

// Default network configuration - YOUR ACTUAL DEPLOYMENT
const NETWORK_CONFIG = {
  bondingContract: "0x9329aacc5381a7c6e419a22b7813361c4efc46cf20846f8247bf4a7bd352857c",
  CONFIG: "0x51246bdee8ba0ba1ffacc1d8cd41b2b39eb4630beddcdcc4c50287bd4d791a6c",
  globalPauseStatusObjectId: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
  poolsId: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
  lpBurnManger: "0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845",
  moduleName: "kappadotmeme",
};

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <WidgetStandalone
        defaultContract={
          '0xcd732158b567038db304f073d1780ad0e892cd3aa3892a56b2b5abe5596e799a::Hat::HAT'
        }
        lockContract
        projectName="KAPPA"
        apiBase={API_BASE}
        network={NETWORK_CONFIG}
      />
    </div>
  );
}
