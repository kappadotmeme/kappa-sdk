# Testing Web Widget

This is a local testing environment for the Kappa SDK widgets. It imports the widget components directly from the local source code instead of the published NPM package.

## Purpose

This testing setup allows you to:
- Test changes to the widget components in real-time without publishing to NPM
- Debug and develop new features locally
- Verify widget functionality before release
- Switch between local and production API endpoints

## Setup

1. Install dependencies:
```bash
cd Testing/web-widget
npm install
```

2. Run the development server:
```bash
# Default (port 3000) - works with current API CORS settings
npm run dev

# Alternative (port 3001) - requires API CORS configuration
npm run dev:3001
```

3. Open your browser:
   - Port 3000: [http://localhost:3000](http://localhost:3000) (default, works with API)
   - Port 3001: [http://localhost:3001](http://localhost:3001) (requires API CORS update)

## API Configuration

### Switching Between Local and Production APIs

The testing environment supports switching between production and local API endpoints:

- **Production API**: `https://api.kappa.fun`
- **Local API**: `http://localhost:4200`

To switch between environments, edit the file `Testing/web-widget/config/api.ts`:

```typescript
export const API_CONFIG = {
  // Toggle this to switch between environments
  useProduction: true,  // Set to false for local development
  
  // API Base URLs
  production: 'https://api.kappa.fun',
  local: 'http://localhost:4200',
  ...
};
```

### Visual Indicator

An indicator in the bottom-right corner shows which API environment is currently active:
- **Green badge**: Production API
- **Yellow badge**: Local API

### Running Local API Server

If you're using the local API option, ensure your local API server is running on port 4200:

```bash
# Start your local API server (command depends on your backend setup)
# Example:
npm run api:dev  # or whatever command starts your local API
```

#### CORS Configuration Note

The local API server must be configured to accept requests from your development server's origin:
- **Port 3000**: Usually works by default with most API setups
- **Port 3001**: Requires adding `http://localhost:3001` to your API's CORS allowed origins

If you see blank results or network errors in the browser console when using port 3001, update your API server's CORS configuration to include `http://localhost:3001` in the allowed origins list.

## Available Pages

- `http://localhost:3000/` - Main widget standalone demo
- `http://localhost:3000/default-token` - Widget with pre-configured default token contract
- `http://localhost:3000/deployer` - Token deployer widget for creating new tokens
- `http://localhost:3000/debug` - Debug page with API testing and console logging

(Replace `3000` with `3001` if using `npm run dev:3001`)

## Key Differences from Examples

Unlike the examples folder which imports from the NPM package (`kappa-create/react`), this testing environment imports directly from the local source:

- `WidgetStandalone` from `src/react/Widget.tsx`
- `DeployerWidgetStandalone` from `src/react/DeployerWidget.tsx`

This allows for immediate testing of changes made to the widget source code.

## Development Workflow

1. Configure API environment in `config/api.ts`
2. Make changes to the widget source code in `src/react/`
3. The Next.js dev server will automatically reload with your changes
4. Test the widgets in the browser with either local or production API
5. Once satisfied, the changes can be published to NPM

## Notes

- The Testing webapp uses the same Next.js configuration as the examples
- All widget features and props work identically to the NPM version
- This is for internal testing only and should not be deployed to production
- The API indicator helps you always know which backend you're connected to
