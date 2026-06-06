'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

declare global { interface Window { google: any; initGoogleMaps: () => void; } }

export default function TrackPage() {
    const [reference, setReference] = useState('');
    const [booking, setBooking] = useState<any>(null);
    const [assignment, setAssignment] = useState<any>(null);
    const [rider, setRider] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mapsReady, setMapsReady] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const riderMarker = useRef<any>(null);
    const refreshInterval = useRef<any>(null);

    const MAPS_KEY = 'AIzaSyBAK6MKw3OJtKMQAgvToW8ZtQVklFCr1i8';

    useEffect(() => {
        window.initGoogleMaps = () => setMapsReady(true);
        if (window.google?.maps) { setMapsReady(true); return; }
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&callback=initGoogleMaps`;
            s.async = true;
            document.head.appendChild(s);
        }
        return () => clearInterval(refreshInterval.current);
    }, []);

    async function handleTrack() {
        if (!reference.trim()) { setError('Enter a reference number.'); return; }
        setLoading(true);
        setError('');
        setBooking(null);
        setAssignment(null);
        setRider(null);
        try {
            const res = await fetch(`/api/track?reference=${reference.trim()}`);
            const data = await res.json();
            if (!res.ok || !data) throw new Error('Booking not found');
            setBooking(data.booking);
            setAssignment(data.assignment || null);
            setRider(data.rider || null);

            // Start polling for rider location every 30s if in transit
            if (data.assignment?.status === 'picked_up') {
                refreshInterval.current = setInterval(() => refreshRiderLocation(reference.trim()), 30000);
            }
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    }

    async function refreshRiderLocation(ref: string) {
        try {
            const res = await fetch(`/api/track?reference=${ref}`);
            const data = await res.json();
            if (data.rider) {
                setRider(data.rider);
                updateRiderOnMap(data.rider);
            }
        } catch { }
    }

    useEffect(() => {
        if (mapsReady && booking && mapRef.current && !mapInstance.current) {
            initMap();
        }
    }, [mapsReady, booking]);

    useEffect(() => {
        if (mapsReady && rider && mapInstance.current) {
            updateRiderOnMap(rider);
        }
    }, [rider, mapsReady]);

    function initMap() {
        if (!mapRef.current || !window.google) return;
        const center = { lat: 5.6037, lng: -0.1870 }; // Accra default
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        // Add delivery marker
        if (booking?.delivery_address) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: booking.delivery_address }, (results: any, status: string) => {
                if (status === 'OK' && results[0]) {
                    new window.google.maps.Marker({
                        position: results[0].geometry.location,
                        map: mapInstance.current,
                        title: 'Delivery Location',
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                        },
                    });
                    mapInstance.current.setCenter(results[0].geometry.location);
                }
            });
        }

        if (rider?.current_lat && rider?.current_lng) {
            updateRiderOnMap(rider);
        }
    }

    function updateRiderOnMap(riderData: any) {
        if (!mapInstance.current || !riderData?.current_lat) return;
        const pos = { lat: Number(riderData.current_lat), lng: Number(riderData.current_lng) };

        if (riderMarker.current) {
            riderMarker.current.setPosition(pos);
        } else {
            riderMarker.current = new window.google.maps.Marker({
                position: pos,
                map: mapInstance.current,
                title: `Rider: ${riderData.name}`,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                },
            });
        }
        mapInstance.current.panTo(pos);
    }

    const STATUS_STEPS = ['Received', 'Processing', 'Packed', 'Shipped', 'Delivered'];
    const STATUS_LABELS: Record<string, string> = {
        Received: 'Order received',
        Processing: 'Being processed',
        Packed: 'Packed & ready',
        Shipped: 'Out for delivery',
        Delivered: 'Delivered!',
    };

    const currentStep = booking ? STATUS_STEPS.indexOf(booking.status) : -1;

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            {/* Nav */}
            <nav style={{ background: '#1a2456', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
                    Book Delivery
                </Link>
            </nav>

            <div style={{ maxWidth: '640px', margin: '2.5rem auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Track Your Delivery</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.92rem' }}>Enter your reference number to see your delivery status</p>
                </div>

                {/* Search */}
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTrack()}
                            placeholder="e.g. SAKDEL-1234567890"
                            style={{ flex: 1, padding: '0.85rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit', color: '#1a2456' }}
                        />
                        <button
                            onClick={handleTrack}
                            disabled={loading}
                            style={{ background: loading ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}
                        >
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
                                        <div style={{ fontSize: '0.6rem', color: i <= currentStep ? '#1a2456' : '#9ca3af', fontWeight: i === currentStep ? 700 : 400, textAlign: 'center', lineHeight: 1.3 }}>{s}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ position: 'relative', height: '4px', background: '#e5e7eb', borderRadius: '2px', margin: '0 14px' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '2px', background: booking.status === 'Delivered' ? '#22c55e' : '#f97316', width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%`, transition: 'width 0.5s' }} />
                            </div>
                            <p style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', marginTop: '1rem' }}>
                                {STATUS_LABELS[booking.status] || booking.status}
                            </p>
                        </div>

                        {/* Rider info if in transit */}
                        {assignment?.status === 'picked_up' && rider && (
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Your Rider</div>
                                        <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '1rem' }}>{rider.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.15rem' }}>
                                            {rider.vehicle_type} · {rider.license_plate}
                                        </div>
                                        {rider.last_location_update && (
                                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                                                📍 Last seen: {new Date(rider.last_location_update).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                    <a href={`tel:${rider.phone}`} style={{ background: '#f97316', color: 'white', padding: '0.65rem 1.1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                                        📞 Call
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Live map */}
                        {assignment?.status === 'picked_up' && (
                            <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
                                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.9rem' }}>🗺️ Live Tracking</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                        <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Live</span>
                                    </div>
                                </div>
                                <div ref={mapRef} style={{ height: '280px', background: '#f3f4f6' }} />
                                <div style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                                    🔵 Rider location · 🔴 Delivery address · Updates every 30 seconds
                                </div>
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
                                ['Pickup', booking.pickup_address],
                                ['Delivery', booking.delivery_address],
                                ['Date', booking.date],
                                booking.pickup_time ? ['Time', booking.pickup_time] : null,
                                ['Fee Paid', `GHS ${booking.delivery_fee}`],
                            ] as [string, string][]).filter(Boolean).map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#6b7280' }}>{k}</span>
                                    <span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right', maxWidth: '220px' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
    );
}