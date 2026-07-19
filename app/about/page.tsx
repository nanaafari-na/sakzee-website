import Link from 'next/link';

const WHY = [
    { icon: '✅', title: 'Reliability You Can Trust', desc: 'Consistent, on-time fulfillment every single order, every time.' },
    { icon: '🔄', title: 'Flexible Solutions', desc: 'Scale up or down as your business needs change — no long-term contracts.' },
    { icon: '🌍', title: 'Nationwide Reach', desc: 'Delivery coverage from Accra to every region across Ghana.' },
    { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden fees. You see the exact price before confirming any order.' },
    { icon: '👥', title: 'People-First Service', desc: 'Real humans available via phone and WhatsApp — not just a ticket system.' },
    { icon: '⚡', title: 'Fast Turnaround', desc: 'Same-day processing and dispatch for all Accra orders.' },
];

export default function AboutPage() {
    return (
        <main style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh' }}>
            <style>{`
        * { box-sizing: border-box; }
        .nav-link { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.9rem; }
        .nav-link:hover { opacity: 0.7; }
        @media (max-width: 640px) {
          .about-nav-links { display: none !important; }
          .about-hero h1 { font-size: 2rem !important; }
          .mission-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .about-section { padding: 3rem 1.25rem !important; }
        }
        @media (max-width: 380px) {
          .why-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

            {/* NAV */}
            <nav style={{ background: '#1a2456', padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div className="about-nav-links" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/services" className="nav-link">Services</Link>
                    <Link href="/pricing" className="nav-link">Pricing</Link>
                    <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Book Now</Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="about-hero" style={{ background: '#1a2456', padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', textAlign: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '2.75rem', fontWeight: 800, margin: '0 0 1rem' }}>About Sakzee</h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.02rem', maxWidth: '550px', margin: '0 auto', lineHeight: 1.75 }}>
                    We are more than logistics — we are partners in possibility.
                </p>
            </section>

            {/* STORY */}
            <section className="about-section" style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: 'white' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                        Our Story
                    </div>
                    <h2 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.2 }}>Born from a painful truth</h2>
                    <p style={{ color: '#374151', lineHeight: 1.85, fontSize: '1rem', marginBottom: '1.25rem' }}>
                        Sakzee was born from a simple but painful reality: success was becoming a burden for Ghanaian businesses. Growing businesses were stuck — forced to rent bigger and bigger shops just to store stock they couldn't display, or trapped without a store at all, trying to run operations from their homes and phones.
                    </p>
                    <p style={{ color: '#374151', lineHeight: 1.85, fontSize: '1rem', marginBottom: '1.25rem' }}>
                        Inventory overflowed. Deliveries failed. Dreams stalled. Our founder lived this reality — watching friends, family and fellow entrepreneurs hustle every day only to be held back by logistics chaos and rising rent.
                    </p>
                    <p style={{ color: '#374151', lineHeight: 1.85, fontSize: '1rem', marginBottom: '1.75rem' }}>
                        That's why Sakzee was created — to provide reliable warehousing, smart order fulfillment, fast delivery and a platform where businesses could grow without worrying about space, rent or lost packages.
                    </p>
                    <div style={{ background: '#1a2456', borderRadius: '14px', padding: '1.5rem 2rem', borderLeft: '4px solid #f97316' }}>
                        <p style={{ color: 'white', fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.75, margin: 0 }}>
                            "Space should never limit success, and every product deserves a path to the world."
                        </p>
                    </div>
                </div>
            </section>

            {/* MISSION & VISION */}
            <section className="about-section" style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: '#f8f9ff' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800 }}>Mission & Vision</h2>
                    </div>
                    <div className="mission-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div style={{ background: '#1a2456', borderRadius: '16px', padding: '2rem' }}>
                            <div style={{ color: '#f97316', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Our Mission</div>
                            <p style={{ color: 'white', lineHeight: 1.8, fontSize: '0.97rem' }}>
                                To empower businesses to grow freely — by providing reliable, flexible and technology-driven fulfillment solutions that make space for success.
                            </p>
                        </div>
                        <div style={{ background: '#1a2456', borderRadius: '16px', padding: '2rem' }}>
                            <div style={{ color: '#f97316', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Our Vision</div>
                            <p style={{ color: 'white', lineHeight: 1.8, fontSize: '0.97rem' }}>
                                To be Ghana's leading fulfillment and logistics partner — enabling businesses of all sizes to thrive, scale and connect to the world.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY SAKZEE — 2x3 grid */}
            <section className="about-section" style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: 'white' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                        Why Choose Us
                    </div>
                    <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>What sets Sakzee apart</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem', marginBottom: '2.5rem' }}>More than logistics — a growth partner for your business</p>
                    <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                        {WHY.map(item => (
                            <div key={item.title} style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.4rem', border: '1px solid #efefef', textAlign: 'left' }}>
                                <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.9rem', marginBottom: '0.35rem' }}>{item.title}</div>
                                <div style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.6 }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="about-section" style={{ background: '#f97316', padding: 'clamp(3rem, 5vw, 4rem) 2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'white', fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.85rem' }}>Ready to move forward?</h2>
                <p style={{ color: 'rgba(255,255,255,0.88)', marginBottom: '2rem', fontSize: '0.97rem', maxWidth: '420px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    Join businesses across Ghana who trust Sakzee to store, fulfill and deliver.
                </p>
                <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/vendor/register" style={{ background: 'white', color: '#f97316', padding: '0.9rem 2.25rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 800, fontSize: '0.97rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        Become a Vendor
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                    <a href="tel:+233256089599" style={{ background: 'transparent', color: 'white', padding: '0.9rem 2.25rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '0.97rem', border: '2px solid rgba(255,255,255,0.5)' }}>
                        📞 Call 0256 089 599
                    </a>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ background: '#0d1530', color: 'white', padding: '2.5rem 2rem 2rem' }}>
                <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '1.75rem' }}>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>sak<span style={{ color: '#f97316' }}>zee</span></div>
                            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', maxWidth: '200px', lineHeight: 1.65, margin: 0 }}>Moving Dreams, Delivering Growth.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.7rem' }}>Pages</div>
                                {[['/', 'Home'], ['/services', 'Services'], ['/pricing', 'Pricing'], ['/book', 'Book Now'], ['/vendor/register', 'Become a Vendor']].map(([href, label]) => (
                                    <div key={href} style={{ marginBottom: '0.42rem' }}>
                                        <Link href={href} style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.83rem' }}>{label}</Link>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.7rem' }}>Contact</div>
                                {[{ href: 'tel:+233256089599', label: '0256 089 599' }, { href: 'tel:+233256089598', label: '0256 089 598' }, { href: 'mailto:info@sakzee.com', label: 'info@sakzee.com' }].map(c => (
                                    <div key={c.href} style={{ marginBottom: '0.42rem' }}>
                                        <a href={c.href} style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.83rem' }}>{c.label}</a>
                                    </div>
                                ))}
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', marginTop: '0.2rem' }}>Ubuntu Court Estate, Oyarifa, Accra</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.2rem' }}>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem', margin: 0 }}>© 2025 Sakzee Company Limited. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}