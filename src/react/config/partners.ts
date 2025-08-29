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
  '0xf1ba7eae2494f147cf4a67e8f87b894382ebe9261c5f1cd7c13fdacce82ebc37': {
    name: 'Patara',
    bondingContract: '0xf1ba7eae2494f147cf4a67e8f87b894382ebe9261c5f1cd7c13fdacce82ebc37',
    CONFIG: '0x9b0fb19055c8b77f76203635ef6c4b4dac9928031d42c7e42131491adc3f87ae',
    moduleName: 'kappadotmeme_partner',
    globalPauseStatusObjectId: '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f',
    poolsId: '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0',
    lpBurnManger: '0x1d94aa32518d0cb00f9de6ed60d450c9a2090761f326752ffad06b2e9404f845',
  },
  '0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc': {
    name: 'Kappa',
    bondingContract: '0x7073eb9242244485f7244695448bc2c0c4c3467468683fc288d3ef5e51f4e9dc',
    CONFIG: '0xe8e412e0c5ed22611707a9cbf78a174106dbf957a313c3deb7477db848c8bf4c',
    moduleName: 'kappadotmeme',
  },
};


