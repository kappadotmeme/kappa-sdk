export type PartnerConfig = {
  name: string;
  bondingContract: string;
  CONFIG: string;
  moduleName: string;
  globalPauseStatusObjectId?: string;
  poolsId?: string;
  lpBurnManger?: string;
};

// Keyed by lowercased bondingContract/packageId
export const PARTNERS: Record<string, PartnerConfig> = {
  '0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6': {
    name: 'Patara',
    bondingContract: '0x044a2ea3a2f8b93fad8cf84e5e68af9f304c975235f57c85c774bf88fa7999f6',
    CONFIG: '0xad40a309c9172ccd67463faeedf3515509a1d89a6c8966336366c3f988016df8',
    moduleName: 'kappadotmeme_partner',
    globalPauseStatusObjectId: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
    poolsId: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
    lpBurnManger: '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845',
  },
  '0x9329aacc5381a7c6e419a22b7813361c4efc46cf20846f8247bf4a7bd352857c': {
    name: 'Kappa',
    bondingContract: '0x9329aacc5381a7c6e419a22b7813361c4efc46cf20846f8247bf4a7bd352857c',
    CONFIG: '0x51246bdee8ba0ba1ffacc1d8cd41b2b39eb4630beddcdcc4c50287bd4d791a6c',
    moduleName: 'kappadotmeme',
  },
};


