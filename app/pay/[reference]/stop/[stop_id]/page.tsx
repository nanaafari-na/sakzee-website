'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

declare global { interface Window { PaystackPop: any; } }

export default function StopPayPage() {
    const params = useParams();
    const reference = params?.reference as string;
    const stop_id = params?.stop_id as string;

    const [stop, setStop] = useState<any>(null);
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paid, setPaid] = useState(false);
    const [cashPending, setCashPending] = useState(false);
    const [paying, setPaying] = useState(false);
    const [confirmingCash, setConfirmingCash] = useState(false);

    useEffect(() => {
        if (!reference || !stop_id) return;
        fetch(`/api/bookings/stops?reference=${reference}&stop_id=${stop_id}`)
            .then(r => r.json())
            .then(data => {
                setStop(data.stop);
                setBooking(data.booking);
                setPaid(data.stop?.payment_status === 'paid');
                setCashPending(data.stop?.payment_status === 'cash_pending');
            })
            .catch(() => setError('Stop not found'))
            .finally(() => setLoading(false));

        // Load Paystack
        if (!document.querySelector('script[src*="paystack"]')) {
            const s = document.createElement('script');
            s.src = 'https://js.paystack.co/v1/inline.js';
            s.async = true;
            document.body.appendChild(s);
        }
    }, [reference, stop_id]);

    function payWithPaystack() {
        if (!window.PaystackPop || !stop || !booking) return;
        setPaying(true);
        const payingPhone = stop.paying_party === 'recipient' ? stop.contact_phone : booking.phone;

        function doPaystack() {
            const handler = window.PaystackPop.setup({
                key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_live_c2a22acfbc016b638c6a3ca4d637c814aeca4dca',
                email: booking.email || `${payingPhone}@sakzee.com`,
                amount: stop.delivery_fee * 100,
                currency: 'GHS',
                ref: `PAY-${reference}-S${stop.stop_order}-${Date.now()}`,
                callback: function (response: any) {
                    console.log('Paystack callback:', response);
                    fetch('/api/bookings/stops/pay', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ stop_id, reference, payment_status: 'paid', payment_method: 'online' }),
                    })
                        .then(r => r.json())
                        .then(() => { setPaid(true); setPaying(false); })
                        .catch(e => { console.error(e); setPaying(false); });
                },
                onClose: function () { setPaying(false); },
            });
            handler.openIframe();
        }

        if (window.PaystackPop) doPaystack();
        else {
            const existing = document.querySelector('script[src*="paystack"]') as HTMLScriptElement;
            if (existing) existing.addEventListener('load', doPaystack);
            else {
                const s = document.createElement('script');
                s.src = 'https://js.paystack.co/v1/inline.js';
                s.onload = doPaystack;
                document.body.appendChild(s);
            }
        }
    }

    async function confirmCashPayment() {
        if (!stop) return;
        setConfirmingCash(true);
        try {
            await fetch('/api/bookings/stops/pay', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stop_id, reference, payment_status: 'cash_pending', payment_method: 'cash' }),
            });
            setCashPending(true);
        } catch (e) { console.error(e); }
        setConfirmingCash(false);
    }

    const payingName = stop?.paying_party === 'recipient' ? stop?.contact_name : booking?.name;

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

                {!loading && !error && stop && booking && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                        {paid ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem' }}>Payment Complete!</h2>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Thank you! Stop {stop.stop_order} payment confirmed.</p>
                                <Link href="/" style={{ background: '#1a2456', color: 'white', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>Back to Home</Link>
                            </div>
                        ) : cashPending ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                                <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Awaiting Rider Confirmation</h2>
                                <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>You confirmed cash payment for Stop {stop.stop_order}. Waiting for rider to confirm receipt.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                                    <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 0.3rem' }}>Stop {stop.stop_order} Payment</h2>
                                    <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>Hi {payingName}, please pay for this delivery stop.</p>
                                </div>

                                {/* Amount */}
                                <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.35rem' }}>Amount Due</div>
                                    <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f97316' }}>GHS {stop.delivery_fee}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.35rem', fontFamily: 'monospace' }}>{reference} · Stop {stop.stop_order}</div>
                                </div>

                                {/* Stop details */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {[
                                        ['Recipient', stop.contact_name],
                                        ['Address', stop.address],
                                        ['Booking Ref', reference],
                                    ].map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.83rem' }}>
                                            <span style={{ color: '#9ca3af' }}>{k}</span>
                                            <span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right', maxWidth: '220px' }}>{v}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment options */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <button onClick={payWithPaystack} disabled={paying} style={{ width: '100%', background: paying ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                        💳 {paying ? 'Processing...' : `Pay GHS ${stop.delivery_fee} Online`}
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                        <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>or</span>
                                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                    </div>

                                    <button onClick={confirmCashPayment} disabled={confirmingCash} style={{ width: '100%', background: confirmingCash ? '#ccc' : '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '10px', padding: '1rem', cursor: confirmingCash ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💵</div>
                                        <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem' }}>{confirmingCash ? 'Confirming...' : "I've Paid Cash to Rider"}</div>
                                        <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.2rem' }}>GHS {stop.delivery_fee} handed directly to rider</div>
                                    </button>
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