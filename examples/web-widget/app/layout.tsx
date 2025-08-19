import '@mysten/dapp-kit/dist/index.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#0b0d12', color: '#e5e7eb' }}>
        {children}
      </body>
    </html>
  );
}


