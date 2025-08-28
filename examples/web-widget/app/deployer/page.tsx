"use client";
import { DeployerWidgetStandalone } from 'kappa-create/react';

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <DeployerWidgetStandalone projectName="KAPPA" 
      network={{
        bondingContract: '0x860ca3287542b1eedc5880732b290d49f40f8dc3ad5365a4efb2692e533f3de9',
        CONFIG: '0x3e87697f5a0fa4f53c4121cec630f2e3399c47e66198339a895ad26e9ecb388a',
        globalPauseStatusObjectId: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
        poolsId: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
        moduleName: 'kappadotmeme_partner',  // both create and first_buy are in this module
      }}/>
    </div>
  );
}

