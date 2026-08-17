'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    async function handleReset() {
        if (!password) { setError('Please enter a new password.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (password !== confirm) { setError('Passwords do not match.'); return; }

        setLoading(true); setError('');
        try {
            const res = await fetch('/api/vendor/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');
            setSuccess(true);
            setTimeout(() => router.push('/vendor/login'), 3000);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    }

    const eyeOff = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
    const eyeOn = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;

    const inp: React.CSSProperties = { width: '100%', padding: '0.85rem 2.75rem 0.85rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', color: '#1a2456' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link href="/" style={{ color: '#1a2456', textDecoration: 'none', fontSize: '1.75rem', fontWeight: 800 }}>
                        sak<span style={{ color: '#f97316' }}>zee</span>
                    </Link>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h2 style={{ color: '#1a2456', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>Password Updated!</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                            Your password has been reset successfully. Redirecting you to login...
                        </p>
                        <Link href="/vendor/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Go to Login →</Link>
                    </div>
                ) : (
                    <>
                        <h2 style={{ color: '#1a2456', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem', textAlign: 'center' }}>Set New Password</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.88rem', textAlign: 'center', marginBottom: '1.75rem' }}>
                            Choose a strong password for your Sakzee vendor account.
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={lbl}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" style={inp} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0 }}>
                                    {showPassword ? eyeOff : eyeOn}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={lbl}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReset()} placeholder="Repeat your password" style={inp} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0 }}>
                                    {showConfirm ? eyeOff : eyeOn}
                                </button>
                            </div>
                            {password && confirm && password !== confirm && (
                                <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.35rem' }}>Passwords do not match</p>
                            )}
                            {password && confirm && password === confirm && (
                                <p style={{ color: '#15803d', fontSize: '0.78rem', marginTop: '0.35rem' }}>✅ Passwords match</p>
                            )}
                        </div>

                        <button
                            onClick={handleReset}
                            disabled={loading}
                            style={{ width: '100%', background: loading ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: '1.25rem' }}
                        >
                            {loading ? 'Updating...' : 'Reset Password'}
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