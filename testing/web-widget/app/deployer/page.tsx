"use client";
// Import from local source instead of NPM package
import { DeployerWidgetStandalone } from '../../../../src/react/DeployerWidget';
import { API_BASE } from '../../config/api';

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'rgb(23, 23, 23)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '100px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <DeployerWidgetStandalone projectName="KAPPA" 
      network={{
        bondingContract: '0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6',
        CONFIG: '0xad40a309c9172ccd67463faeedf3515509a1d89a6c8966336366c3f988016df8',
        globalPauseStatusObjectId: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
        poolsId: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
        moduleName: 'kappadotmeme_partner',  // both create and first_buy are in this module
      }}/>
    </div>
  );
}

