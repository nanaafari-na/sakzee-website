'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SERVICES = [
    { id: 'warehousing', label: 'Warehousing & Inventory Management', note: 'From GHS 5/day per shelf space' },
    { id: 'fulfillment', label: 'Order Fulfillment', note: 'Included with warehousing' },
    { id: 'delivery', label: 'Shipping & Delivery', note: 'From GHS 30 per delivery' },
    { id: 'returns', label: 'Returns Management', note: 'Custom quote based on volume' },
    { id: 'ecommerce', label: 'E-commerce Integration', note: 'Custom quote based on platform' },
];

export default function BookPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', service: '', date: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [reference, setReference] = useState('');
    const [error, setError] = useState('');

    // Load Paystack script
    useEffect(() => {
        const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
        if (existing) return;
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }, []);

    const selected = SERVICES.find(s => s.id === form.service);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function nextStep() {
        if (step === 1 && (!form.name || !form.email || !form.phone)) {
            setError('Please fill in all required fields.'); return;
        }
        if (step === 2 && (!form.service || !form.date)) {
            setError('Please select a service and preferred date.'); return;
        }
        setError('');
        setStep(step + 1);
    }

    async function submitBooking() {
        setLoading(true);
        const ref = `SAKZEE-${Date.now()}`;
        try {
            await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: ref,
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    business: form.business,
                    service: selected?.label,
                    date: form.date,
                    notes: form.notes,
                    status: 'Received',
                    paid_at: new Date().toISOString(),
                }),
            });
            setReference(ref);
            setSuccess(true);
        } catch (e) {
            setError('Something went wrong. Please try again or call us on 0256 089 599.');
        }
        setLoading(false);
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', maxWidth: '480px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <h2 style={{ color: '#1a2456', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem' }}>Request Received!</h2>
                    <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                        Thank you <strong>{form.name}</strong>! Your request for <strong>{selected?.label}</strong> has been received. Our team will contact you within 24 hours to discuss your needs and provide an exact quote.
                    </p>
                    <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Your reference number</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a2456', letterSpacing: '0.05em' }}>{reference}</div>
                        <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.35rem' }}>Save this to track your request at sakzee.com/track</div>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
                        A confirmation has been sent to <strong>{form.email}</strong>.
                    </p>
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.75rem', fontSize: '0.85rem', color: '#c2410c' }}>
                        Can&apos;t wait? Call us now on <a href="tel:+233256089599" style={{ fontWeight: 700, color: '#c2410c' }}>0256 089 599</a> or <a href="https://wa.me/233256089599" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: '#c2410c' }}>WhatsApp us</a>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/track" style={{ background: '#1a2456', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                            Track My Request
                        </Link>
                        <Link href="/" style={{ background: '#f97316', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
                    <Link href="/services" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Services</Link>
                    <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
                    <Link href="/about" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>About</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '560px', margin: '3rem auto', padding: '0 1rem' }}>

                {/* Info banner */}
                <div style={{ background: '#f0f3ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '0.9rem 1.25rem', marginBottom: '1.75rem', fontSize: '0.85rem', color: '#1d4ed8', lineHeight: 1.6 }}>
                    <strong>How this works:</strong> Tell us what you need and when. Our team will contact you within 24 hours with an exact quote tailored to your business. No payment required now.
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {['Your Details', 'Choose Service', 'Confirm'].map((label, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i + 1 ? '#22c55e' : step === i + 1 ? '#1a2456' : '#e2e8f0', color: step >= i + 1 ? 'white' : '#999', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                                {step > i + 1 ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: step === i + 1 ? '#1a2456' : '#999', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
                            {i < 2 && <div style={{ width: '20px', height: '2px', background: step > i + 1 ? '#22c55e' : '#e2e8f0', flexShrink: 0 }} />}
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <h1 style={{ color: '#1a2456', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {step === 1 ? 'Your Information' : step === 2 ? 'Select a Service' : 'Confirm Request'}
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
                        {step === 1 ? 'Tell us about yourself and your business' : step === 2 ? 'Which service are you interested in?' : 'Review your request — we will be in touch within 24 hours'}
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>
                    )}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            {([['name', 'Full Name *', 'text', 'Your full name'], ['email', 'Email Address *', 'email', 'you@example.com'], ['phone', 'Phone Number *', 'text', '0XX XXX XXXX'], ['business', 'Business Name (optional)', 'text', 'Your business or brand name']] as [string, string, string, string][]).map(([n, l, t, p]) => (
                                <div key={n}>
                                    <label style={lbl}>{l}</label>
                                    <input style={inp} name={n} type={t} value={(form as any)[n]} onChange={handleChange} placeholder={p} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div>
                                <label style={lbl}>Select Service *</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    {SERVICES.map(s => (
                                        <label key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.9rem 1rem', border: `2px solid ${form.service === s.id ? '#1a2456' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: form.service === s.id ? '#f0f3ff' : 'white' }}>
                                            <input type="radio" name="service" value={s.id} checked={form.service === s.id} onChange={handleChange} style={{ accentColor: '#1a2456', marginTop: '3px', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a2456' }}>{s.label}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#f97316', fontWeight: 600, marginTop: '0.2rem' }}>{s.note}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={lbl}>Preferred Start Date *</label>
                                <input style={inp} name="date" type="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div>
                                <label style={lbl}>Additional Notes (optional)</label>
                                <textarea style={{ ...inp, minHeight: '85px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handleChange as any} placeholder="Tell us more — inventory size, number of orders per month, delivery destinations, special requirements..." />
                            </div>
                        </div>
                    )}

                    {/* STEP 3 — CONFIRM */}
                    {step === 3 && selected && (
                        <div>
                            <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Request Summary</h3>
                                {([
                                    ['Name', form.name],
                                    ['Email', form.email],
                                    ['Phone', form.phone],
                                    form.business ? ['Business', form.business] : null,
                                    ['Service', selected.label],
                                    ['Pricing', selected.note],
                                    ['Preferred Date', form.date],
                                    form.notes ? ['Notes', form.notes] : null,
                                ] as [string, string][]).filter(Boolean).map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.38rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#666' }}>{k}</span>
                                        <span style={{ color: '#1a2456', fontWeight: 500, maxWidth: '240px', textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#15803d', lineHeight: 1.6 }}>
                                ✅ No payment required now. Our team will contact you within 24 hours with a full quote.
                            </div>

                            <button
                                onClick={submitBooking}
                                disabled={loading}
                                style={{ width: '100%', background: loading ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                            >
                                {loading ? 'Submitting...' : 'Submit Request →'}
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
                        {step > 1 && (
                            <button onClick={() => { setStep(step - 1); setError(''); }} style={{ flex: 1, padding: '0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>
                                ← Back
                            </button>
                        )}
                        {step < 3 && (
                            <button onClick={nextStep} style={{ flex: 1, padding: '0.85rem', background: '#1a2456', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>
                                Continue →
                            </button>
                        )}
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1.25rem' }}>
                    Prefer to talk? Call <a href="tel:+233256089599" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>0256 089 599</a> or <a href="https://wa.me/233256089599" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>WhatsApp us</a>
                </p>
            </div>
        </div>
    );
}