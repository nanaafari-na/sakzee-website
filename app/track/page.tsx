'use client';
import { useState } from 'react';
import Link from 'next/link';

const STATUS_STEPS = ['Received', 'Processing', 'Packed', 'Shipped', 'Delivered'];

const STATUS_COLORS: Record<string, string> = {
    Received: '#3b82f6',
    Processing: '#f97316',
    Packed: '#8b5cf6',
    Shipped: '#06b6d4',
    Delivered: '#22c55e',
};

type Booking = {
    reference: string;
    name: string;
    service: string;
    date: string;
    status: string;
    paid_at: string;
};

export default function TrackPage() {
    const [ref, setRef] = useState('');
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleTrack() {
        if (!ref.trim()) { setError('Please enter your reference number.'); return; }
        setLoading(true);
        setError('');
        setBooking(null);
        try {
            const res = await fetch(`/api/track?ref=${encodeURIComponent(ref.trim().toUpperCase())}`);
            const data = await res.json();
            if (!data || data.error || data.length === 0) {
                setError('No booking found with that reference. Please check and try again.');
            } else {
                setBooking(data[0] || data);
            }
        } catch {
            setError('Something went wrong. Please try again.');
        }
        setLoading(false);
    }

    const currentStep = booking ? STATUS_STEPS.indexOf(booking.status) : -1;

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
            </nav>

            <div style={{ maxWidth: '580px', margin: '3rem auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#1a2456', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Track Your Order</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Enter the reference number from your booking confirmation email</p>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Booking Reference
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            value={ref}
                            onChange={e => setRef(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTrack()}
                            placeholder="e.g. SAKZEE-1234567890"
                            style={{ flex: 1, padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', color: '#1a2456' }}
                        />
                        <button
                            onClick={handleTrack}
                            disabled={loading}
                            style={{ background: '#1a2456', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                        >
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </div>
                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginTop: '1rem' }}>{error}</div>
                    )}
                </div>

                {booking && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                        {/* Status badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Booking Reference</div>
                                <div style={{ fontWeight: 800, color: '#1a2456', fontSize: '1rem', letterSpacing: '0.03em' }}>{booking.reference}</div>
                            </div>
                            <div style={{ background: STATUS_COLORS[booking.status] || '#6b7280', color: 'white', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
                                {booking.status}
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                {STATUS_STEPS.map((s, i) => (
                                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.4rem',
                                            background: i <= currentStep ? (STATUS_COLORS[booking.status] || '#1a2456') : '#e5e7eb',
                                            color: i <= currentStep ? 'white' : '#9ca3af', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.3s',
                                        }}>
                                            {i < currentStep
                                                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                : i + 1}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: i <= currentStep ? '#1a2456' : '#9ca3af', fontWeight: i === currentStep ? 700 : 400, textAlign: 'center', lineHeight: 1.3 }}>{s}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ position: 'relative', height: '4px', background: '#e5e7eb', borderRadius: '2px', margin: '0 14px' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '2px', background: STATUS_COLORS[booking.status] || '#1a2456', width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%`, transition: 'width 0.5s ease' }} />
                            </div>
                        </div>

                        {/* Booking details */}
                        <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem' }}>
                            <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>Booking Details</h3>
                            {[
                                ['Customer', booking.name],
                                ['Service', booking.service],
                                ['Start Date', booking.date],
                                ['Booked On', new Date(booking.paid_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })],
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.38rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#6b7280' }}>{k}</span>
                                    <span style={{ color: '#1a2456', fontWeight: 500 }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        <p style={{ color: '#9ca3af', fontSize: '0.78rem', textAlign: 'center', marginTop: '1.25rem' }}>
                            Questions? Call <a href="tel:+233256089599" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>0256 089 599</a> or WhatsApp us
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
