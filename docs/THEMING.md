# Kappa Widget Theming Guide

The Kappa Widget V2 supports comprehensive theming through CSS custom properties (CSS variables). This allows you to customize every aspect of the widget's appearance to match your brand or design system.

## Quick Start

```tsx
import { WidgetV2Standalone } from '@kappa/sdk';

const myTheme = {
  '--kappa-bg': '#ffffff',
  '--kappa-text': '#000000',
  '--kappa-primary': '#007bff',
  '--kappa-accent': '#6c757d',
};

function App() {
  return <WidgetV2Standalone theme={myTheme} />;
}
```

## Available Theme Tokens

### Base Colors
- `--kappa-bg`: Main background color
- `--kappa-panel`: Panel/card background
- `--kappa-input-bg`: Input field background
- `--kappa-border`: Default border color
- `--kappa-text`: Primary text color
- `--kappa-muted`: Muted/secondary text
- `--kappa-accent`: Accent color for links and highlights
- `--kappa-primary`: Primary button and action color
- `--kappa-text-on-primary`: Text color on primary background
- `--kappa-success`: Success state color
- `--kappa-error`: Error state color
- `--kappa-warning`: Warning state color

### Component Specific

#### Chips & Badges
- `--kappa-chip-bg`: Chip background
- `--kappa-chip-border`: Chip border
- `--kappa-status-ok-bg`: Success status background
- `--kappa-status-ok-border`: Success status border
- `--kappa-status-err-bg`: Error status background
- `--kappa-status-err-border`: Error status border

#### Buttons
- `--kappa-button-primary-bg`: Primary button background
- `--kappa-button-primary-hover`: Primary button hover state
- `--kappa-button-primary-text`: Primary button text
- `--kappa-button-secondary-bg`: Secondary button background
- `--kappa-button-secondary-hover`: Secondary button hover
- `--kappa-button-secondary-text`: Secondary button text
- `--kappa-button-danger-bg`: Danger button background
- `--kappa-button-danger-hover`: Danger button hover
- `--kappa-button-danger-text`: Danger button text

#### Quick Select Buttons
- `--kappa-quick-bg`: Quick select button background
- `--kappa-quick-border`: Quick select button border
- `--kappa-quick-text`: Quick select button text
- `--kappa-quick-hover-bg`: Hover background
- `--kappa-quick-hover-border`: Hover border
- `--kappa-quick-max-text`: MAX button text color
- `--kappa-quick-max-hover-bg`: MAX button hover background
- `--kappa-quick-max-hover-border`: MAX button hover border

#### Token Selection
- `--kappa-token-button-bg`: Token button background
- `--kappa-token-button-border`: Token button border
- `--kappa-token-button-hover-bg`: Token button hover background
- `--kappa-token-button-hover-border`: Token button hover border
- `--kappa-token-list-hover`: Token list item hover

#### Input Fields
- `--kappa-input-border`: Input border color
- `--kappa-input-focus-border`: Input focus border
- `--kappa-input-text`: Input text color
- `--kappa-input-placeholder`: Placeholder text color

#### Swap Button
- `--kappa-swap-button-bg`: Swap button background
- `--kappa-swap-button-hover`: Swap button hover
- `--kappa-swap-icon`: Swap icon color

#### Modals
- `--kappa-modal-bg`: Modal backdrop color
- `--kappa-avatar-bg`: Avatar placeholder background
- `--kappa-tab-active-bg`: Active tab background

### Layout & Effects

#### Shadows
- `--kappa-shadow-sm`: Small shadow
- `--kappa-shadow-md`: Medium shadow
- `--kappa-shadow-lg`: Large shadow
- `--kappa-shadow-xl`: Extra large shadow
- `--kappa-shadow-primary`: Primary color shadow
- `--kappa-shadow-danger`: Danger color shadow

#### Border Radius
- `--kappa-radius-sm`: 6px
- `--kappa-radius-md`: 8px
- `--kappa-radius-lg`: 12px
- `--kappa-radius-xl`: 16px
- `--kappa-radius-full`: 9999px (fully rounded)

#### Spacing
- `--kappa-space-xs`: 4px
- `--kappa-space-sm`: 8px
- `--kappa-space-md`: 12px
- `--kappa-space-lg`: 16px
- `--kappa-space-xl`: 20px
- `--kappa-space-2xl`: 24px

### Typography

