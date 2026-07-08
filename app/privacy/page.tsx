import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'white', fontFamily: "'Segoe UI', sans-serif" }}>
            {/* Nav */}
            <nav style={{ background: '#1a2456', padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
            </nav>

            <div style={{ maxWidth: '780px', margin: '3rem auto', padding: '0 1.5rem 4rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                        Legal
                    </div>
                    <h1 style={{ color: '#1a2456', fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Privacy Policy</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>Last updated: June 2026</p>
                </div>

                <div style={{ color: '#374151', lineHeight: 1.85, fontSize: '0.97rem' }}>

                    <p>At Sakzee Company Limited ("Sakzee", "we", "us", or "our"), we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, share, and protect your personal data when you use our website at <strong>sakzee.com</strong> or any of our services.</p>

                    <p>By using our platform, you consent to the practices described in this policy.</p>

                    <Section title="1. Information We Collect">
                        <p><strong>1.1 Information you provide directly</strong></p>
                        <ul>
                            <li><strong>Contact details</strong> — name, email address, phone number</li>
                            <li><strong>Business information</strong> — business name, address (for vendor registrations)</li>
                            <li><strong>Delivery information</strong> — pickup address, delivery address, package description</li>
                            <li><strong>Account credentials</strong> — password (stored securely, never in plain text)</li>
                            <li><strong>Payment information</strong> — processed directly by Paystack; Sakzee does not store card or Mobile Money details</li>
                        </ul>

                        <p><strong>1.2 Information collected automatically</strong></p>
                        <ul>
                            <li><strong>Location data</strong> — GPS coordinates collected from riders during active deliveries only, for the purpose of live tracking</li>
                            <li><strong>Usage data</strong> — pages visited, actions taken on the platform (used to improve our services)</li>
                            <li><strong>Device information</strong> — browser type, device type, operating system</li>
                        </ul>

                        <p><strong>1.3 Information from third parties</strong></p>
                        <ul>
                            <li><strong>Google Maps</strong> — address suggestions and distance calculations between locations</li>
                            <li><strong>Paystack</strong> — payment transaction status and reference numbers</li>
                        </ul>
                    </Section>

                    <Section title="2. How We Use Your Information">
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Process and confirm delivery bookings and payments</li>
                            <li>Assign riders and track deliveries in real time</li>
                            <li>Send you booking confirmations, delivery updates, and account notifications via email and/or WhatsApp</li>
                            <li>Manage vendor accounts, inventory, and billing</li>
                            <li>Respond to customer support requests</li>
                            <li>Improve and personalise our platform and services</li>
                            <li>Comply with legal and regulatory obligations</li>
                            <li>Detect and prevent fraud or abuse</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Share Your Information">
                        <p>We do not sell your personal data. We share your information only in the following circumstances:</p>

                        <p><strong>3.1 Service Providers</strong><br />
                            We share necessary data with trusted third-party service providers who help us operate our platform:</p>
                        <ul>
                            <li><strong>Paystack</strong> — payment processing (paystack.com/privacy)</li>
                            <li><strong>Twilio</strong> — WhatsApp Business notifications (twilio.com/legal/privacy)</li>
                            <li><strong>Resend</strong> — email delivery (resend.com/privacy)</li>
                            <li><strong>Google Maps Platform</strong> — address autocomplete and distance calculation (policies.google.com/privacy)</li>
                            <li><strong>Supabase</strong> — secure database and file storage (supabase.com/privacy)</li>
                            <li><strong>Vercel</strong> — website hosting (vercel.com/legal/privacy-policy)</li>
                        </ul>

                        <p><strong>3.2 Delivery Recipients</strong><br />
                            When you place a delivery order, the recipient's name, phone number, and delivery address are shared with the assigned rider to enable delivery.</p>

                        <p><strong>3.3 Legal Requirements</strong><br />
                            We may disclose your information where required by law, court order, or regulatory authority in Ghana.</p>

                        <p><strong>3.4 Business Transfers</strong><br />
                            In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity, subject to the same privacy protections.</p>
                    </Section>

                    <Section title="4. Location Data">
                        <p>Location data is collected from riders during active delivery jobs only. This data is used exclusively to provide live delivery tracking to clients. Location tracking stops automatically once a delivery is marked as complete. Riders are informed of this tracking when they accept delivery assignments.</p>
                    </Section>

                    <Section title="5. Data Retention">
                        <p>We retain your personal data for as long as necessary to provide our services and comply with legal obligations:</p>
                        <ul>
                            <li><strong>Booking records</strong> — retained for 2 years after the delivery date</li>
                            <li><strong>Vendor account data</strong> — retained for the duration of the account and 1 year after closure</li>
                            <li><strong>Payment records</strong> — retained for 7 years as required by Ghanaian financial regulations</li>
                            <li><strong>Proof of delivery photos</strong> — retained for 90 days after delivery</li>
                        </ul>
                    </Section>

                    <Section title="6. Data Security">
                        <p>We take data security seriously and implement appropriate technical and organisational measures to protect your information, including:</p>
                        <ul>
                            <li>HTTPS encryption on all pages of sakzee.com</li>
                            <li>Secure password hashing — passwords are never stored in plain text</li>
                            <li>Access controls limiting data access to authorised personnel only</li>
                            <li>Payment data handled entirely by Paystack's PCI-compliant infrastructure</li>
                        </ul>
                        <p>However, no method of transmission over the internet is 100% secure. We encourage you to use a strong password and keep your account credentials confidential.</p>
                    </Section>

                    <Section title="7. Cookies">
                        <p>Our website uses minimal cookies necessary for platform functionality, such as keeping you logged in. We do not use tracking cookies for advertising purposes. By using sakzee.com, you consent to the use of these functional cookies.</p>
                    </Section>

                    <Section title="8. Your Rights">
                        <p>Under applicable Ghanaian data protection law, you have the right to:</p>
                        <ul>
                            <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
                            <li><strong>Correction</strong> — request that we correct inaccurate or incomplete data</li>
                            <li><strong>Deletion</strong> — request that we delete your personal data, subject to legal retention requirements</li>
                            <li><strong>Withdraw consent</strong> — opt out of WhatsApp or email notifications at any time by updating your notification preferences in your account settings</li>
                        </ul>
                        <p>To exercise any of these rights, contact us at <strong>info@sakzee.com</strong> or call <strong>0256 089 599</strong>. We will respond within 30 days.</p>
                    </Section>

                    <Section title="9. Children's Privacy">
                        <p>Our services are not directed at children under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.</p>
                    </Section>

                    <Section title="10. Third-Party Links">
                        <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review the privacy policies of any third-party sites you visit.</p>
                    </Section>

                    <Section title="11. Changes to This Policy">
                        <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Updated policies will be published on this page with a revised date. Continued use of our services after an update constitutes acceptance of the revised policy.</p>
                    </Section>

                    <Section title="12. Contact Us">
                        <p>If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact our team:</p>
                        <ul>
                            <li><strong>Email:</strong> info@sakzee.com</li>
                            <li><strong>Phone:</strong> 0256 089 599</li>
                            <li><strong>WhatsApp:</strong> +233 25 608 9605</li>
                            <li><strong>Address:</strong> Ubuntu Court Estate, Oyarifa, Accra, Ghana</li>
                        </ul>
                    </Section>

                </div>

                {/* Footer links */}
                <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8f9ff', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>Also read our <Link href="/terms" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link></p>
                    <Link href="/" style={{ background: '#1a2456', color: 'white', padding: '0.65rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>Back to Home</Link>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ background: '#0d1530', color: 'white', padding: '1.5rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', margin: 0 }}>© 2026 Sakzee Company Limited. All rights reserved. · <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms of Service</Link> · <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</Link></p>
            </footer>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ color: '#1a2456', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '2px solid #f3f4f6' }}>{title}</h2>
            {children}
        </div>
    );
}