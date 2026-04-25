import Link from 'next/link';

const values = [
    { icon: '✅', title: 'Reliability You Can Trust', desc: 'We show up, every time. Consistent, dependable service your business can count on.' },
    { icon: '🔧', title: 'Flexible Solutions', desc: 'Whether you are a solo seller or a growing brand, we scale with you.' },
    { icon: '🌍', title: 'Nationwide Reach, Global Vision', desc: 'Delivering across Ghana today — with eyes on the world tomorrow.' },
    { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden fees. You know exactly what you are paying for.' },
    { icon: '🤝', title: 'People-First Service', desc: 'Real people behind every delivery. Your growth is our mission.' },
];

export default function AboutPage() {
    return (
        <main style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh' }}>

            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 700 }}>
                    <span>sak</span><span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
                    <Link href="/services" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Services</Link>
                    <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Book Now</Link>
                </div>
            </nav>

            <section style={{ background: '#1a2456', color: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.75rem', fontWeight: 800, margin: '0 0 1rem' }}>Our Story</h1>
                <p style={{ fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto', opacity: 0.85, lineHeight: 1.7 }}>
                    Born from a simple but painful truth: success was becoming a burden for Ghanaian businesses.
                </p>
            </section>

            <section style={{ padding: '4rem 2rem', background: 'white' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <p style={{ color: '#374151', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                        Growing businesses were stuck — forced to rent bigger and bigger shops just to store stock they could not display, or trapped without a store at all, trying to run operations from their homes and phones. Inventory overflowed. Deliveries failed. Dreams stalled.
                    </p>
                    <p style={{ color: '#374151', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                        Our founder lived this reality — watching friends, family, and fellow entrepreneurs hustle every day only to be held back by logistics chaos and rising rent. We knew there had to be a better way.
                    </p>
                    <p style={{ color: '#374151', lineHeight: 1.9, fontSize: '1.05rem' }}>
                        That is why Sakzee was created — to provide reliable warehousing, smart order fulfillment, fast delivery, and a platform where businesses could grow without worrying about space, rent, or lost packages. <strong>Because space should never limit success, and every product deserves a path to the world.</strong>
                    </p>
                </div>
            </section>

            <section style={{ padding: '3rem 2rem', background: '#f8f9ff' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ background: '#1a2456', borderRadius: '16px', padding: '2rem', color: 'white' }}>
                        <h3 style={{ color: '#f97316', fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Our Mission</h3>
                        <p style={{ lineHeight: 1.7, opacity: 0.9 }}>To empower businesses to grow freely — by providing reliable, flexible, and technology-driven fulfillment solutions that make space for success.</p>
                    </div>
                    <div style={{ background: '#1a2456', borderRadius: '16px', padding: '2rem', color: 'white' }}>
                        <h3 style={{ color: '#f97316', fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Our Vision</h3>
                        <p style={{ lineHeight: 1.7, opacity: 0.9 }}>To be Ghana&apos;s leading fulfillment and logistics partner — enabling businesses of all sizes to thrive, scale, and connect to the world.</p>
                    </div>
                </div>
            </section>

            <section style={{ padding: '4rem 2rem', background: 'white', textAlign: 'center' }}>
                <h2 style={{ color: '#1a2456', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>Why Choose Sakzee</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
                    {values.map(v => (
                        <div key={v.title} style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.75rem', textAlign: 'left' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{v.icon}</div>
                            <h3 style={{ color: '#1a2456', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{v.title}</h3>
                            <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ background: '#f97316', padding: '3rem 2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Move Forward?</h2>
                <Link href="/book" style={{ background: 'white', color: '#f97316', padding: '0.9rem 2.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', display: 'inline-block' }}>
                    Book a Service Today
                </Link>
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
