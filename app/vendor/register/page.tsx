'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function VendorRegisterPage() {
    const [form, setForm] = useState({ email: '', password: '', confirm: '', business_name: '', contact_name: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit() {
        if (!form.email || !form.password || !form.business_name || !form.contact_name || !form.phone) {
            setError('Please fill in all required fields.'); return;
        }
        if (form.password !== form.confirm) {
            setError('Passwords do not match.'); return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.'); return;
        }
        setError('');
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
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", padding: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ width: '56px', height: '56px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Account Created!</h2>
                <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
                    Welcome to Sakzee! Check your email <strong>{form.email}</strong> to verify your account, then log in to your dashboard.
                </p>
                <Link href="/vendor/login" style={{ background: '#1a2456', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block' }}>
                    Go to Login
                </Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                <Link href="/vendor/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Already a vendor? Log in</Link>
            </nav>

            <div style={{ maxWidth: '520px', margin: '3rem auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Become a Vendor</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>Store inventory, create orders and deliver across Ghana</p>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', marginBottom: '0.25rem' }}>
                            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Business Info</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <div><label style={lbl}>Business Name *</label><input style={inp} name="business_name" value={form.business_name} onChange={handleChange} placeholder="Your business or brand name" /></div>
                                <div><label style={lbl}>Contact Name *</label><input style={inp} name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Your full name" /></div>
                                <div><label style={lbl}>Phone Number *</label><input style={inp} name="phone" value={form.phone} onChange={handleChange} placeholder="0XX XXX XXXX" /></div>
                                <div><label style={lbl}>Business Address (optional)</label><input style={inp} name="address" value={form.address} onChange={handleChange} placeholder="Your business location" /></div>
                            </div>
                        </div>

                        <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Account Details</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <div><label style={lbl}>Email Address *</label><input style={inp} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" /></div>
                                <div><label style={lbl}>Password *</label><input style={inp} name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" /></div>
                                <div><label style={lbl}>Confirm Password *</label><input style={inp} name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Repeat your password" /></div>
                            </div>
                        </div>

                        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '0.95rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                            {loading ? 'Creating account...' : 'Create Vendor Account'}
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1.25rem' }}>
                        Already have an account? <Link href="/vendor/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
