"use client";
// Import from local source instead of NPM package
import { DeployerWidgetStandalone } from '../../../../src/react/DeployerWidget';
import { API_BASE } from '../../config/api';

export default function Page() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', paddingBottom: '20px', boxSizing: 'border-box', overflowY: 'auto' }}>
      <DeployerWidgetStandalone projectName="KAPPA" 
      network={{
        bondingContract: '0xf1ba7eae2494f147cf4a67e8f87b894382ebe9261c5f1cd7c13fdacce82ebc37', //Factory ID - assigned by Kappa
        CONFIG: '0x9b0fb19055c8b77f76203635ef6c4b4dac9928031d42c7e42131491adc3f87ae', //CONFIG - assigned by Kappa
        globalPauseStatusObjectId: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f', // Global Pause Status Object ID - Static - DO NOT CHANGE
        poolsId: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0', // Poolss ID - Static - DO NOT CHANGE
        moduleName: 'kappadotmeme_partner',  // both create and first_buy are in this module - Assigned by Kappa
      }}/>
    </div>
  );
}

