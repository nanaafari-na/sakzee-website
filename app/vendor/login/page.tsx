'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VendorLoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleLogin() {
        if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/vendor/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            localStorage.setItem('vendor_token', data.token);
            localStorage.setItem('vendor_id', data.vendor.id);
            localStorage.setItem('vendor_name', data.vendor.business_name);
            localStorage.setItem('vendor_email', data.vendor.email);
            router.push('/vendor/dashboard');
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/" style={{ color: '#1a2456', textDecoration: 'none', fontSize: '1.75rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                    <h1 style={{ color: '#1a2456', fontSize: '1.4rem', fontWeight: 700, marginTop: '0.75rem', marginBottom: '0.25rem' }}>Vendor Login</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>Access your dashboard, inventory and orders</p>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Email Address</label>
                            <input style={inp} name="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password</label>
                            <input style={inp} name="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                        </div>
                        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '0.95rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '0.25rem' }}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1.25rem' }}>
                        Not a vendor yet? <Link href="/vendor/register" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
                    </p>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>← Back to Sakzee website</Link>
                </p>
            </div>
        </div>
    );
}
