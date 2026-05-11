import Link from 'next/link';

const services = [
    {
        icon: '🏭',
        title: 'Warehousing & Inventory Management',
        pricing: 'From GHS 5/day',
        pricingNote: 'per shelf space',
        desc: 'Secure, monitored storage with real-time inventory tracking. Never lose track of your stock again.',
        features: ['Real-time inventory dashboard', 'Barcode scanning & tracking', 'Stock alerts & reorder notifications', 'Multi-location support', 'Monthly reporting'],
        embedded: null,
        cta: 'See Storage Pricing',
        ctaLink: '/pricing#storage',
        ctaSecondary: 'Book a Consultation',
    },
    {
        icon: '📦',
        title: 'Order Fulfillment & Returns',
        pricing: 'Included',
        pricingNote: 'with warehousing',
        desc: 'From receiving orders to packed and shipped — we handle picking, packing, labeling, dispatch and returns processing.',
        features: ['Automated order processing', 'Custom packaging & branding', 'Same-day processing', 'Quality checks on every order', 'Bulk order handling'],
        embedded: null,
        cta: 'Get Started',
        ctaLink: '/vendor/register',
        ctaSecondary: 'Book a Consultation',
    },
    {
        icon: '🚚',
        title: 'Shipping & Delivery',
        pricing: 'From GHS 30',
        pricingNote: 'per delivery',
        desc: 'Nationwide last-mile delivery from Accra to every region. Fast, tracked and reliable.',
        features: ['Nationwide coverage', 'Real-time delivery tracking', 'Proof of delivery', 'Express & standard options', 'Route optimization'],
        embedded: null,
        cta: 'See Delivery Rates',
        ctaLink: '/pricing#delivery',
        ctaSecondary: 'Book a Consultation',
    },
    {
        icon: '🛒',
        title: 'E-commerce Integration',
        pricing: 'Custom quote',
        pricingNote: 'based on platform',
        desc: 'Connect your online store directly to our fulfillment system. Supports Shopify, WooCommerce and more.',
        features: ['Shopify integration', 'WooCommerce support', 'Social commerce (Instagram, Facebook)', 'Order sync in real-time', 'API access for custom stores'],
        embedded: null,
        cta: 'Get a Quote',
        ctaLink: 'tel:+233256089599',
        ctaSecondary: 'WhatsApp Us',
    },
];

export default function ServicesPage() {
    return (
        <main style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh' }}>
            <style>{`
        * { box-sizing: border-box; }
        .nav-link { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.9rem; }
        .nav-link:hover { opacity: 0.7; }
        @media (max-width: 768px) {
          .services-grid { grid-template-columns: 1fr !important; }
          .service-inner { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .svc-nav-links { display: none !important; }
          .hero-title { font-size: 2rem !important; }
        }
      `}</style>

            {/* NAV */}
            <nav style={{ background: '#1a2456', padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div className="svc-nav-links" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/about" className="nav-link">About</Link>
                    <Link href="/pricing" className="nav-link">Pricing</Link>
                    <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Book Now</Link>
                </div>
            </nav>

            {/* HERO */}
            <section style={{ background: '#1a2456', color: 'white', padding: 'clamp(3rem, 5vw, 4rem) 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <h1 className="hero-title" style={{ fontSize: '2.75rem', fontWeight: 800, margin: '0 0 1rem' }}>Our Services</h1>
                <p style={{ fontSize: '1.02rem', maxWidth: '550px', margin: '0 auto 1.5rem', opacity: 0.82, lineHeight: 1.7 }}>
                    Everything your business needs to store, fulfill and deliver — under one roof.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/pricing" style={{ background: '#f97316', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.92rem' }}>View Full Pricing →</Link>
                    <Link href="/vendor/register" style={{ background: 'transparent', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem', border: '2px solid rgba(255,255,255,0.35)' }}>Become a Vendor</Link>
                </div>
            </section>

            {/* HOW PRICING WORKS BANNER */}
            <section style={{ background: '#f97316', padding: '1.25rem 2rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.88rem', fontWeight: 600 }}>💡 How pricing works:</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>Storage is billed by space per day. Delivery is calculated by distance and weight. Exact prices shown before you confirm any order.</span>
                    <Link href="/pricing" style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'underline', whiteSpace: 'nowrap' as const }}>See pricing details →</Link>
                </div>
            </section>

            {/* SERVICES — 2x2 grid */}
            <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: '#f8f9ff' }}>
                <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                    <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {services.map((s) => (
                            <div key={s.title} style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #efefef' }}>

                                {/* Header */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ fontSize: '2.25rem', marginBottom: '0.65rem' }}>{s.icon}</div>
                                    <h2 style={{ color: '#1a2456', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <span style={{ background: s.pricing === 'Included' ? '#f0fdf4' : s.pricing === 'Custom quote' ? '#f8f9ff' : '#fff3e8', color: s.pricing === 'Included' ? '#15803d' : s.pricing === 'Custom quote' ? '#6b7280' : '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
                                            {s.pricing}
                                        </span>
                                        <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{s.pricingNote}</span>
                                    </div>
                                    <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.875rem' }}>{s.desc}</p>
                                </div>

                                {/* Features */}
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                    {s.features.map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* Embedded Returns section */}
                                {s.embedded && (
                                    <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                            <span style={{ fontSize: '1rem' }}>↩️</span>
                                            <span style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.85rem' }}>{s.embedded.title}</span>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                            {s.embedded.features.map(f => (
                                                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* CTAs */}
                                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                                    <a href={s.ctaLink} style={{ background: '#1a2456', color: 'white', padding: '0.65rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-block' }}>
                                        {s.cta}
                                    </a>
                                    {s.ctaSecondary === 'WhatsApp Us' ? (
                                        <a href="https://wa.me/233256089599?text=Hi%20Sakzee!%20I%20would%20like%20a%20quote%20for%20your%20services." target="_blank" rel="noopener noreferrer"
                                            style={{ background: '#25D366', color: 'white', padding: '0.65rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-block' }}>
                                            WhatsApp Us
                                        </a>
                                    ) : (
                                        <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '0.65rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', display: 'inline-block' }}>
                                            {s.ctaSecondary}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING CTA */}
            <section style={{ background: '#1a2456', padding: 'clamp(3rem, 5vw, 3.5rem) 2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Want to see exact prices?</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    Our pricing page shows storage rates, delivery zone fees and how every charge is calculated — no surprises.
                </p>
                <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/pricing" style={{ background: '#f97316', color: 'white', padding: '0.9rem 2.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>View Full Pricing →</Link>
                    <a href="tel:+233256089599" style={{ background: 'transparent', color: 'white', padding: '0.9rem 2.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', border: '2px solid rgba(255,255,255,0.35)' }}>📞 Call 0256 089 599</a>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ background: '#111827', color: 'white', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Ubuntu Court Estate, Oyarifa, Accra, Ghana &nbsp;|&nbsp; 0256 089 599 &nbsp;|&nbsp; info@sakzee.com</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.5rem' }}>© 2025 Sakzee Company Limited</p>
            </footer>
        </main>
    );
}