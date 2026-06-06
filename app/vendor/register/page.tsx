'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VendorRegisterPage() {
    const [form, setForm] = useState({
        business_name: '', contact_name: '', email: '',
        phone: '', address: '', password: '', confirm_password: '',
        notification_preference: 'both',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit() {
        setError('');
        if (!form.business_name || !form.contact_name || !form.email || !form.phone || !form.password) {
            setError('Please fill in all required fields.'); return;
        }
        if (form.password !== form.confirm_password) {
            setError('Passwords do not match.'); return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.'); return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/vendor/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            setSuccess(true);
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

    if (success) return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', maxWidth: '460px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%' }}>
                <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Registration Submitted!</h2>
                <p style={{ color: '#666', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                    Thank you for registering with Sakzee. Your account is <strong>pending approval</strong> — our team will review your details and notify you via your preferred channel within 24 hours.
                </p>
                <Link href="/" style={{ background: '#1a2456', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Back to Home</Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                <Link href="/vendor/login" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Already a vendor? Log in →</Link>
            </nav>

            <div style={{ maxWidth: '540px', margin: '3rem auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Become a Vendor</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>Join Sakzee and scale your business across Ghana</p>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Business Details</div>
                        </div>
                        <div><label style={lbl}>Business Name *</label><input style={inp} name="business_name" value={form.business_name} onChange={handleChange} placeholder="Your business or brand name" /></div>
                        <div><label style={lbl}>Contact Person *</label><input style={inp} name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Your full name" /></div>
                        <div><label style={lbl}>Business Address</label><input style={inp} name="address" value={form.address} onChange={handleChange} placeholder="Business address (optional)" /></div>

                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Contact & Login</div>
                        </div>
                        <div><label style={lbl}>Email Address *</label><input style={inp} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@business.com" /></div>
                        <div><label style={lbl}>Phone Number *</label><input style={inp} name="phone" value={form.phone} onChange={handleChange} placeholder="0XX XXX XXXX" /></div>
                        <div><label style={lbl}>Password *</label><input style={inp} name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimum 8 characters" /></div>
                        <div><label style={lbl}>Confirm Password *</label><input style={inp} name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} placeholder="Repeat your password" /></div>

                        {/* Notification preference */}
                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Notification Preference</div>
                        </div>
                        <div>
                            <label style={{ ...lbl, marginBottom: '0.75rem' }}>How would you like to receive notifications? *</label>
                            <div style={{ display: 'flex', gap: '0.65rem' }}>
                                {[
                                    { value: 'email', icon: '✉️', label: 'Email' },
                                    { value: 'whatsapp', icon: '💬', label: 'WhatsApp' },
                                    { value: 'both', icon: '🔔', label: 'Both (Recommended)' },
                                ].map(opt => (
                                    <label key={opt.value} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.75rem 0.5rem', border: `2px solid ${form.notification_preference === opt.value ? '#1a2456' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: form.notification_preference === opt.value ? '#f0f3ff' : 'white', textAlign: 'center' }}>
                                        <input type="radio" name="notification_preference" value={opt.value} checked={form.notification_preference === opt.value} onChange={handleChange} style={{ width: '16px', height: '16px', accentColor: '#1a2456', cursor: 'pointer' }} />
                                        <span style={{ fontSize: '1.15rem' }}>{opt.icon}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: form.notification_preference === opt.value ? '#1a2456' : '#6b7280', lineHeight: 1.3 }}>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                {form.notification_preference === 'email' && 'You will receive all notifications by email.'}
                                {form.notification_preference === 'whatsapp' && 'You will receive all notifications on WhatsApp.'}
                                {form.notification_preference === 'both' && 'You will receive notifications on both email and WhatsApp.'}
                            </p>
                        </div>

                        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '0.5rem' }}>
                            {loading ? 'Submitting...' : 'Submit Registration'}
                        </button>

                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center' }}>
                            Your account will be reviewed and approved within 24 hours.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}