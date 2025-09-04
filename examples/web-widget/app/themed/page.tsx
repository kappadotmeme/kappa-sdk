'use client';

import { WidgetV2Standalone } from '../../../../src/react/WidgetV2';

// Example theme presets
const themes = {
  dark: {
    // Base colors
    '--kappa-bg': '#0f1218',
    '--kappa-panel': '#1a1d26',
    '--kappa-primary': '#2563eb',
    '--kappa-accent': '#7aa6cc',
  },
  light: {
    // Base colors
    '--kappa-bg': '#ffffff',
    '--kappa-panel': '#f3f4f6',
    '--kappa-input-bg': '#ffffff',
    '--kappa-border': '#e5e7eb',
    '--kappa-text': '#111827',
    '--kappa-muted': '#6b7280',
    '--kappa-accent': '#3b82f6',
    '--kappa-primary': '#2563eb',
    '--kappa-modal-bg': 'rgba(0, 0, 0, 0.5)',
    
    // Component specific
    '--kappa-chip-bg': '#f9fafb',
    '--kappa-chip-border': '#d1d5db',
    '--kappa-token-button-bg': '#f9fafb',
    '--kappa-token-button-border': '#d1d5db',
    '--kappa-token-button-hover-bg': '#eff6ff',
    '--kappa-token-button-hover-border': '#3b82f6',
    '--kappa-token-list-hover': '#f3f4f6',
    
    // Quick select buttons
    '--kappa-quick-bg': '#f9fafb',
    '--kappa-quick-border': '#d1d5db',
    '--kappa-quick-text': '#3b82f6',
    '--kappa-quick-hover-bg': '#eff6ff',
    '--kappa-quick-hover-border': '#3b82f6',
    '--kappa-quick-max-text': '#ef4444',
    '--kappa-quick-max-hover-bg': '#fee2e2',
    '--kappa-quick-max-hover-border': '#ef4444',
    
    // Shadows
    '--kappa-shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '--kappa-shadow-primary': '0 4px 12px rgba(59, 130, 246, 0.15)',
  },
  neon: {
    // Base colors
    '--kappa-bg': '#0a0a0f',
    '--kappa-panel': '#1a0a2e',
    '--kappa-input-bg': '#0f0520',
    '--kappa-border': '#ff00ff',
    '--kappa-text': '#00ffff',
    '--kappa-muted': '#ff00ff',
    '--kappa-accent': '#00ff00',
    '--kappa-primary': '#ff00ff',
    '--kappa-modal-bg': 'rgba(10, 10, 15, 0.95)',
    
    // Component specific
    '--kappa-chip-bg': 'rgba(255, 0, 255, 0.1)',
    '--kappa-chip-border': '#ff00ff',
    '--kappa-token-button-bg': 'rgba(255, 0, 255, 0.1)',
    '--kappa-token-button-border': '#ff00ff',
    '--kappa-token-button-hover-bg': 'rgba(255, 0, 255, 0.2)',
    '--kappa-token-button-hover-border': '#00ffff',
    '--kappa-token-list-hover': 'rgba(255, 0, 255, 0.1)',
    
    // Quick select buttons
    '--kappa-quick-bg': 'rgba(0, 255, 255, 0.1)',
    '--kappa-quick-border': '#00ffff',
    '--kappa-quick-text': '#00ffff',
    '--kappa-quick-hover-bg': 'rgba(0, 255, 255, 0.2)',
    '--kappa-quick-hover-border': '#00ff00',
    '--kappa-quick-max-text': '#ff00ff',
    '--kappa-quick-max-hover-bg': 'rgba(255, 0, 255, 0.2)',
    '--kappa-quick-max-hover-border': '#ff00ff',
    
    // Shadows
    '--kappa-shadow-lg': '0 0 40px rgba(255, 0, 255, 0.5)',
    '--kappa-shadow-primary': '0 0 20px rgba(255, 0, 255, 0.8)',
  },
  ocean: {
    // Base colors
    '--kappa-bg': '#001f3f',
    '--kappa-panel': '#003366',
    '--kappa-input-bg': '#002244',
    '--kappa-border': '#0074d9',
    '--kappa-text': '#7fdbff',
    '--kappa-muted': '#39cccc',
    '--kappa-accent': '#01ff70',
    '--kappa-primary': '#0074d9',
    '--kappa-modal-bg': 'rgba(0, 31, 63, 0.95)',
    
    // Component specific
    '--kappa-chip-bg': 'rgba(0, 116, 217, 0.2)',
    '--kappa-chip-border': '#0074d9',
    '--kappa-token-button-bg': 'rgba(0, 116, 217, 0.2)',
    '--kappa-token-button-border': '#0074d9',
    '--kappa-token-button-hover-bg': 'rgba(0, 116, 217, 0.3)',
    '--kappa-token-button-hover-border': '#01ff70',
    '--kappa-token-list-hover': 'rgba(0, 116, 217, 0.2)',
    
    // Quick select buttons
    '--kappa-quick-bg': 'rgba(1, 255, 112, 0.1)',
    '--kappa-quick-border': '#01ff70',
    '--kappa-quick-text': '#01ff70',
    '--kappa-quick-hover-bg': 'rgba(1, 255, 112, 0.2)',
    '--kappa-quick-hover-border': '#7fdbff',
    '--kappa-quick-max-text': '#ff851b',
    '--kappa-quick-max-hover-bg': 'rgba(255, 133, 27, 0.2)',
    '--kappa-quick-max-hover-border': '#ff851b',
    
    // Shadows
    '--kappa-shadow-lg': '0 10px 40px rgba(0, 116, 217, 0.3)',
    '--kappa-shadow-primary': '0 4px 20px rgba(0, 116, 217, 0.5)',
  },
};

export default function ThemedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgb(23, 23, 23)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Spacer div where title was */}
        <div style={{ height: '80px' }} />
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '30px',
          padding: '0 20px',
        }}>
          {/* Dark Theme (Default) */}
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '20px',
              marginBottom: '15px',
              textAlign: 'center',
            }}>
              Dark Theme (Default)
            </h2>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <WidgetV2Standalone 
                theme={themes.dark}
                projectName="Dark Theme"
              />
            </div>
          </div>

          {/* Light Theme */}
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '20px',
              marginBottom: '15px',
              textAlign: 'center',
            }}>
              Light Theme
            </h2>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <WidgetV2Standalone 
                theme={themes.light}
                projectName="Light Theme"
              />
            </div>
          </div>

          {/* Neon Theme */}
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '20px',
              marginBottom: '15px',
              textAlign: 'center',
            }}>
              Neon Theme
            </h2>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <WidgetV2Standalone 
                theme={themes.neon}
                projectName="Neon Theme"
              />
            </div>
          </div>

          {/* Ocean Theme */}
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '20px',
              marginBottom: '15px',
              textAlign: 'center',
            }}>
              Ocean Theme
            </h2>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <WidgetV2Standalone 
                theme={themes.ocean}
                projectName="Ocean Theme"
              />
            </div>
          </div>
        </div>

        {/* Theme Customization Guide */}
        <div style={{
          marginTop: '60px',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#e5e7eb',
          position: 'relative',
          zIndex: 1,
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
            Theme Customization Guide
          </h2>
          <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
            The WidgetV2 supports extensive theming through CSS variables. You can customize colors, shadows, borders, and more.
          </p>
          <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
            Pass a theme object to the <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>theme</code> prop with any of the available CSS variables.
          </p>
          <p style={{ lineHeight: '1.6' }}>
            See the documentation for a complete list of available theme tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
