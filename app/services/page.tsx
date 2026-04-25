import Link from 'next/link';

const services = [
    {
        icon: '🏭',
        title: 'Warehousing & Inventory Management',
        price: 'GHS 300/mo',
        desc: 'Secure storage facilities with real-time inventory tracking. Never lose track of your stock again.',
        features: ['Real-time inventory dashboard', 'Barcode scanning & tracking', 'Stock alerts & reorder notifications', 'Multi-location support', 'Monthly reporting'],
    },
    {
        icon: '📦',
        title: 'Order Fulfillment',
        price: 'GHS 200/mo',
        desc: 'From receiving orders to packed & shipped — fully automated. We handle picking, packing, labeling, and dispatch.',
        features: ['Automated order processing', 'Custom packaging & branding', 'Same-day processing', 'Quality checks on every order', 'Bulk order handling'],
    },
    {
        icon: '🚚',
        title: 'Shipping & Delivery',
        price: 'GHS 150/mo',
        desc: 'Nationwide last-mile delivery from Accra to every region. Fast, tracked, and reliable.',
        features: ['Nationwide coverage', 'Real-time delivery tracking', 'Proof of delivery', 'Express & standard options', 'Route optimization'],
    },
    {
        icon: '↩️',
        title: 'Returns Management',
        price: 'GHS 100/mo',
        desc: 'Handle customer returns professionally. Automated return labels, inspection, restocking, and refund processing.',
        features: ['Automated return labels', 'Item inspection & assessment', 'Restocking management', 'Return analytics reporting', 'Customer communication'],
    },
    {
        icon: '🛒',
        title: 'E-commerce Integration',
        price: 'GHS 250/mo',
        desc: 'Connect your online store directly to our system. Supports Shopify, WooCommerce, Instagram shops, and more.',
        features: ['Shopify integration', 'WooCommerce support', 'Social commerce (Instagram, Facebook)', 'Order sync in real-time', 'API access for custom stores'],
    },
];

export default function ServicesPage() {
    return (
        <main style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh' }}>

            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 700 }}>
                    <span>sak</span><span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
                    <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>About</Link>
                    <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Book Now</Link>
                </div>
            </nav>

            <section style={{ background: '#1a2456', color: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.75rem', fontWeight: 800, margin: '0 0 1rem' }}>Our Services</h1>
                <p style={{ fontSize: '1.1rem', maxWidth: '550px', margin: '0 auto', opacity: 0.85 }}>
                    Everything your business needs to store, fulfill, and deliver — under one roof.
                </p>
            </section>

            <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {services.map((s) => (
                        <div key={s.title} style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                            <div>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                                <h2 style={{ color: '#1a2456', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h2>
                                <div style={{ color: '#f97316', fontWeight: 700, marginBottom: '1rem' }}>Starting at {s.price}</div>
                                <p style={{ color: '#666', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '1.25rem' }}>{s.desc}</p>
                                <Link href="/book" style={{ background: '#1a2456', color: 'white', padding: '0.65rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'inline-block' }}>
                                    Book This Service →
                                </Link>
                            </div>
                            <div>
                                <h4 style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>What&apos;s included:</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {s.features.map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                                            <span style={{ color: '#22c55e' }}>✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ background: '#1a2456', padding: '3rem 2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Not sure which service you need?</h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem' }}>Call us and we will help you find the right fit for your business.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="tel:0256089599" style={{ background: '#f97316', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
                        Call 0256089599
                    </a>
                    <Link href="/book" style={{ background: 'transparent', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, border: '2px solid rgba(255,255,255,0.4)' }}>
                        Book Online
                    </Link>
                </div>
            </section>

            <footer style={{ background: '#111827', color: 'white', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                    Ubuntu Court Estate, Oyarifa, Accra, Ghana | 0256089599 | Sakzee373@gmail.com
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.5rem' }}>2025 Sakzee Company Limited</p>
            </footer>

        </main>
    );
}
