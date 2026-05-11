'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function VendorNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    function logout() {
        ['vendor_token', 'vendor_id', 'vendor_name', 'vendor_email'].forEach(k => localStorage.removeItem(k));
        router.push('/vendor/login');
    }

    const links = [
        { href: '/vendor/dashboard', label: 'Dashboard' },
        { href: '/vendor/inventory', label: 'Inventory' },
        { href: '/vendor/orders', label: 'Orders' },
        { href: '/vendor/billing', label: 'Billing' },
    ];

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <>
            <nav style={{ background: '#1a2456', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/vendor/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>

                {/* Desktop nav */}
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="vendor-desktop-nav">
                    {links.map(link => (
                        <Link key={link.href} href={link.href} style={{
                            color: isActive(link.href) ? 'white' : 'rgba(255,255,255,0.65)',
                            textDecoration: 'none',
                            fontSize: '0.88rem',
                            fontWeight: isActive(link.href) ? 700 : 400,
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            background: isActive(link.href) ? 'rgba(255,255,255,0.12)' : 'transparent',
                            transition: 'all 0.15s',
                        }}>
                            {link.label}
                        </Link>
                    ))}
                    <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }} />
                    <Link href="/vendor/orders/new" style={{ background: '#f97316', color: 'white', padding: '0.4rem 0.9rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
                        + New Order
                    </Link>
                    <button onClick={logout} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', marginLeft: '0.25rem' }}>
                        Log out
                    </button>
                </div>

                {/* Hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="vendor-hamburger"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none', flexDirection: 'column', gap: '5px' }}
                >
                    {[0, 1, 2].map(i => (
                        <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '2px' }} />
                    ))}
                </button>
            </nav>

            {/* Mobile menu */}
            {menuOpen && (
                <div style={{ background: '#1a2456', padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {links.map(link => (
                        <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
                            color: isActive(link.href) ? 'white' : 'rgba(255,255,255,0.75)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: isActive(link.href) ? 700 : 400,
                        }}>
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/vendor/orders/new" onClick={() => setMenuOpen(false)} style={{ background: '#f97316', color: 'white', padding: '0.7rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, textAlign: 'center', marginTop: '0.25rem' }}>
                        + New Order
                    </Link>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', textAlign: 'left', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                        Log out
                    </button>
                </div>
            )}

            <style>{`
        @media (max-width: 640px) {
          .vendor-desktop-nav { display: none !important; }
          .vendor-hamburger { display: flex !important; }
        }
      `}</style>
        </>
    );
}