#### Font Family
- `--kappa-font-family`: Font stack

#### Font Sizes
- `--kappa-font-size-xs`: 11px
- `--kappa-font-size-sm`: 12px
- `--kappa-font-size-md`: 14px
- `--kappa-font-size-lg`: 16px
- `--kappa-font-size-xl`: 18px
- `--kappa-font-size-2xl`: 24px

#### Font Weights
- `--kappa-font-weight-normal`: 400
- `--kappa-font-weight-medium`: 500
- `--kappa-font-weight-semibold`: 600
- `--kappa-font-weight-bold`: 700

### Animations
- `--kappa-transition-fast`: 0.15s ease
- `--kappa-transition-base`: 0.2s ease
- `--kappa-transition-slow`: 0.3s ease

### Z-Index Layers
- `--kappa-z-base`: 1
- `--kappa-z-dropdown`: 100
- `--kappa-z-modal`: 9999
- `--kappa-z-tooltip`: 10000

## Example Themes

### Light Theme
```javascript
const lightTheme = {
  '--kappa-bg': '#ffffff',
  '--kappa-panel': '#f3f4f6',
  '--kappa-text': '#111827',
  '--kappa-muted': '#6b7280',
  '--kappa-primary': '#2563eb',
  '--kappa-accent': '#3b82f6',
  '--kappa-border': '#e5e7eb',
  '--kappa-chip-bg': '#f9fafb',
  '--kappa-chip-border': '#d1d5db',
};
```

### Dark Theme (Default)
```javascript
const darkTheme = {
  '--kappa-bg': '#0f1218',
  '--kappa-panel': '#1a1d26',
  '--kappa-text': '#e5e7eb',
  '--kappa-muted': '#9ca3af',
  '--kappa-primary': '#2563eb',
  '--kappa-accent': '#7aa6cc',
  '--kappa-border': '#2a2f3a',
};
```

### Neon Theme
```javascript
const neonTheme = {
  '--kappa-bg': '#0a0a0a',
  '--kappa-panel': '#1a0f2e',
  '--kappa-text': '#f0abfc',
  '--kappa-muted': '#c084fc',
  '--kappa-primary': '#8b5cf6',
  '--kappa-accent': '#a78bfa',
  '--kappa-border': '#6d28d9',
  '--kappa-shadow-lg': '0 0 40px rgba(139, 92, 246, 0.3)',
};
```

### Ocean Theme
```javascript
const oceanTheme = {
  '--kappa-bg': '#0c1929',
  '--kappa-panel': '#132337',
  '--kappa-text': '#b8d4e3',
  '--kappa-muted': '#5e8ca7',
  '--kappa-primary': '#0891b2',
  '--kappa-accent': '#06b6d4',
  '--kappa-border': '#1e3a5f',
};
```

## Advanced Usage

### Partial Theming
You don't need to override all tokens. Provide only the ones you want to change:

```javascript
const brandTheme = {
  '--kappa-primary': '#ff6b35',
  '--kappa-accent': '#ff8c42',
};
```

### Dynamic Theming
Change themes dynamically based on user preference:

```javascript
function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return <WidgetV2Standalone theme={theme} />;
}
```

### Responsive Theming
Adjust theme based on screen size or device:

```javascript
const mobileTheme = {
  '--kappa-space-lg': '12px',
  '--kappa-space-xl': '16px',
  '--kappa-font-size-lg': '14px',
};

const theme = isMobile ? { ...baseTheme, ...mobileTheme } : baseTheme;
```

## Best Practices

1. **Maintain Contrast**: Ensure sufficient contrast between text and background colors for accessibility
2. **Test All States**: Check hover, active, disabled, and error states
3. **Be Consistent**: Use the same color palette throughout
4. **Consider Dark Mode**: Test your theme in both light and dark environments
5. **Use Semantic Tokens**: Prefer semantic tokens (primary, accent) over specific colors

## TypeScript Support

The theme prop accepts a partial theme object:

```typescript
import { WidgetV2Standalone } from '@kappa/sdk';

interface ThemeTokens {
  '--kappa-bg'?: string;
  '--kappa-text'?: string;
  // ... other tokens
}

const myTheme: ThemeTokens = {
  '--kappa-bg': '#ffffff',
  '--kappa-text': '#000000',
};
```

## Live Examples

Check out the `/themed` route in the testing app to see live examples of different themes in action.
