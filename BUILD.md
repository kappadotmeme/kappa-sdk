# Build Process

This package uses a build process to transpile TypeScript and JSX files before publishing to NPM. This ensures that third-party users can import the package without needing to configure their own build tools to handle TypeScript/JSX.

## Build Commands

### Full Build
```bash
npm run build
```
This runs both the WASM bundling and React component transpilation.

### Build React Components Only
```bash
npm run build:react
```
Transpiles all TypeScript/JSX files in `src/react/` to JavaScript in `dist/react/`.

### Build WASM Only
```bash
npm run build:wasm
```
Bundles the WASM file as base64 for easier distribution.

## What Gets Built

The build process:
1. Transpiles all `.tsx` and `.ts` files from `src/react/` to `.js` files in `dist/react/`
2. Transforms JSX syntax to regular JavaScript function calls
3. Converts TypeScript to JavaScript
4. Copies all other JavaScript files from `src/` to `dist/`
5. Preserves the directory structure
6. Maintains CommonJS format for compatibility

## Published Files

When the package is published to NPM, only the `dist/` folder is included (not `src/`), along with:
- `kappa.js`, `kappa-trade.js`, `math.js`
- `move-bytecode/` directory
- `scripts/` directory
- `README.md` and `docs/`

## For Package Consumers

Third-party users can now import the package without any build configuration:

```javascript
// CommonJS
const { WidgetV2Embedded, DeployerWidgetStandalone } = require('kappa-create/react');

// ES Modules
import { WidgetV2Embedded, DeployerWidgetStandalone } from 'kappa-create/react';
```

The package is pre-transpiled and ready to use in any JavaScript environment that supports ES2020.

## Development Workflow

1. Make changes to source files in `src/`
2. Run `npm run build` to transpile
3. Test the build with `npm test`
4. Publish with `npm publish` (which automatically runs the build via `prepublishOnly`)

## Troubleshooting

If you encounter import errors:
1. Ensure you've run `npm run build` before testing locally
2. Check that the `dist/` folder exists and contains the transpiled files
3. Verify that `package.json` exports point to `dist/` not `src/`
