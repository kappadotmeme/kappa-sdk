"use client";
// Import from local source instead of NPM package
import { WidgetStandalone } from '../../../../src/react/Widget';
import { API_BASE } from '../../config/api';

// Default network configuration - YOUR ACTUAL DEPLOYMENT
const NETWORK_CONFIG = {
  bondingContract: "0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc",
  CONFIG: "0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c",
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
