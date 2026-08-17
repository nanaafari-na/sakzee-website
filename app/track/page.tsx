'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

declare global { interface Window { google: any; initGoogleMaps: () => void; PaystackPop: any; } }

export default function TrackPage() {
    const [reference, setReference] = useState('');
    const [booking, setBooking] = useState<any>(null);
    const [assignment, setAssignment] = useState<any>(null);
    const [rider, setRider] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mapsReady, setMapsReady] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paying, setPaying] = useState(false);
    const [paid, setPaid] = useState(false);
    const [cashPending, setCashPending] = useState(false);
    const [confirmingCash, setConfirmingCash] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const riderMarker = useRef<any>(null);
    const refreshInterval = useRef<any>(null);

    const MAPS_KEY = 'AIzaSyBAK6MKw3OJtKMQAgvToW8ZtQVklFCr1i8';

    useEffect(() => {
        window.initGoogleMaps = () => setMapsReady(true);
        if (window.google?.maps) { setMapsReady(true); }
        else if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&callback=initGoogleMaps`;
            s.async = true; document.head.appendChild(s);
        }

        // Preload Paystack
        if (!document.querySelector('script[src*="paystack"]')) {
            const ps = document.createElement('script');
            ps.src = 'https://js.paystack.co/v1/inline.js';
            ps.async = true;
            document.body.appendChild(ps);
        }

        return () => clearInterval(refreshInterval.current);
    }, []);

    async function handleTrack() {
        if (!reference.trim()) { setError('Enter a reference number.'); return; }
        setLoading(true); setError('');
        setBooking(null); setAssignment(null); setRider(null);
        try {
            const res = await fetch(`/api/track?reference=${reference.trim()}`);
            const data = await res.json();
            if (!res.ok || !data.booking) throw new Error('Booking not found');
            setBooking(data.booking);
            setAssignment(data.assignment || null);
            setRider(data.rider || null);
            setPaid(data.booking?.payment_status === 'paid');
            setCashPending(data.booking?.payment_status === 'cash_pending');
            if ((data.booking?.status === 'Delivered' || data.booking?.status === 'Failed') && data.booking?.payment_status !== 'paid' && data.booking?.payment_status !== 'cash_pending') {
                setShowPayment(true);
            }
            if (data.assignment?.status === 'picked_up') {
                refreshInterval.current = setInterval(() => refreshTracking(reference.trim()), 30000);
            }
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    }

    async function refreshTracking(ref: string) {
        try {
            const res = await fetch(`/api/track?reference=${ref}`);
            const data = await res.json();
            if (data.rider) { setRider(data.rider); updateRiderOnMap(data.rider); }
        } catch { }
    }

    useEffect(() => {
        if (mapsReady && booking && mapRef.current && !mapInstance.current) initMap();
    }, [mapsReady, booking]);

    useEffect(() => {
        if (mapsReady && rider && mapInstance.current) updateRiderOnMap(rider);
    }, [rider, mapsReady]);

    function initMap() {
        if (!mapRef.current || !window.google) return;
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 5.6037, lng: -0.1870 }, zoom: 13,
            mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
        });
        if (booking?.delivery_address) {
            new window.google.maps.Geocoder().geocode({ address: booking.delivery_address }, (results: any, status: string) => {
                if (status === 'OK' && results[0]) {
                    new window.google.maps.Marker({ position: results[0].geometry.location, map: mapInstance.current, title: 'Delivery Location', icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' });
                    mapInstance.current.setCenter(results[0].geometry.location);
                }
            });
        }
        if (rider?.current_lat) updateRiderOnMap(rider);
    }

    function updateRiderOnMap(riderData: any) {
        if (!mapInstance.current || !riderData?.current_lat) return;
        const pos = { lat: Number(riderData.current_lat), lng: Number(riderData.current_lng) };
        if (riderMarker.current) riderMarker.current.setPosition(pos);
        else riderMarker.current = new window.google.maps.Marker({ position: pos, map: mapInstance.current, title: `Rider: ${riderData.name}`, icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' });
        mapInstance.current.panTo(pos);
    }

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
            setShowPayment(false);
        } catch (e) { console.error(e); }
        setConfirmingCash(false);
    }

    function payWithPaystack() {
        if (!booking) return;
        setPaying(true);

        function doPaystack() {
            const payingPhone = booking.paying_party === 'recipient' ? booking.recipient_phone : booking.phone;
            const handler = window.PaystackPop.setup({
                key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_6acba43a4893ab00f1a9618f7e84e5a471fe16ac',
                email: booking.email || `${payingPhone}@sakzee.com`,
                amount: booking.delivery_fee * 100,
                currency: 'GHS',
                ref: `PAY-${booking.reference}-${Date.now()}`,
                callback: function (response: any) {
                    console.log('Paystack callback fired:', response);
                    fetch('/api/admin/bookings', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reference: booking.reference, status: booking.status, payment_status: 'paid' }),
                    })
                        .then(r => r.json())
                        .then(data => {
                            console.log('Payment update response:', data);
                            setPaid(true);
                            setShowPayment(false);
                            setPaying(false);
                        })
                        .catch(e => {
                            console.error('Payment update error:', e);
                            setPaying(false);
                        });
                },
                onClose: function () {
                    setPaying(false);
                },
            });
            handler.openIframe();
        }

        if (window.PaystackPop) {
            doPaystack();
        } else {
            // Wait for already-loading script
            const existing = document.querySelector('script[src*="paystack"]') as HTMLScriptElement;
            if (existing) {
                existing.addEventListener('load', doPaystack);
            } else {
                const s = document.createElement('script');
                s.src = 'https://js.paystack.co/v1/inline.js';
                s.onload = doPaystack;
                document.body.appendChild(s);
            }
        }
    }

    const STATUS_STEPS = ['Received', 'Processing', 'Packed', 'Shipped', 'Delivered'];
    const currentStep = booking ? STATUS_STEPS.indexOf(booking.status) : -1;
    const payingName = booking?.paying_party === 'recipient' ? booking?.recipient_name : booking?.name;

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>Book Delivery</Link>
            </nav>

            <div style={{ maxWidth: '640px', margin: '2.5rem auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Track Your Delivery</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>Enter your reference number to see live status</p>
                </div>

                {/* Search */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input value={reference} onChange={e => setReference(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTrack()} placeholder="e.g. SAKDEL-1234567890" style={{ flex: 1, padding: '0.85rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', color: '#1a2456' }} />
                        <button onClick={handleTrack} disabled={loading} style={{ background: loading ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>
                            {loading ? '...' : 'Track'}
                        </button>
                    </div>
                    {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.65rem' }}>{error}</p>}
                </div>

                {booking && (
                    <>
                        {/* Status progress */}
                        <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
                            <h2 style={{ color: '#1a2456', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Delivery Status</h2>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                {STATUS_STEPS.map((s, i) => (
                                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.4rem', background: i <= currentStep ? (booking.status === 'Delivered' ? '#22c55e' : '#f97316') : '#e5e7eb', color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>
                                            {i < currentStep ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: i <= currentStep ? '#1a2456' : '#9ca3af', fontWeight: i === currentStep ? 700 : 400, textAlign: 'center' }}>{s}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ position: 'relative', height: '4px', background: '#e5e7eb', borderRadius: '2px', margin: '0 14px' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '2px', background: booking.status === 'Delivered' ? '#22c55e' : '#f97316', width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%`, transition: 'width 0.5s' }} />
                            </div>
                        </div>

                        {/* Cash pending confirmation */}
                        {cashPending && !paid && (
                            <div style={{ background: '#fff7ed', border: '2px solid #f97316', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
                                <div style={{ fontWeight: 700, color: '#1a2456', marginBottom: '0.25rem' }}>⏳ Awaiting Cash Confirmation</div>
                                <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>You confirmed cash payment. Waiting for rider to confirm receipt.</div>
                            </div>
                        )}
                        {(booking.status === 'Delivered' || booking.status === 'Failed') && !paid && !cashPending && (
                            <div style={{ background: booking.status === 'Failed' ? '#fef2f2' : '#fff7ed', border: `2px solid ${booking.status === 'Failed' ? '#dc2626' : '#f97316'}`, borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#1a2456', marginBottom: '0.2rem' }}>
                                        {booking.status === 'Failed' ? '↩️ Return Fee Due' : 'Payment Due'} — {payingName}
                                    </div>
                                    <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                                        {booking.status === 'Failed'
                                            ? <>Reason: <strong>{(booking as any).failure_reason}</strong> · Return fee: <strong style={{ color: '#dc2626', fontSize: '1.05rem' }}>GHS {booking.delivery_fee}</strong></>
                                            : <>Delivery fee: <strong style={{ color: '#f97316', fontSize: '1.05rem' }}>GHS {booking.delivery_fee}</strong></>
                                        }
                                    </div>
                                </div>
                                <button onClick={() => setShowPayment(true)} style={{ background: booking.status === 'Failed' ? '#dc2626' : '#f97316', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                                    Pay Now
                                </button>
                            </div>
                        )}

                        {/* Paid */}
                        {paid && booking.status === 'Delivered' && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#15803d' }}>Payment Complete</div>
                                    <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>Thank you for choosing Sakzee!</div>
                                </div>
                            </div>
                        )}

                        {/* Rider info */}
                        {assignment?.status === 'picked_up' && rider && (
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Your Rider</div>
                                        <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '1rem' }}>{rider.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{rider.vehicle_type} {rider.license_plate ? `· ${rider.license_plate}` : ''}</div>
                                        {rider.last_location_update && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.2rem' }}>📍 Last seen: {new Date(rider.last_location_update).toLocaleTimeString()}</div>}
                                    </div>
                                    <a href={`tel:${rider.phone}`} style={{ background: '#f97316', color: 'white', padding: '0.65rem 1.1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>📞 Call</a>
                                </div>
                            </div>
                        )}

                        {/* Live map */}
                        {assignment?.status === 'picked_up' && (
                            <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
                                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.9rem' }}>🗺️ Live Tracking</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
                                        <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Live</span>
                                    </div>
                                </div>
                                <div ref={mapRef} style={{ height: '280px', background: '#f3f4f6' }} />
                                <div style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>🔵 Rider · 🔴 Delivery destination · Updates every 30s</div>
                            </div>
                        )}

                        {/* Proof of delivery */}
                        {assignment?.proof_of_delivery_url && (
                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
                                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.9rem', marginBottom: '0.75rem' }}>📸 Proof of Delivery</div>
                                <img src={assignment.proof_of_delivery_url} alt="Proof of delivery" style={{ width: '100%', borderRadius: '10px', objectFit: 'cover' as const }} />
                            </div>
                        )}

                        {/* Booking details */}
                        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                            <h3 style={{ color: '#1a2456', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem' }}>Booking Details</h3>
                            {([
                                ['Reference', booking.reference],
                                ['Sender', booking.name],
                                booking.recipient_name && booking.recipient_name !== booking.name ? ['Recipient', booking.recipient_name] : null,
                                ['Pickup', booking.pickup_address],
                                ['Delivery', booking.delivery_address],
                                ['Date', booking.date],
                                booking.pickup_time ? ['Time', booking.pickup_time] : null,
                                ['Fee', `GHS ${booking.delivery_fee}`],
                                ['Paying', payingName],
                                ['Payment', paid || booking.payment_status === 'paid' ? '✅ Paid' : '⏳ Pay on delivery'],
                            ] as [string, string][]).filter(Boolean).map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#6b7280', flexShrink: 0, marginRight: '1rem' }}>{k}</span>
                                    <span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Payment Popup */}
            {showPayment && booking && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{booking.status === 'Failed' ? '↩️' : '💰'}</div>
                            <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 0.3rem' }}>
                                {booking.status === 'Failed' ? 'Return Fee Payment' : 'Delivery Complete!'}
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>
                                {booking.status === 'Failed'
                                    ? `Hi ${payingName}, your delivery could not be completed. Please pay the return fee.`
                                    : `Hi ${payingName}, please make payment for your delivery.`}
                            </p>
                        </div>

                        <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Amount Due</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f97316' }}>GHS {booking.delivery_fee}</div>
                            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.25rem', fontFamily: 'monospace' }}>{booking.reference}</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={payWithPaystack} disabled={paying} style={{ width: '100%', background: paying ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                💳 {paying ? 'Processing...' : `Pay GHS ${booking.delivery_fee} Online`}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            </div>

                            <button onClick={confirmCashPayment} disabled={confirmingCash} style={{ width: '100%', background: confirmingCash ? '#ccc' : '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '10px', padding: '1rem', cursor: confirmingCash ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💵</div>
                                <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem' }}>{confirmingCash ? 'Confirming...' : 'I\'ve Paid Cash to Rider'}</div>
                                <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.2rem' }}>GHS {booking.delivery_fee} handed directly to rider</div>
                            </button>

                            <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', padding: '0.25rem' }}>
                                Close — I'll pay later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
    );
}