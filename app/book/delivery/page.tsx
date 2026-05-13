'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

declare global { interface Window { PaystackPop: any; } }

const REGIONS = [
    { label: 'Accra Central', base_km: 5 },
    { label: 'Greater Accra', base_km: 20 },
    { label: 'Ashanti Region', base_km: 250 },
    { label: 'Western Region', base_km: 290 },
    { label: 'Eastern Region', base_km: 110 },
    { label: 'Central Region', base_km: 150 },
    { label: 'Northern Region', base_km: 600 },
    { label: 'Other', base_km: 200 },
];

const BASE_FEE = 35;
const PER_KM = 2;
const WEIGHT_THRESHOLD = 5;
const PER_KG_OVER = 3;

function calcFee(km: number, weight: number) {
    const distFee = BASE_FEE + km * PER_KM;
    const weightFee = weight > WEIGHT_THRESHOLD ? (weight - WEIGHT_THRESHOLD) * PER_KG_OVER : 0;
    return Math.round(distFee + weightFee);
}

export default function BookDeliveryPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '', email: '', phone: '',
        pickup_address: '', delivery_address: '', region: '',
        weight_kg: '', package_description: '',
        pickup_date: '', pickup_time: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [reference, setReference] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
        if (existing) return;
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }, []);

    const selectedRegion = REGIONS.find(r => r.label === form.region);
    const km = selectedRegion?.base_km || 0;
    const weight = Number(form.weight_kg) || 0;
    const deliveryFee = form.region ? calcFee(km, weight) : 0;

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function nextStep() {
        setError('');
        if (step === 1) {
            if (!form.name || !form.email || !form.phone) { setError('Please fill in all required fields.'); return; }
        }
        if (step === 2) {
            if (!form.pickup_address || !form.delivery_address || !form.region || !form.pickup_date || !form.pickup_time) {
                setError('Please fill in all delivery details.'); return;
            }
        }
        setStep(step + 1);
    }

    function initPaystack() {
        if (!window.PaystackPop) { setError('Payment system not loaded. Please refresh and try again.'); return; }
        setLoading(true);
        const ref = `SAKDEL-${Date.now()}`;

        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_6acba43a4893ab00f1a9618f7e84e5a471fe16ac',
            email: form.email,
            amount: deliveryFee * 100,
            currency: 'GHS',
            ref,
            callback: function () { saveBooking(ref); },
            onClose: function () { setLoading(false); setError('Payment cancelled. Please try again.'); },
        });
        handler.openIframe();
    }

    async function saveBooking(ref: string) {
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: ref,
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    business: '',
                    service: 'Delivery',
                    date: form.pickup_date,
                    notes: form.package_description,
                    pickup_address: form.pickup_address,
                    delivery_address: form.delivery_address,
                    package_description: form.package_description,
                    pickup_time: form.pickup_time,
                    booking_type: 'delivery',
                    delivery_fee: deliveryFee,
                    region: form.region,
                    status: 'Received',
                    paid_at: new Date().toISOString(),
                }),
            });
            if (!res.ok) throw new Error('Failed to save booking');
            setReference(ref);
            setSuccess(true);
            setLoading(false);
        } catch (e: any) {
            setError('Payment received but booking save failed. Please call 0256 089 599 with reference: ' + ref);
            setLoading(false);
        }
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

    if (success) return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', maxWidth: '480px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%' }}>
                <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: '#1a2456', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem' }}>Delivery Booked! 🚚</h2>
                <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    Thank you <strong>{form.name}</strong>! Your delivery has been confirmed and our team will pick up from <strong>{form.pickup_address}</strong> on <strong>{form.pickup_date} at {form.pickup_time}</strong>.
                </p>
                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Tracking Reference</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2456', letterSpacing: '0.05em', fontFamily: 'monospace' }}>{reference}</div>
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c2410c' }}>
                    <strong>Amount paid: GHS {deliveryFee}</strong> — confirmation sent to {form.email}
                </div>
                <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    Questions? Call <a href="tel:+233256089599" style={{ color: '#f97316', fontWeight: 700 }}>0256 089 599</a> or <a href="https://wa.me/233256089599" style={{ color: '#25D366', fontWeight: 700 }}>WhatsApp us</a>
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/track" style={{ background: '#1a2456', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Track Delivery</Link>
                    <Link href="/" style={{ background: '#f97316', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Back to Home</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
        @media (max-width: 640px) {
          .del-desktop-nav { display: none !important; }
          .del-hamburger { display: flex !important; }
        }
      `}</style>

            {/* NAV */}
            <nav style={{ background: '#1a2456', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div className="del-desktop-nav" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
                    <Link href="/services" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Services</Link>
                    <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
                    <Link href="/track" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Track</Link>
                </div>
                <button className="del-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px', padding: '4px' }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '2px' }} />)}
                </button>
            </nav>

            {menuOpen && (
                <div style={{ background: '#1a2456', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {[['/', 'Home'], ['/services', 'Services'], ['/pricing', 'Pricing'], ['/track', 'Track']].map(([href, label]) => (
                        <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.95rem' }}>{label}</Link>
                    ))}
                </div>
            )}

            <div style={{ maxWidth: '580px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff3e8', color: '#f97316', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        🚚 Instant Delivery Booking
                    </div>
                    <h1 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.4rem' }}>Book a Delivery</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Pay now — we pick up and deliver same day within Accra</p>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {['Your Details', 'Delivery Info', 'Pay & Confirm'].map((label, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i + 1 ? '#22c55e' : step === i + 1 ? '#1a2456' : '#e2e8f0', color: step >= i + 1 ? 'white' : '#999', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                                {step > i + 1 ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: step === i + 1 ? '#1a2456' : '#999', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' as const }}>{label}</span>
                            {i < 2 && <div style={{ width: '20px', height: '2px', background: step > i + 1 ? '#22c55e' : '#e2e8f0', flexShrink: 0 }} />}
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ color: '#1a2456', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {step === 1 ? 'Your Information' : step === 2 ? 'Delivery Details' : 'Review & Pay'}
                    </h2>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        {step === 1 ? 'Tell us who you are' : step === 2 ? 'Where are we picking up and delivering?' : 'Confirm and pay to book instantly'}
                    </p>

                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><label style={lbl}>Full Name *</label><input style={inp} name="name" value={form.name} onChange={handleChange} placeholder="Your full name" /></div>
                            <div><label style={lbl}>Email Address *</label><input style={inp} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" /></div>
                            <div><label style={lbl}>Phone Number *</label><input style={inp} name="phone" value={form.phone} onChange={handleChange} placeholder="0XX XXX XXXX" /></div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><label style={lbl}>Pickup Address *</label><input style={inp} name="pickup_address" value={form.pickup_address} onChange={handleChange} placeholder="Where should we collect from?" /></div>
                            <div>
                                <label style={lbl}>Delivery Region *</label>
                                <select style={{ ...inp, appearance: 'none' as const }} name="region" value={form.region} onChange={handleChange}>
                                    <option value="">Select delivery region</option>
                                    {REGIONS.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                                </select>
                            </div>
                            <div><label style={lbl}>Delivery Address *</label><input style={inp} name="delivery_address" value={form.delivery_address} onChange={handleChange} placeholder="Where are we delivering to?" /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={lbl}>Preferred Pickup Date *</label><input style={inp} name="pickup_date" type="date" value={form.pickup_date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} /></div>
                                <div><label style={lbl}>Preferred Pickup Time *</label><input style={inp} name="pickup_time" type="time" value={form.pickup_time} onChange={handleChange} /></div>
                            </div>
                            <div><label style={lbl}>Package Weight (kg) *</label><input style={inp} name="weight_kg" type="number" min="0" step="0.1" value={form.weight_kg} onChange={handleChange} placeholder="Estimated weight" /></div>
                            <div><label style={lbl}>Package Description (optional)</label><textarea style={{ ...inp, minHeight: '75px', resize: 'vertical' as const }} name="package_description" value={form.package_description} onChange={handleChange} placeholder="What are we delivering? e.g. 2 boxes of clothing, 1 laptop bag..." /></div>

                            {/* Live fee preview */}
                            {form.region && (
                                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>Delivery fee breakdown</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        <span style={{ color: '#374151' }}>Base fee</span>
                                        <span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {BASE_FEE}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        <span style={{ color: '#374151' }}>Distance ({km}km × GHS {PER_KM})</span>
                                        <span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {km * PER_KM}</span>
                                    </div>
                                    {weight > WEIGHT_THRESHOLD && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#374151' }}>Weight surcharge ({(weight - WEIGHT_THRESHOLD).toFixed(1)}kg over {WEIGHT_THRESHOLD}kg)</span>
                                            <span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {Math.round((weight - WEIGHT_THRESHOLD) * PER_KG_OVER)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                                        <span style={{ color: '#1a2456' }}>Total</span>
                                        <span style={{ color: '#f97316' }}>GHS {deliveryFee}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div>
                            <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Booking Summary</h3>
                                {([
                                    ['Name', form.name],
                                    ['Phone', form.phone],
                                    ['Email', form.email],
                                    ['Pickup From', form.pickup_address],
                                    ['Deliver To', form.delivery_address],
                                    ['Region', form.region],
                                    ['Pickup Date', form.pickup_date],
                                    ['Pickup Time', form.pickup_time],
                                    ['Weight', `${weight}kg`],
                                    form.package_description ? ['Package', form.package_description] : null,
                                ] as [string, string][]).filter(Boolean).map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.38rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#666', flexShrink: 0, marginRight: '1rem' }}>{k}</span>
                                        <span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontSize: '1.1rem', fontWeight: 800 }}>
                                    <span style={{ color: '#1a2456' }}>Delivery Fee</span>
                                    <span style={{ color: '#f97316' }}>GHS {deliveryFee}</span>
                                </div>
                            </div>

                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#15803d', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><polyline points="20 6 9 17 4 12" /></svg>
                                <span>Pay now to confirm your delivery. Our team will contact you to confirm pickup details.</span>
                            </div>

                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                Payment secured by Paystack — MoMo, Visa & Mastercard accepted
                            </div>

                            <button onClick={initPaystack} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {loading ? 'Processing...' : `Pay GHS ${deliveryFee} & Confirm Delivery`}
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        {step > 1 && <button onClick={() => { setStep(step - 1); setError(''); }} style={{ flex: 1, padding: '0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>← Back</button>}
                        {step < 3 && <button onClick={nextStep} style={{ flex: 1, padding: '0.85rem', background: '#1a2456', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>Continue →</button>}
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1.25rem' }}>
                    Need help? Call <a href="tel:+233256089599" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>0256 089 599</a> or <a href="https://wa.me/233256089599" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>WhatsApp us</a>
                </p>
            </div>
        </div>
    );
}