#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
const distReactDir = path.join(distDir, 'react');
const distReactConfigDir = path.join(distReactDir, 'config');
const distReactHooksDir = path.join(distReactDir, 'hooks');

// Create directories if they don't exist
[distDir, distReactDir, distReactConfigDir, distReactHooksDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Build configuration for React components
const buildOptions = {
  entryPoints: [
    'src/react/WidgetV2.tsx',
    'src/react/DeployerWidget.tsx',
    'src/react/FactoryContext.tsx',
    'src/react/config/partners.ts',
    'src/react/hooks/useFactoryConfig.ts',
    'src/react/hooks/useModuleConfig.ts',
  ],
  outdir: 'dist/react',
  bundle: true, // Bundle to resolve imports
  format: 'cjs', // CommonJS format for Node.js compatibility
  platform: 'node',
  target: 'es2020',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  external: [
    'react',
    'react-dom',
    '@mysten/sui',
    '@mysten/dapp-kit',
    '@tanstack/react-query',
    '@mysten/bcs',
    'dotenv',
  ],
  preserveSymlinks: true,
  splitting: false, // Disable code splitting for CJS
  metafile: false,
};

async function build() {
  try {
    console.log('Building React components...');
    
    // Build the TypeScript/JSX files
    await esbuild.build(buildOptions);
    
    // Copy non-JS files (like the existing JS files that don't need transpiling)
    const filesToCopy = [
      { src: 'src/index.js', dest: 'dist/index.js' },
      { src: 'src/index.d.ts', dest: 'dist/index.d.ts' },
      { src: 'src/server.js', dest: 'dist/server.js' },
      { src: 'src/api.js', dest: 'dist/api.js' },
      { src: 'src/config.js', dest: 'dist/config.js' },
      { src: 'src/deploy.js', dest: 'dist/deploy.js' },
      { src: 'src/factory-config.js', dest: 'dist/factory-config.js' },
      { src: 'src/trade.js', dest: 'dist/trade.js' },
      { src: 'src/wasm-base64.js', dest: 'dist/wasm-base64.js' },
      { src: 'src/wasm-loader.js', dest: 'dist/wasm-loader.js' },
    ];
    
    for (const file of filesToCopy) {
      const srcPath = path.join(__dirname, '..', file.src);
      const destPath = path.join(__dirname, '..', file.dest);
      
      if (fs.existsSync(srcPath)) {
        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file.src} to ${file.dest}`);
      }
    }
    
    // Create the main React index.js file that exports the transpiled components
    const reactIndexContent = `// Export React widget components
module.exports = {
  ...require('./WidgetV2.js'),
  ...require('./DeployerWidget.js'),
  ...require('./FactoryContext.js'),
};
`;
    
    fs.writeFileSync(path.join(distReactDir, 'index.js'), reactIndexContent);
    console.log('Created dist/react/index.js');
    
    // Copy TypeScript declaration files
    const declarationFiles = [
      { src: 'src/react/index.d.ts', dest: 'dist/react/index.d.ts' },
      { src: 'src/react/hooks/index.d.ts', dest: 'dist/react/hooks/index.d.ts' },
    ];
    
    for (const file of declarationFiles) {
      const srcPath = path.join(__dirname, '..', file.src);
      const destPath = path.join(__dirname, '..', file.dest);
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file.src} to ${file.dest}`);
      }
    }
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
