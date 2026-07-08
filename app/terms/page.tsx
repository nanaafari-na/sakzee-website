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

export default function TermsPage() {
    const ul: React.CSSProperties = { paddingLeft: '1.25rem', margin: '0.5rem 0' };
    const li: React.CSSProperties = { marginBottom: '0.3rem' };
    const p: React.CSSProperties = { margin: '0.5rem 0' };

    return (
        <div style={{ minHeight: '100vh', background: 'white', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
            </nav>

            <div style={{ maxWidth: '780px', margin: '3rem auto', padding: '0 1.5rem 4rem' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Legal</div>
                    <h1 style={{ color: '#1a2456', fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Terms of Service</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>Last updated: June 2026</p>
                </div>

                <div style={{ color: '#374151', lineHeight: 1.85, fontSize: '0.97rem' }}>
                    <p style={p}>Welcome to Sakzee. By accessing or using our website at <strong>sakzee.com</strong> or any of our services, you agree to be bound by these Terms of Service. Please read them carefully before using our platform.</p>

                    <Section title="1. About Sakzee">
                        <p style={p}>Sakzee Company Limited ("Sakzee", "we", "us", or "our") is a logistics and fulfillment company registered in Ghana, operating from Ubuntu Court Estate, Oyarifa, Accra. We provide warehousing, order fulfillment, delivery, and e-commerce integration services to businesses and individuals across Ghana.</p>
                    </Section>

                    <Section title="2. Acceptance of Terms">
                        <p style={p}>By registering as a vendor, booking a delivery, or otherwise using any part of the Sakzee platform, you confirm that you:</p>
                        <ul style={ul}><li style={li}>Are at least 18 years of age</li><li style={li}>Have the legal capacity to enter into a binding agreement</li><li style={li}>Accept these Terms of Service in full</li><li style={li}>Agree to our Privacy Policy</li></ul>
                        <p style={p}>If you do not agree to these terms, you must not use our services.</p>
                    </Section>

                    <Section title="3. Delivery Booking">
                        <p style={p}><strong>3.1 Booking and Payment</strong><br />Delivery bookings are confirmed only upon successful payment via Paystack. Prices are calculated based on distance between pickup and delivery addresses and package weight, and are displayed clearly before payment is made.</p>
                        <p style={p}><strong>3.2 Pickup and Delivery</strong><br />Sakzee will make reasonable efforts to collect and deliver packages within the agreed timeframe. Delivery timelines are estimates and may be affected by traffic, weather, and other factors beyond our control.</p>
                        <p style={p}><strong>3.3 Package Responsibility</strong><br />You are responsible for ensuring that packages are properly packaged and that all contents are lawful. Sakzee reserves the right to refuse delivery of any package suspected to contain illegal, dangerous, or prohibited items.</p>
                        <p style={p}><strong>3.4 Prohibited Items</strong><br />The following items are prohibited:</p>
                        <ul style={ul}><li style={li}>Illegal substances or contraband</li><li style={li}>Weapons, ammunition, or explosives</li><li style={li}>Flammable, corrosive, or hazardous materials</li><li style={li}>Live animals</li><li style={li}>Any item prohibited by Ghanaian law</li></ul>
                        <p style={p}><strong>3.5 Proof of Delivery</strong><br />Our riders collect photographic proof of delivery upon completing each delivery. This photo is made available to the sender via the tracking page.</p>
                    </Section>

                    <Section title="4. Vendor Services">
                        <p style={p}><strong>4.1 Registration and Approval</strong><br />Businesses wishing to use Sakzee's warehousing and fulfillment services must register as vendors. All vendor accounts are subject to review and approval by Sakzee before access is granted.</p>
                        <p style={p}><strong>4.2 Inventory</strong><br />Vendors may store inventory at our Oyarifa warehouse. All goods are subject to physical verification upon receipt. Storage is charged on a daily basis per shelf or pallet space occupied.</p>
                        <p style={p}><strong>4.3 Vendor Obligations</strong><br />Vendors are responsible for providing accurate product information, ensuring all stored goods comply with Ghanaian law, paying storage invoices promptly, and maintaining up-to-date contact information.</p>
                        <p style={p}><strong>4.4 Suspension</strong><br />Sakzee reserves the right to suspend or terminate vendor accounts for non-payment, misuse of the platform, or any breach of these terms.</p>
                    </Section>

                    <Section title="5. Payments and Refunds">
                        <p style={p}><strong>5.1 Payment Processing</strong><br />All payments are processed securely through Paystack. We accept Mobile Money (MTN, Vodafone, AirtelTigo), Visa, and Mastercard. Sakzee does not store your card or Mobile Money details.</p>
                        <p style={p}><strong>5.2 Refunds</strong><br />Refunds may be considered when a delivery was not completed due to a Sakzee error, a package was lost or damaged while in our custody, or a booking was cancelled before pickup. Refund requests must be submitted within 48 hours by contacting info@sakzee.com or calling 0256 089 599. Approved refunds will be processed within 5–10 business days.</p>
                        <p style={p}><strong>5.3 Pricing</strong><br />Sakzee reserves the right to adjust pricing at any time. Changes will not affect bookings that have already been paid for.</p>
                    </Section>

                    <Section title="6. Tracking and Notifications">
                        <p style={p}>Sakzee provides real-time delivery tracking via sakzee.com/track. By using our services, you consent to receive delivery status notifications via email and/or WhatsApp based on your chosen notification preference. You may update your preference at any time.</p>
                    </Section>

                    <Section title="7. Limitation of Liability">
                        <p style={p}>To the maximum extent permitted by Ghanaian law, Sakzee shall not be liable for indirect or consequential damages, delays caused by circumstances beyond our control, loss or damage to improperly packaged goods, or loss of business resulting from delivery delays. Our total liability for any claim shall not exceed the amount paid for the specific service giving rise to the claim.</p>
                    </Section>

                    <Section title="8. Intellectual Property">
                        <p style={p}>All content on sakzee.com, including logos, text, graphics, and software, is the property of Sakzee Company Limited. You may not copy, reproduce, or distribute any content without our written permission.</p>
                    </Section>

                    <Section title="9. Changes to These Terms">
                        <p style={p}>We may update these Terms of Service from time to time. Changes will be published on this page with an updated date. Continued use of our services after changes are published constitutes acceptance of the revised terms.</p>
                    </Section>

                    <Section title="10. Governing Law">
                        <p style={p}>These Terms of Service are governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes shall be subject to the jurisdiction of the courts of Ghana.</p>
                    </Section>

                    <Section title="11. Contact Us">
                        <p style={p}>If you have any questions about these Terms of Service, please contact us:</p>
                        <ul style={ul}>
                            <li style={li}><strong>Email:</strong> info@sakzee.com</li>
                            <li style={li}><strong>Phone:</strong> 0256 089 599</li>
                            <li style={li}><strong>WhatsApp:</strong> +233 25 608 9605</li>
                            <li style={li}><strong>Address:</strong> Ubuntu Court Estate, Oyarifa, Accra, Ghana</li>
                        </ul>
                    </Section>
                </div>

                <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8f9ff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>Also read our <Link href="/privacy" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link></p>
                    <Link href="/" style={{ background: '#1a2456', color: 'white', padding: '0.65rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>Back to Home</Link>
                </div>
            </div>

            <footer style={{ background: '#0d1530', color: 'white', padding: '1.5rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', margin: 0 }}>
                    © 2026 Sakzee Company Limited. All rights reserved. &nbsp;·&nbsp;
                    <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms of Service</Link>
                    &nbsp;·&nbsp;
                    <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</Link>
                </p>
            </footer>
        </div>
    );
}