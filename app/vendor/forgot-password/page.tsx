'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit() {
        if (!email) { setError('Please enter your email address.'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/vendor/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');
            setSent(true);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/" style={{ color: '#1a2456', textDecoration: 'none', fontSize: '1.75rem', fontWeight: 800 }}>
                        sak<span style={{ color: '#f97316' }}>zee</span>
                    </Link>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h2 style={{ color: '#1a2456', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>Check your email</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                            If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.5rem' }}>The link expires in 1 hour.</p>
                        <Link href="/vendor/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Login</Link>
                    </div>
                ) : (
                    <>
                        <h2 style={{ color: '#1a2456', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem', textAlign: 'center' }}>Forgot your password?</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.88rem', textAlign: 'center', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="you@business.com"
                                style={{ width: '100%', padding: '0.85rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', color: '#1a2456' }}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ width: '100%', background: loading ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: '1.25rem' }}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <Link href="/vendor/login" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.88rem' }}>← Back to Login</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}