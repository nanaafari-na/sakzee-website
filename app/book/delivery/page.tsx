'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

declare global { interface Window { google: any; initGoogleMaps: () => void; } }

const BASE_FEE = 25;
const BASE_KM = 10;
const PER_KM = 1.5;
const WEIGHT_SURCHARGE = 10;

function calcFee(km: number, overWeight: boolean) {
    const distFee = BASE_FEE + (km > BASE_KM ? (km - BASE_KM) * PER_KM : 0);
    return Math.round(distFee + (overWeight ? WEIGHT_SURCHARGE : 0));
}

type Pref = 'whatsapp' | 'sms' | 'both';

export default function BookDeliveryPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        booker_name: '', booker_phone: '',
        notification_preference: 'both' as Pref,
        same_person: false,
        recipient_name: '', recipient_phone: '',
        paying_party: 'booker' as 'booker' | 'recipient',
        pickup_address: '', delivery_address: '',
        weight_kg: 'under' as 'under' | 'over', package_description: '',
        pickup_date: '', pickup_time: '',
    });
    const [distanceKm, setDistanceKm] = useState<number | null>(null);
    const [distanceText, setDistanceText] = useState('');
    const [calculatingDistance, setCalculatingDistance] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [reference, setReference] = useState('');
    const [mapsReady, setMapsReady] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pickupRef = useRef<HTMLInputElement>(null);
    const deliveryRef = useRef<HTMLInputElement>(null);
    const pickupAC = useRef<any>(null);
    const deliveryAC = useRef<any>(null);

    const MAPS_KEY = 'AIzaSyBAK6MKw3OJtKMQAgvToW8ZtQVklFCr1i8';

    useEffect(() => {
        window.initGoogleMaps = () => setMapsReady(true);
        if (window.google?.maps?.places) { setMapsReady(true); return; }
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&callback=initGoogleMaps`;
            s.async = true; s.defer = true; document.head.appendChild(s);
        }
    }, []);

    const attachAutocomplete = useCallback(() => {
        if (!mapsReady || !window.google?.maps?.places) return;
        if (pickupRef.current && !pickupAC.current) {
            pickupAC.current = new window.google.maps.places.Autocomplete(pickupRef.current, { componentRestrictions: { country: 'gh' }, fields: ['formatted_address'] });
            pickupAC.current.addListener('place_changed', () => {
                const p = pickupAC.current.getPlace();
                if (p?.formatted_address) setForm(prev => ({ ...prev, pickup_address: p.formatted_address }));
            });
        }
        if (deliveryRef.current && !deliveryAC.current) {
            deliveryAC.current = new window.google.maps.places.Autocomplete(deliveryRef.current, { componentRestrictions: { country: 'gh' }, fields: ['formatted_address'] });
            deliveryAC.current.addListener('place_changed', () => {
                const p = deliveryAC.current.getPlace();
                if (p?.formatted_address) setForm(prev => ({ ...prev, delivery_address: p.formatted_address }));
            });
        }
    }, [mapsReady]);

    useEffect(() => { if (step === 3) setTimeout(attachAutocomplete, 100); }, [step, mapsReady, attachAutocomplete]);
    useEffect(() => { if (mapsReady && step === 3) setTimeout(attachAutocomplete, 100); }, [mapsReady]);

    useEffect(() => {
        if (form.pickup_address && form.delivery_address && mapsReady) {
            const t = setTimeout(calculateDistance, 800);
            return () => clearTimeout(t);
        }
    }, [form.pickup_address, form.delivery_address, mapsReady]);

    async function calculateDistance() {
        if (!window.google) return;
        setCalculatingDistance(true); setDistanceKm(null);
        const service = new window.google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [form.pickup_address], destinations: [form.delivery_address],
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (res: any, status: string) => {
            if (status === 'OK' && res.rows[0]?.elements[0]?.status === 'OK') {
                const el = res.rows[0].elements[0];
                setDistanceKm(Math.ceil(el.distance.value / 1000));
                setDistanceText(el.distance.text);
            } else { setDistanceKm(20); setDistanceText('~20 km (estimated)'); }
            setCalculatingDistance(false);
        });
    }

    const overWeight = form.weight_kg === 'over';
    const km = distanceKm || 0;
    const deliveryFee = km > 0 ? calcFee(km, overWeight) : 0;
    const payingName = form.paying_party === 'recipient' ? (form.recipient_name || 'Recipient') : form.booker_name;

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        if (name === 'same_person') {
            setForm(prev => ({
                ...prev,
                same_person: checked,
                recipient_name: checked ? prev.booker_name : '',
                recipient_phone: checked ? prev.booker_phone : '',
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    }

    function nextStep() {
        setError('');
        if (step === 1 && (!form.booker_name || !form.booker_phone)) { setError('Please fill in your name and phone number.'); return; }
        if (step === 2 && !form.same_person && (!form.recipient_name || !form.recipient_phone)) { setError('Please fill in recipient details.'); return; }
        if (step === 3 && (!form.pickup_address || !form.delivery_address || !form.pickup_date || !form.pickup_time)) { setError('Please fill in all delivery details.'); return; }
        setStep(step + 1);
    }

    async function confirmBooking() {
        setLoading(true); setError('');
        try {
            const ref = `SAKDEL-${Date.now()}`;
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: ref,
                    name: form.booker_name,
                    phone: form.booker_phone,
                    recipient_name: form.same_person ? form.booker_name : form.recipient_name,
                    recipient_phone: form.same_person ? form.booker_phone : form.recipient_phone,
                    paying_party: form.paying_party,
                    same_person: form.same_person,
                    notification_preference: form.notification_preference,
                    service: 'Delivery',
                    date: form.pickup_date,
                    pickup_address: form.pickup_address,
                    delivery_address: form.delivery_address,
                    weight_kg: overWeight ? 6 : 0,
                    package_description: form.package_description,
                    pickup_time: form.pickup_time,
                    booking_type: 'delivery',
                    delivery_fee: deliveryFee,
                    distance_km: km,
                    payment_status: 'pending',
                    status: 'Received',
                }),
            });
            if (!res.ok) throw new Error('Failed to confirm booking');
            setReference(ref);
            setSuccess(true);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    }

    async function downloadReceipt() {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        const navy = [26, 36, 86] as [number, number, number];
        const orange = [249, 115, 22] as [number, number, number];
        const gray = [107, 114, 128] as [number, number, number];

        // Header background
        doc.setFillColor(...navy);
        doc.rect(0, 0, 210, 38, 'F');

        // Logo
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('sak', 15, 18);
        doc.setTextColor(...orange);
        doc.text('zee', 30, 18);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Moving Dreams, Delivering Growth', 15, 25);

        // Title
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('DELIVERY RECEIPT', 210 - 15, 18, { align: 'right' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}`, 210 - 15, 25, { align: 'right' });

        // Reference box
        doc.setFillColor(248, 249, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, 44, 180, 16, 3, 3, 'FD');
        doc.setTextColor(...gray);
        doc.setFontSize(8);
        doc.text('TRACKING REFERENCE', 105, 50, { align: 'center' });
        doc.setTextColor(...navy);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(reference, 105, 57, { align: 'center' });

        let y = 72;

        function sectionHeader(title: string) {
            doc.setFillColor(...navy);
            doc.rect(15, y - 5, 180, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 18, y);
            y += 8;
        }

        function row(label: string, value: string) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...gray);
            doc.text(label, 18, y);
            doc.setTextColor(...navy);
            doc.setFont('helvetica', 'bold');
            const lines = doc.splitTextToSize(value, 100);
            doc.text(lines, 210 - 18, y, { align: 'right' });
            doc.setDrawColor(243, 244, 246);
            doc.line(15, y + 2, 195, y + 2);
            y += 8 * lines.length;
        }

        // Sender
        sectionHeader('SENDER');
        row('Name', form.booker_name);
        row('Phone', form.booker_phone);
        y += 4;

        // Recipient
        sectionHeader('RECIPIENT');
        row('Name', form.same_person ? form.booker_name : form.recipient_name);
        row('Phone', form.same_person ? form.booker_phone : form.recipient_phone);
        row('Paying party', payingName);
        y += 4;

        // Delivery
        sectionHeader('DELIVERY DETAILS');
        row('Pickup address', form.pickup_address);
        row('Delivery address', form.delivery_address);
        row('Distance', distanceText);
        row('Pickup date', form.pickup_date);
        row('Pickup time', form.pickup_time);
        row('Package weight', overWeight ? 'Over 5kg' : 'Under 5kg');
        if (form.package_description) row('Description', form.package_description);
        row('Notifications', form.notification_preference === 'both' ? 'WhatsApp & SMS' : form.notification_preference);
        y += 4;

        // Payment
        sectionHeader('PAYMENT');
        row('Estimated fee', `GHS ${deliveryFee}`);
        row('Payment mode', 'Pay on delivery');
        row('Payment by', payingName);
        y += 4;

        // Fee box
        doc.setFillColor(255, 247, 237);
        doc.setDrawColor(...orange);
        doc.roundedRect(15, y, 180, 18, 3, 3, 'FD');
        doc.setTextColor(...gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Total Estimated Fee', 20, y + 7);
        doc.setTextColor(...orange);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`GHS ${deliveryFee}`, 190, y + 11, { align: 'right' });
        doc.setTextColor(...gray);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Payable on delivery by ${payingName}`, 20, y + 14);
        y += 26;

        // Footer
        doc.setFillColor(...navy);
        doc.rect(0, 280, 210, 17, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Sakzee Company Limited', 105, 287, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(200, 210, 230);
        doc.text('Ubuntu Court Estate, Oyarifa, Accra  •  0256 089 599  •  info@sakzee.com  •  sakzee.com', 105, 293, { align: 'center' });

        doc.save(`Sakzee-Receipt-${reference}.pdf`);
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };
    const STEPS = ['Sender', 'Recipient', 'Delivery', 'Confirm'];

    if (success) return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', maxWidth: '500px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%' }}>
                <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: '#1a2456', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>Delivery Booked! 🚚</h2>
                <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.92rem' }}>
                    Both <strong>{form.booker_name}</strong> and <strong>{form.same_person ? 'recipient (same person)' : form.recipient_name}</strong> have been notified via {form.notification_preference === 'both' ? 'WhatsApp & SMS' : form.notification_preference}.
                </p>

                {/* Reference */}
                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Tracking Reference</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2456', fontFamily: 'monospace' }}>{reference}</div>
                </div>

                {/* Fee + paying party */}
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c2410c' }}>
                    <strong>Estimated fee: GHS {deliveryFee}</strong> — payable on delivery by <strong>{payingName}</strong>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button onClick={downloadReceipt} style={{ width: '100%', background: '#1a2456', color: 'white', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Download Receipt
                    </button>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link href="/track" style={{ flex: 1, background: '#f97316', color: 'white', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', textAlign: 'center', display: 'block' }}>Track Delivery</Link>
                        <Link href="/" style={{ flex: 1, background: '#f8f9ff', color: '#1a2456', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', textAlign: 'center', display: 'block', border: '1px solid #e2e8f0' }}>Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
        @media (max-width: 640px) { .del-nav { display: none !important; } .del-ham { display: flex !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pac-container { z-index: 9999 !important; }
      `}</style>

            <nav style={{ background: '#1a2456', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                <div className="del-nav" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
                    <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
                    <Link href="/track" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Track</Link>
                </div>
                <button className="del-ham" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px', padding: '4px' }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '2px' }} />)}
                </button>
            </nav>

            {menuOpen && (
                <div style={{ background: '#1a2456', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {[['/', 'Home'], ['/pricing', 'Pricing'], ['/track', 'Track']].map(([href, label]) => (
                        <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.95rem' }}>{label}</Link>
                    ))}
                </div>
            )}

            <div style={{ maxWidth: '580px', margin: '2rem auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff3e8', color: '#f97316', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        🚚 Pay on Delivery
                    </div>
                    <h1 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.4rem' }}>Book a Delivery</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Book now · Pay when delivered · Both parties notified</p>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
                    {STEPS.map((label, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i + 1 ? '#22c55e' : step === i + 1 ? '#1a2456' : '#e2e8f0', color: step >= i + 1 ? 'white' : '#999', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                                {step > i + 1 ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: step === i + 1 ? '#1a2456' : '#999', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' as const }}>{label}</span>
                            {i < 3 && <div style={{ width: '16px', height: '2px', background: step > i + 1 ? '#22c55e' : '#e2e8f0', flexShrink: 0 }} />}
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ color: '#1a2456', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {STEPS[step - 1]} {step === 1 ? 'Details' : step === 2 ? 'Details' : step === 3 ? 'Information' : '& Confirm'}
                    </h2>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        {step === 1 ? 'Person placing this delivery order' : step === 2 ? 'Person receiving the package' : step === 3 ? 'Pickup and delivery addresses' : 'Review booking — payment on delivery'}
                    </p>

                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

                    {/* STEP 1 — SENDER */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><label style={lbl}>Full Name *</label><input style={inp} name="booker_name" value={form.booker_name} onChange={handleChange} placeholder="Sender's full name" /></div>
                            <div><label style={lbl}>Phone Number *</label><input style={inp} name="booker_phone" value={form.booker_phone} onChange={handleChange} placeholder="0XX XXX XXXX" /></div>
                            <div>
                                <label style={{ ...lbl, marginBottom: '0.65rem' }}>Notification Preference</label>
                                <p style={{ color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.65rem', marginTop: '-0.3rem' }}>Both sender and recipient will be notified via your selected channel</p>
                                <div style={{ display: 'flex', gap: '0.65rem' }}>
                                    {[{ value: 'whatsapp', icon: '💬', label: 'WhatsApp' }, { value: 'sms', icon: '📱', label: 'SMS' }, { value: 'both', icon: '🔔', label: 'Both' }].map(opt => (
                                        <label key={opt.value} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.75rem 0.5rem', border: `2px solid ${form.notification_preference === opt.value ? '#1a2456' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: form.notification_preference === opt.value ? '#f0f3ff' : 'white', textAlign: 'center' }}>
                                            <input type="radio" name="notification_preference" value={opt.value} checked={form.notification_preference === opt.value} onChange={handleChange} style={{ display: 'none' }} />
                                            <span style={{ fontSize: '1.25rem' }}>{opt.icon}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: form.notification_preference === opt.value ? '#1a2456' : '#6b7280' }}>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — RECIPIENT */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Same person checkbox */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: '#f8f9ff', borderRadius: '10px', cursor: 'pointer', border: '1.5px solid #e2e8f0' }}>
                                <input type="checkbox" name="same_person" checked={form.same_person} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#1a2456', cursor: 'pointer', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontWeight: 600, color: '#1a2456', fontSize: '0.9rem' }}>I am also the recipient</div>
                                    <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Sender and recipient are the same person</div>
                                </div>
                            </label>

                            {!form.same_person && (
                                <>
                                    <div><label style={lbl}>Recipient Name *</label><input style={inp} name="recipient_name" value={form.recipient_name} onChange={handleChange} placeholder="Who receives the package?" /></div>
                                    <div><label style={lbl}>Recipient Phone *</label><input style={inp} name="recipient_phone" value={form.recipient_phone} onChange={handleChange} placeholder="0XX XXX XXXX" /></div>
                                </>
                            )}

                            {/* Who pays */}
                            <div>
                                <label style={{ ...lbl, marginBottom: '0.65rem' }}>Who pays on delivery? *</label>
                                <div style={{ display: 'flex', gap: '0.65rem' }}>
                                    {[
                                        { value: 'booker', label: `Sender (${form.booker_name || 'You'})`, icon: '👤' },
                                        { value: 'recipient', label: `Recipient (${form.same_person ? form.booker_name || 'You' : form.recipient_name || 'Recipient'})`, icon: '📦' },
                                    ].map(opt => (
                                        <label key={opt.value} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', padding: '0.85rem 0.5rem', border: `2px solid ${form.paying_party === opt.value ? '#f97316' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: form.paying_party === opt.value ? '#fff7ed' : 'white', textAlign: 'center' }}>
                                            <input type="radio" name="paying_party" value={opt.value} checked={form.paying_party === opt.value} onChange={handleChange} style={{ display: 'none' }} />
                                            <span style={{ fontSize: '1.35rem' }}>{opt.icon}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: form.paying_party === opt.value ? '#c2410c' : '#6b7280', lineHeight: 1.3 }}>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                    A payment link will be sent to {form.paying_party === 'recipient' ? `${form.same_person ? form.booker_name || 'you' : form.recipient_name || 'the recipient'}` : `${form.booker_name || 'you'}`} upon delivery.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 — DELIVERY */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={lbl}>Pickup Address *</label>
                                <input ref={pickupRef} style={inp} name="pickup_address" value={form.pickup_address} onChange={handleChange} placeholder="Start typing pickup address..." autoComplete="off" />
                                {mapsReady && <p style={{ color: '#9ca3af', fontSize: '0.72rem', marginTop: '0.3rem' }}>💡 Google Maps suggestions enabled</p>}
                            </div>
                            <div>
                                <label style={lbl}>Delivery Address *</label>
                                <input ref={deliveryRef} style={inp} name="delivery_address" value={form.delivery_address} onChange={handleChange} placeholder="Start typing delivery address..." autoComplete="off" />
                            </div>

                            {calculatingDistance && (
                                <div style={{ background: '#f8f9ff', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '14px', height: '14px', border: '2px solid #1a2456', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    Calculating distance...
                                </div>
                            )}
                            {distanceKm && !calculatingDistance && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#15803d' }}>
                                    📍 Distance: <strong>{distanceText}</strong>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={lbl}>Pickup Date *</label><input style={inp} name="pickup_date" type="date" value={form.pickup_date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} /></div>
                                <div><label style={lbl}>Pickup Time *</label><input style={inp} name="pickup_time" type="time" value={form.pickup_time} onChange={handleChange} /></div>
                            </div>
                            <div>
                                <label style={lbl}>Package Weight</label>
                                <select style={{ ...inp, appearance: 'none' as const }} name="weight_kg" value={form.weight_kg} onChange={handleChange}>
                                    <option value="under">Under 5kg</option>
                                    <option value="over">Over 5kg (+GHS 10 surcharge)</option>
                                </select>
                            </div>
                            <div><label style={lbl}>Package Description (optional)</label><textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' as const }} name="package_description" value={form.package_description} onChange={handleChange} placeholder="e.g. 2 boxes of clothing, 1 laptop..." /></div>

                            {distanceKm && (
                                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>Estimated delivery fee</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span style={{ color: '#374151' }}>Base fee (first 10km)</span><span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {BASE_FEE}</span></div>
                                    {km > BASE_KM && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span style={{ color: '#374151' }}>Extra distance ({km - BASE_KM}km × GHS {PER_KM})</span><span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {Math.round((km - BASE_KM) * PER_KM)}</span></div>}
                                    {overWeight && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span style={{ color: '#374151' }}>Weight surcharge (over 5kg)</span><span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {WEIGHT_SURCHARGE}</span></div>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.25rem' }}><span style={{ color: '#1a2456' }}>Estimated Total</span><span style={{ color: '#f97316' }}>GHS {deliveryFee}</span></div>
                                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>Payable on delivery by <strong>{payingName}</strong></p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4 — CONFIRM */}
                    {step === 4 && (
                        <div>
                            <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Booking Summary</h3>

                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Sender</div>
                                {[['Name', form.booker_name], ['Phone', form.booker_phone]].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#666' }}>{k}</span><span style={{ color: '#1a2456', fontWeight: 500 }}>{v}</span>
                                    </div>
                                ))}

                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0.75rem 0 0.5rem' }}>Recipient</div>
                                {[
                                    ['Name', form.same_person ? form.booker_name : form.recipient_name],
                                    ['Phone', form.same_person ? form.booker_phone : form.recipient_phone],
                                    ['Paying', payingName],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#666' }}>{k}</span><span style={{ color: '#1a2456', fontWeight: 500 }}>{v}</span>
                                    </div>
                                ))}

                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0.75rem 0 0.5rem' }}>Delivery</div>
                                {([
                                    ['Pickup', form.pickup_address],
                                    ['Delivery', form.delivery_address],
                                    ['Distance', distanceText],
                                    ['Date', form.pickup_date],
                                    ['Time', form.pickup_time],
                                    ['Weight', overWeight ? 'Over 5kg' : 'Under 5kg'],
                                    ['Notifications', form.notification_preference === 'both' ? 'WhatsApp & SMS' : form.notification_preference === 'whatsapp' ? 'WhatsApp' : 'SMS'],
                                    form.package_description ? ['Package', form.package_description] : null,
                                ] as [string, string][]).filter(Boolean).map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#666', flexShrink: 0, marginRight: '1rem' }}>{k}</span>
                                        <span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}

                                {deliveryFee > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontSize: '1.1rem', fontWeight: 800 }}>
                                        <span style={{ color: '#1a2456' }}>Estimated Fee</span>
                                        <span style={{ color: '#f97316' }}>GHS {deliveryFee}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#15803d' }}>
                                💰 <strong>Pay on delivery</strong> — {payingName} will receive a payment link when delivered
                            </div>

                            <button onClick={confirmBooking} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {loading ? 'Confirming...' : 'Confirm Delivery Booking'}
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        {step > 1 && <button onClick={() => { setStep(step - 1); setError(''); }} style={{ flex: 1, padding: '0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>← Back</button>}
                        {step < 4 && <button onClick={nextStep} style={{ flex: 1, padding: '0.85rem', background: '#1a2456', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>Continue →</button>}
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1.25rem' }}>
                    Need help? Call <a href="tel:+233256089599" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>0256 089 599</a> or <a href="https://wa.me/233256089599" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>WhatsApp us</a>
                </p>
            </div>
        </div>
    );
}