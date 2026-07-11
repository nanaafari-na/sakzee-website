import Link from 'next/link';
import { ReactNode } from 'react';

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ color: '#1a2456', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #f3f4f6' }}>{title}</h2>
            {children}
        </div>
    );
}

export default function ShippingPage() {
    const p: React.CSSProperties = { margin: '0.5rem 0', color: '#374151', lineHeight: 1.85, fontSize: '0.97rem' };
    const ul: React.CSSProperties = { paddingLeft: '1.25rem', margin: '0.5rem 0' };
    const li: React.CSSProperties = { marginBottom: '0.3rem', color: '#374151', fontSize: '0.97rem', lineHeight: 1.75 };

    return (
        <div style={{ minHeight: '100vh', background: 'white', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
            </nav>

            <div style={{ maxWidth: '780px', margin: '3rem auto', padding: '0 1.5rem 4rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Legal</div>
                    <h1 style={{ color: '#1a2456', fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Shipping & Delivery Policy</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>Last updated: June 2026</p>
                </div>

                {/* Quick summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { icon: '⏱️', title: 'Same-Day Pickup', desc: 'Book before 3PM for same-day collection in Accra' },
                        { icon: '🚚', title: '1-3 Hour Delivery', desc: 'Most deliveries within Greater Accra completed same day' },
                        { icon: '💰', title: 'Pay on Delivery', desc: 'No upfront payment — pay only when your package arrives' },
                    ].map(card => (
                        <div key={card.title} style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                            <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.88rem', marginBottom: '0.3rem' }}>{card.title}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.78rem', lineHeight: 1.5 }}>{card.desc}</div>
                        </div>
                    ))}
                </div>

                <div style={{ color: '#374151', lineHeight: 1.85, fontSize: '0.97rem' }}>
                    <p style={p}>This Shipping and Delivery Policy outlines how Sakzee Company Limited handles the pickup, transit, and delivery of packages booked through our platform at <strong>sakzee.com</strong>. By placing a delivery booking with Sakzee, you agree to the terms outlined below.</p>

                    <Section title="1. Service Coverage Area">
                        <p style={p}>Sakzee currently operates delivery services within <strong>Greater Accra, Ghana</strong>, including but not limited to:</p>
                        <ul style={ul}>
                            <li style={li}>Accra Central, Osu, Labone, East Legon, Cantonments</li>
                            <li style={li}>Tema, Ashaiman, Teshie, Nungua, Labadi</li>
                            <li style={li}>Madina, Adenta, Oyarifa, Aburi Road corridor</li>
                            <li style={li}>Kasoa, Weija, Spintex, Airport Residential</li>
                            <li style={li}>Achimota, Dansoman, Mamprobi, Korle-Bu</li>
                        </ul>
                        <p style={p}>Deliveries outside Greater Accra may be available on request. Please contact us at <strong>0256 089 599</strong> to confirm availability before booking.</p>
                    </Section>

                    <Section title="2. Delivery Timeframes">
                        <p style={p}><strong>Standard Delivery (Within Greater Accra)</strong></p>
                        <ul style={ul}>
                            <li style={li}><strong>Same-day delivery</strong> — for bookings placed before <strong>3:00 PM</strong>, Monday to Saturday</li>
                            <li style={li}><strong>Next-day delivery</strong> — for bookings placed after 3:00 PM or on Sundays</li>
                            <li style={li}><strong>Estimated transit time</strong> — 1 to 3 hours from pickup, depending on traffic and distance</li>
                        </ul>

                        <p style={p}><strong>Important:</strong> Delivery timeframes are estimates and are not guaranteed. Factors such as traffic, weather conditions, access to delivery locations, and recipient availability may affect actual delivery times. Sakzee will not be held liable for delays caused by circumstances beyond our reasonable control.</p>
                    </Section>

                    <Section title="3. How to Book a Delivery">
                        <ol style={{ ...ul, listStyleType: 'decimal' as const }}>
                            <li style={li}>Visit <strong>sakzee.com/book/delivery</strong></li>
                            <li style={li}>Enter sender details (name and phone number)</li>
                            <li style={li}>Enter recipient details and specify who will pay on delivery</li>
                            <li style={li}>Enter pickup and delivery addresses using Google Maps autocomplete</li>
                            <li style={li}>Select your preferred pickup date and time</li>
                            <li style={li}>Review the estimated fee and confirm your booking</li>
                            <li style={li}>You will receive a tracking reference via WhatsApp or SMS</li>
                        </ol>
                    </Section>

                    <Section title="4. Delivery Fee Structure">
                        <p style={p}>Delivery fees are calculated automatically based on the following:</p>
                        <ul style={ul}>
                            <li style={li}><strong>Base fee:</strong> GHS 25 (covers the first 10 kilometres)</li>
                            <li style={li}><strong>Additional distance:</strong> GHS 1.50 per kilometre beyond 10km</li>
                            <li style={li}><strong>Weight surcharge:</strong> GHS 10 flat fee for packages over 5kg</li>
                        </ul>
                        <p style={p}>The estimated fee is displayed before you confirm your booking. The final fee is based on the actual route taken by our rider and may vary slightly from the estimate.</p>
                    </Section>

                    <Section title="5. Payment">
                        <p style={p}>Sakzee operates on a <strong>pay-on-delivery</strong> model for client delivery bookings. No payment is collected upfront when booking.</p>
                        <ul style={ul}>
                            <li style={li}><strong>Cash payment</strong> — paid directly to the rider at the point of delivery</li>
                            <li style={li}><strong>Online payment</strong> — via a payment link sent to the paying party upon delivery confirmation, accessible at sakzee.com/pay/[reference]</li>
                        </ul>
                        <p style={p}>Accepted payment methods include Mobile Money (MTN, Vodafone, AirtelTigo), Visa, and Mastercard.</p>
                    </Section>

                    <Section title="6. Package Requirements">
                        <p style={p}>To ensure safe and efficient delivery, all packages must:</p>
                        <ul style={ul}>
                            <li style={li}>Be properly packaged and sealed before pickup</li>
                            <li style={li}>Be clearly labelled with recipient name and delivery address where possible</li>
                            <li style={li}>Not contain any prohibited items (see our <Link href="/terms" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>)</li>
                            <li style={li}>Not exceed the weight limit declared during booking</li>
                        </ul>
                    </Section>

                    <Section title="7. Tracking Your Delivery">
                        <p style={p}>Once your booking is confirmed, both the sender and recipient receive a tracking reference number via WhatsApp and/or SMS. You can track your delivery in real time at <strong>sakzee.com/track</strong>.</p>
                        <p style={p}>The tracking page shows:</p>
                        <ul style={ul}>
                            <li style={li}>Current delivery status (Received, Processing, Packed, Shipped, Delivered)</li>
                            <li style={li}>Live rider location on a map once the package is picked up</li>
                            <li style={li}>Rider name and contact number</li>
                            <li style={li}>Proof of delivery photo after completion</li>
                        </ul>
                    </Section>

                    <Section title="8. Failed or Unsuccessful Deliveries">
                        <p style={p}>If a delivery cannot be completed due to:</p>
                        <ul style={ul}>
                            <li style={li}>Recipient being unavailable at the delivery address</li>
                            <li style={li}>Incorrect delivery address provided by the sender</li>
                            <li style={li}>Recipient refusing to accept the package</li>
                        </ul>
                        <p style={p}>The rider will contact the recipient by phone. If contact cannot be made, the package will be returned to the sender. A re-delivery fee may apply for subsequent delivery attempts.</p>
                    </Section>

                    <Section title="9. Proof of Delivery">
                        <p style={p}>Upon successful delivery, our rider captures a photographic proof of delivery. This image is available on the tracking page at <strong>sakzee.com/track</strong> using your booking reference number.</p>
                    </Section>

                    <Section title="10. Cancellations">
                        <p style={p}>Bookings may be cancelled before a rider has been assigned at no charge. To cancel a booking, contact us immediately at <strong>0256 089 599</strong> or via WhatsApp. Once a rider has been assigned and dispatched for pickup, cancellation may incur a partial fee.</p>
                    </Section>

                    <Section title="11. Liability">
                        <p style={p}>Sakzee takes reasonable care of all packages entrusted to us. However, our liability for loss or damage is limited to the delivery fee paid for the specific booking. We strongly recommend that senders take out their own insurance for high-value items.</p>
                    </Section>

                    <Section title="12. Contact Us">
                        <p style={p}>For questions about your delivery or this policy:</p>
                        <ul style={ul}>
                            <li style={li}><strong>Phone:</strong> 0256 089 599</li>
                            <li style={li}><strong>WhatsApp:</strong> +233 25 608 9599</li>
                            <li style={li}><strong>Email:</strong> info@sakzee.com</li>
                            <li style={li}><strong>Address:</strong> Ubuntu Court Estate, Oyarifa, Accra, Ghana</li>
                            <li style={li}><strong>Hours:</strong> Monday – Saturday, 7:00 AM – 8:00 PM</li>
                        </ul>
                    </Section>
                </div>

                {/* Footer links */}
                <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8f9ff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                        <Link href="/terms" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none', fontSize: '0.88rem' }}>Terms of Service</Link>
                        <Link href="/privacy" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none', fontSize: '0.88rem' }}>Privacy Policy</Link>
                    </div>
                    <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '0.65rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>Book a Delivery</Link>
                </div>
            </div>

            <footer style={{ background: '#0d1530', color: 'white', padding: '1.5rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', margin: 0 }}>
                    © 2026 Sakzee Company Limited. All rights reserved. &nbsp;·&nbsp;
                    <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms</Link>
                    &nbsp;·&nbsp;
                    <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy</Link>
                    &nbsp;·&nbsp;
                    <Link href="/shipping" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Shipping Policy</Link>
                </p>
            </footer>
        </div>
    );
}