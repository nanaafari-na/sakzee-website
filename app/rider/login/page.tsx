'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RiderLoginPage() {
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleLogin() {
        if (!phone || !pin) { setError('Enter your phone number and PIN.'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/rider/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, pin }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid credentials');
            localStorage.setItem('rider_id', data.rider.id);
            localStorage.setItem('rider_name', data.rider.name);
            localStorage.setItem('rider_phone', data.rider.phone);
            router.push('/rider/dashboard');
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    }

    return (
        <div style={{ minHeight: '100vh', background: '#1a2456', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a2456', marginBottom: '0.25rem' }}>
                        sak<span style={{ color: '#f97316' }}>zee</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#374151' }}>Rider Portal</div>
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Sign in to manage your deliveries</div>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Phone Number</label>
                        <input
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="0XX XXX XXXX"
                            type="tel"
                            style={{ width: '100%', padding: '0.85rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>PIN</label>
                        <input
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            placeholder="Enter your PIN"
                            type="password"
                            maxLength={6}
                            style={{ width: '100%', padding: '0.85rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', letterSpacing: '0.25em' }}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ width: '100%', background: loading ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>

                <p style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center', marginTop: '1.5rem' }}>
                    Need help? Call <a href="tel:+233256089599" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>0256 089 599</a>
                </p>
            </div>
        </div>
    );
}