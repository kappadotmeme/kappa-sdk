import './polyfills.js';
import '@mysten/dapp-kit/dist/index.css';
import NavBar from '../components/NavBar';
import PolyfillProvider from '../components/PolyfillProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html, body {
            background:rgb(23, 23, 23) !important;
            margin: 0;
            padding: 0;
            min-height: 100vh;
          }
        `}</style>
      </head>
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', background: 'rgb(23, 23, 23)', color: '#e5e7eb', margin: 0, minHeight: '100vh' }}>
        <PolyfillProvider>
          <NavBar />
          {children}
        </PolyfillProvider>
      </body>
    </html>
  );
}


