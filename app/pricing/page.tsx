import Link from 'next/link';

const storagePlans = [
    {
        name: 'Shelf Space',
        price: 5,
        unit: 'per shelf / day',
        monthly: 150,
        color: '#1a2456',
        bg: '#f0f3ff',
        border: '#c7d2fe',
        badge: null,
        features: [
            'Small to medium sized items',
            'Real-time stock tracking',
            'Daily inventory count',
            'Low stock alerts',
            'Monthly invoice',
            'Secure climate storage',
        ],
    },
    {
        name: 'Pallet Space',
        price: 12,
        unit: 'per pallet / day',
        monthly: 360,
        color: '#f97316',
        bg: '#fff3e8',
        border: '#fed7aa',
        badge: 'Popular',
        features: [
            'Large or bulk items',
            'Real-time stock tracking',
            'Daily inventory count',
            'Low stock alerts',
            'Monthly invoice',
            'Heavy goods handling',
        ],
    },
];

const deliveryZones = [
    { zone: 'Within 10km', distance: 'e.g. Oyarifa → Madina', fee: 25, time: 'Same day' },
    { zone: '11 - 20km', distance: 'e.g. Oyarifa → Airport', fee: 40, time: 'Same day' },
    { zone: '21 - 30km', distance: 'e.g. Oyarifa → Tema', fee: 55, time: 'Same day' },
    { zone: '31 - 50km', distance: 'e.g. Oyarifa → Kasoa', fee: 81, time: 'Same day' },
    { zone: '51 - 100km', distance: 'e.g. Oyarifa → Koforidua', fee: 141, time: '1-2 days' },
    { zone: 'Over 100km', distance: 'Inter-regional', fee: null, time: 'Contact us' },
];

const included = [
    { icon: '📊', title: 'Real-time Dashboard', desc: 'Live inventory counts and order tracking' },
    { icon: '🔔', title: 'Stock Alerts', desc: 'Low stock and out of stock notifications' },
    { icon: '📱', title: 'WhatsApp Updates', desc: 'Order status sent to your phone' },
    { icon: '✉️', title: 'Email Notifications', desc: 'Confirmations and invoices by email' },
    { icon: '🔒', title: 'Secure Storage', desc: 'CCTV monitored warehouse in Oyarifa' },
    { icon: '📋', title: 'Monthly Invoices', desc: 'Clear itemised billing every month' },
];

const faqs = [
    {
        q: 'How is storage billed?',
        a: 'Storage is counted daily and billed monthly. At the end of each month you receive an invoice showing the number of shelf or pallet days used, and you pay through your vendor dashboard via Mobile Money or card.',
    },
    {
        q: 'When does billing start for storage?',
        a: 'Billing starts from the day Sakzee warehouse staff confirm receipt of your goods (check-in confirmation). You are not charged for days your goods are in transit to our warehouse.',
    },
    {
        q: 'How is the delivery fee calculated?',
        a: 'Delivery fees are calculated by distance: GHS 25 covers the first 10km, then GHS 1.50 per additional km. A flat GHS 10 surcharge applies for packages over 5kg. The fee is shown clearly before you confirm — no surprises. For multi-stop deliveries, one base fee covers all stops.',
    },
    {
        q: 'Is there a minimum storage period?',
        a: 'No minimum period. You can store for as little as one day. We are flexible to suit your business needs.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept MTN Mobile Money, Vodafone Cash, AirtelTigo Money, Visa and Mastercard — all processed securely through Paystack.',
    },
    {
        q: 'Can I get a custom quote?',
        a: 'Yes. For large volumes or long-term storage agreements, contact us directly for a tailored rate.',
    },
];

