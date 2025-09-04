"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const tabs = [
  { href: '/', label: 'Standalone', title: 'Standalone widget' },
  { href: '/default-token', label: 'Default Token', title: 'Default token widget' },
  { href: '/deployer', label: 'Deployer', title: 'Deployer widget' },
  { href: '/themed', label: 'Themes', title: 'Theme examples' },
];

export default function NavBar() {
  const pathname = usePathname();
  
  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 10,
    border: `1px solid ${isActive ? '#2563eb' : '#3a3a3a'}`,
    background: isActive ? '#2563eb' : 'rgb(30, 30, 30)',
    color: isActive ? '#ffffff' : '#9ca3af',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    transition: 'all 150ms ease',
    display: 'inline-block',
  });

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: '16px 20px',
    background: 'rgba(23, 23, 23, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid #3a3a3a',
    zIndex: 1000,
  };

  return (
    <nav style={containerStyle}>
      <div style={{ display: 'flex', gap: 8 }}>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            style={tabStyle(pathname === tab.href)}
            title={tab.title}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
