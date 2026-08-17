'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

declare global { interface Window { PaystackPop: any; } }

export default function PayPage() {
    const params = useParams();
    const reference = params?.reference as string;
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paid, setPaid] = useState(false);
    const [paying, setPaying] = useState(false);
    const [cashPending, setCashPending] = useState(false);
    const [confirmingCash, setConfirmingCash] = useState(false);

    useEffect(() => {
        if (!reference) return;
        fetch(`/api/track?reference=${reference}`)
            .then(r => r.json())
            .then(data => {
                setBooking(data.booking);
                setPaid(data.booking?.payment_status === 'paid');
                setCashPending(data.booking?.payment_status === 'cash_pending');
            })
            .catch(() => setError('Booking not found'))
            .finally(() => setLoading(false));

        // Load Paystack
        if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
            const s = document.createElement('script');
            s.src = 'https://js.paystack.co/v1/inline.js'; s.async = true;
            document.body.appendChild(s);
        }
    }, [reference]);

    async function confirmCashPayment() {
        if (!booking) return;
        setConfirmingCash(true);
        try {
            await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: booking.reference,
                    status: booking.status,
                    payment_status: 'cash_pending',
                    payment_method: 'cash',
                }),
            });
            setCashPending(true);
        } catch (e) { console.error(e); }
        setConfirmingCash(false);
    }

    function payWithPaystack() {
        if (!window.PaystackPop || !booking) return;
        setPaying(true);
        const payingPhone = booking.paying_party === 'recipient' ? booking.recipient_phone : booking.phone;
        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_6acba43a4893ab00f1a9618f7e84e5a471fe16ac',
            email: `${payingPhone}@sakzee.com`,
            amount: booking.delivery_fee * 100,
            currency: 'GHS',
            ref: `PAY-${booking.reference}-${Date.now()}`,
            callback: async () => {
                await fetch('/api/admin/bookings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference: booking.reference, status: booking.status, payment_status: 'paid' }),
                });
                setPaid(true);
                setPaying(false);
            },
            onClose: () => setPaying(false),
        });
        handler.openIframe();
    }

    const payingName = booking?.paying_party === 'recipient' ? booking?.recipient_name : booking?.name;

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                <Link href={`/track`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>Track Delivery</Link>
            </nav>

            <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 1rem' }}>
                {loading && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                        <p style={{ color: '#9ca3af' }}>Loading payment details...</p>
                    </div>
                )}

                {error && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                        <p style={{ color: '#dc2626' }}>{error}</p>
                        <Link href="/" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Go to Home</Link>
                    </div>
                )}

                {!loading && !error && booking && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                        {paid ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem' }}>Payment Complete!</h2>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Thank you for choosing Sakzee. Your payment has been received.</p>
                                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                    <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Reference</div>
                                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a2456' }}>{booking.reference}</div>
                                </div>
                                <Link href="/" style={{ background: '#1a2456', color: 'white', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>Back to Home</Link>
                            </div>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                                    <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 0.4rem' }}>Delivery Payment</h2>
                                    <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>Hi {payingName}, please make payment for your delivery</p>
                                </div>

                                {/* Amount */}
                                <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.35rem' }}>Amount Due</div>
                                    <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f97316' }}>GHS {booking.delivery_fee}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.35rem', fontFamily: 'monospace' }}>{booking.reference}</div>
                                </div>

                                {/* Delivery summary */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {[
                                        ['From', booking.pickup_address],
                                        ['To', booking.delivery_address],
                                        ['Date', booking.date],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.83rem' }}>
                                            <span style={{ color: '#9ca3af' }}>{k}</span>
                                            <span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right', maxWidth: '220px', fontSize: '0.82rem' }}>{v}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment options */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <button onClick={payWithPaystack} disabled={paying} style={{ width: '100%', background: paying ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        💳 {paying ? 'Processing...' : `Pay GHS ${booking.delivery_fee} Online`}
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                        <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>or</span>
                                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                    </div>

                                    {cashPending ? (
                                        <div style={{ background: '#fff7ed', border: '2px solid #f97316', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⏳</div>
                                            <div style={{ fontWeight: 700, color: '#c2410c', fontSize: '0.9rem' }}>Awaiting Rider Confirmation</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.2rem' }}>Your cash payment has been noted. Rider will confirm receipt.</div>
                                        </div>
                                    ) : (
                                        <button onClick={confirmCashPayment} disabled={confirmingCash} style={{ width: '100%', background: confirmingCash ? '#ccc' : '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '10px', padding: '1rem', cursor: confirmingCash ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💵</div>
                                            <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem' }}>{confirmingCash ? 'Confirming...' : "I've Paid Cash to Rider"}</div>
                                            <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.2rem' }}>GHS {booking.delivery_fee} handed directly to your Sakzee rider</div>
                                        </button>
                                    )}
                                </div>

                                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.78rem', marginTop: '1.25rem' }}>
                                    Questions? Call <a href="tel:+233256089599" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>0256 089 599</a>
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}