export default function PricingPage() {
    return (
        <main style={{ minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", background: 'white' }}>
            <style>{`
        * { box-sizing: border-box; }
        .nav-link { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.9rem; transition: opacity 0.15s; }
        .nav-link:hover { opacity: 0.6; }
        .plan-card { transition: transform 0.18s, box-shadow 0.18s; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,36,86,0.12) !important; }
        .zone-row:hover { background: #f8f9ff !important; }
        .faq-item { border-bottom: 1px solid #f3f4f6; }
        .faq-item:last-child { border-bottom: none; }
        @media (max-width: 768px) {
          .included-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .storage-grid { grid-template-columns: 1fr !important; }
          .fee-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .pricing-nav-links { display: none !important; }
          .pricing-hero h1 { font-size: 2rem !important; }
          .pricing-cta-row { flex-direction: column !important; align-items: stretch !important; }
          .pricing-cta-row a { text-align: center !important; }
        }
        @media (max-width: 400px) {
          .included-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

            {/* NAV */}
            <nav style={{ background: '#1a2456', padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </div>
                <div className="pricing-nav-links" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/services" className="nav-link">Services</Link>
                    <Link href="/about" className="nav-link">About</Link>
                    <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '7px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>
                        Book Now
                    </Link>
                </div>
            </nav>

            {/* HERO */}
            <section className="pricing-hero" style={{ background: '#1a2456', padding: 'clamp(3rem, 5vw, 4rem) 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', right: '-40px', top: '-40px', opacity: 0.055, pointerEvents: 'none' }} width="300" height="300" viewBox="0 0 300 300" fill="none">
                    <circle cx="150" cy="150" r="130" stroke="white" strokeWidth="1.5" />
                    <circle cx="150" cy="150" r="85" stroke="white" strokeWidth="1" />
                    <circle cx="150" cy="150" r="45" stroke="white" strokeWidth="0.8" />
                </svg>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '30px', padding: '0.32rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, color: '#fba366', marginBottom: '1.25rem' }}>
                        Simple & Transparent
                    </div>
                    <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.1 }}>
                        Pricing that grows<br /><span style={{ color: '#f97316' }}>with your business</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
                        No setup fees. No hidden charges. Pay only for the space you use and the deliveries you make.
                    </p>
                </div>
            </section>

            {/* STORAGE PRICING */}
            <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: '#f8f9ff' }}>
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                            Warehousing
                        </div>
                        <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.55rem' }}>Storage Pricing</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto', lineHeight: 1.65 }}>
                            Billed monthly with daily counts — so you always know exactly what you owe
                        </p>
                    </div>

                    <div className="storage-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {storagePlans.map(plan => (
                            <div key={plan.name} className="plan-card" style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: `2px solid ${plan.border}`, position: 'relative' }}>
                                {plan.badge && (
                                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#f97316', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                        {plan.badge}
                                    </div>
                                )}
                                <div style={{ background: plan.bg, borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.35rem' }}>{plan.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: plan.color, fontWeight: 600 }}>GHS</span>
                                        <span style={{ fontSize: '3rem', fontWeight: 800, color: plan.color, lineHeight: 1 }}>{plan.price}</span>
                                    </div>
                                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>{plan.unit}</div>
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'white', borderRadius: '8px', fontSize: '0.82rem', color: plan.color, fontWeight: 700 }}>
                                        ~GHS {plan.monthly} / month
                                    </div>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {plan.features.map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#374151' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/vendor/register" style={{ display: 'block', textAlign: 'center', background: plan.color, color: 'white', padding: '0.85rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '0.92rem' }}>
                                    Start Storing →
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: '#1a2456', borderRadius: '14px', padding: '1.25rem 1.5rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Need a custom storage plan?</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>For large volumes or long-term agreements, we offer tailored rates.</div>
                        </div>
                        <a href="tel:+233256089599" style={{ background: '#f97316', color: 'white', padding: '0.65rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap' as const }}>
                            Call Us
                        </a>
                    </div>
                </div>
            </section>

            {/* DELIVERY PRICING */}
            <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: 'white' }}>
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                            Delivery
                        </div>
                        <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.55rem' }}>Delivery Pricing</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
                            Pay per delivery. Fee calculated automatically based on distance and weight before you confirm.
                        </p>
                    </div>

                    {/* Fee formula */}
                    <div style={{ background: '#f8f9ff', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '1rem' }}>How fees are calculated</div>
                        <div className="fee-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {[
                                { label: 'Base fee', value: 'GHS 20', desc: 'Every delivery', icon: '📦' },
                                { label: 'Distance', value: 'GHS 2/km', desc: 'From our warehouse', icon: '📍' },
                                { label: 'Weight surcharge', value: 'GHS 3/kg', desc: 'Over 5kg only', icon: '⚖️' },
                            ].map(item => (
                                <div key={item.label} style={{ background: 'white', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{item.icon}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>{item.label}</div>
                                    <div style={{ fontWeight: 800, color: '#f97316', fontSize: '1.1rem' }}>{item.value}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.2rem' }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: '#1a2456', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                            Example: Accra Central (5km), 3kg package = GHS 20 + (5 × GHS 2) = <strong style={{ color: '#f97316' }}>GHS 30</strong>
                        </div>
                    </div>

                    {/* Zone table */}
                    <p style={{ color: '#9ca3af', fontSize: '0.78rem', textAlign: 'center', marginBottom: '0.5rem' }}>← Scroll to see full table on mobile →</p>
                    <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '520px' }}>
                            <thead>
                                <tr style={{ background: '#1a2456' }}>
                                    {['Distance Range', 'Example Route', 'Estimated Fee (under 5kg)', 'Delivery Time'].map(h => (
                                        <th key={h} style={{ padding: '0.9rem 1.1rem', textAlign: 'left', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryZones.map((zone, i) => (
                                    <tr key={zone.zone} className="zone-row" style={{ borderBottom: i < deliveryZones.length - 1 ? '1px solid #f3f4f6' : 'none', background: 'white', transition: 'background 0.15s' }}>
                                        <td style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: '#1a2456' }}>{zone.zone}</td>
                                        <td style={{ padding: '0.9rem 1.1rem', color: '#6b7280' }}>{zone.distance}</td>
                                        <td style={{ padding: '0.9rem 1.1rem', fontWeight: 700, color: zone.fee ? '#f97316' : '#9ca3af' }}>
                                            {zone.fee ? `GHS ${zone.fee}` : 'Contact us'}
                                        </td>
                                        <td style={{ padding: '0.9rem 1.1rem' }}>
                                            <span style={{ background: zone.time === 'Same day' ? '#f0fdf4' : '#f8f9ff', color: zone.time === 'Same day' ? '#15803d' : '#374151', padding: '0.22rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {zone.time}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Fee formula */}
                    <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem 1.5rem', marginTop: '1rem', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: 700, color: '#1a2456', marginBottom: '0.75rem', fontSize: '0.9rem' }}>📐 How fees are calculated</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {[
                                { label: 'Base fee', value: 'GHS 25', note: 'Covers first 10km' },
                                { label: 'Extra distance', value: 'GHS 1.50/km', note: 'Per km beyond 10km' },
                                { label: 'Heavy package', value: '+ GHS 10', note: 'Flat fee for over 5kg' },
                            ].map(item => (
                                <div key={item.label} style={{ background: 'white', borderRadius: '8px', padding: '0.85rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{item.label}</div>
                                    <div style={{ fontWeight: 800, color: '#f97316', fontSize: '1rem' }}>{item.value}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.2rem' }}>{item.note}</div>
                                </div>
                            ))}
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.75rem', marginBottom: 0 }}>
                            For multi-stop deliveries, one base fee covers all stops — only distance varies. Payment is collected on delivery — no upfront payment required.
                        </p>
                    </div>
                </div>
            </section>

            {/* NO HIDDEN FEES — 2x3 grid */}
            <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: '#f8f9ff' }}>
                <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                        Always Included
                    </div>
                    <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.55rem' }}>No hidden fees — ever</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem', marginBottom: '2.5rem', lineHeight: 1.65 }}>
                        Everything below is included in your storage or delivery fee at no extra cost
                    </p>
                    <div className="included-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {included.map(item => (
                            <div key={item.title} style={{ background: 'white', borderRadius: '12px', padding: '1.4rem', border: '1px solid #efefef', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'left' }}>
                                <div style={{ fontSize: '1.75rem', marginBottom: '0.6rem' }}>{item.icon}</div>
                                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{item.title}</div>
                                <div style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.55 }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: 'white' }}>
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.55rem' }}>Frequently Asked Questions</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>Everything you need to know about pricing</p>
                    </div>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden' }}>
                        {faqs.map((faq, i) => (
                            <div key={faq.q} className="faq-item" style={{ padding: '1.25rem 1.5rem', borderBottom: i < faqs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.92rem', marginBottom: '0.5rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                                    <span style={{ color: '#f97316', fontWeight: 800, flexShrink: 0 }}>Q.</span>
                                    {faq.q}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.7, paddingLeft: '1.4rem' }}>{faq.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 2rem', background: '#f97316', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.07, pointerEvents: 'none' }} width="220" height="220" viewBox="0 0 220 220" fill="none">
                    <circle cx="110" cy="110" r="100" stroke="white" strokeWidth="1.5" />
                    <circle cx="110" cy="110" r="65" stroke="white" strokeWidth="1" />
                </svg>
                <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0 0 0.85rem' }}>Ready to get started?</h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.97rem', maxWidth: '420px', margin: '0 auto 2.25rem', lineHeight: 1.65 }}>
                    Register as a vendor and start storing and delivering across Ghana today.
                </p>
                <div className="pricing-cta-row" style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                                {[['/', 'Home'], ['/services', 'Services'], ['/about', 'About'], ['/book', 'Book Now'], ['/vendor/register', 'Become a Vendor']].map(([href, label]) => (
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
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem', margin: 0 }}>© 2025 Sakzee Company Limited. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* FLOATING WHATSAPP */}
            <a href="https://wa.me/233256089599?text=Hi%20Sakzee!%20I%20have%20a%20question%20about%20pricing." target="_blank" rel="noopener noreferrer"
                style={{ position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 999, background: '#25D366', color: 'white', borderRadius: '50px', padding: '0.8rem 1.3rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.55rem', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L.057 23.535a.75.75 0 00.908.908l5.69-1.472A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 01-4.953-1.355l-.355-.212-3.68.952.972-3.558-.232-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
                Chat with us
            </a>
        </main>
    );
}