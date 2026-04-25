'use client';
import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

const SERVICES = [
    { id: 'warehousing', label: 'Warehousing & Inventory Management', price: 300 },
    { id: 'fulfillment', label: 'Order Fulfillment', price: 200 },
    { id: 'delivery', label: 'Shipping & Delivery', price: 150 },
    { id: 'returns', label: 'Returns Management', price: 100 },
    { id: 'ecommerce', label: 'E-commerce Integration', price: 250 },
];

declare global {
    interface Window {
        PaystackPop: any;
    }
}

export default function BookPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', service: '', date: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const selected = SERVICES.find(s => s.id === form.service);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function nextStep() {
        if (step === 1 && (!form.name || !form.email || !form.phone)) {
            setError('Please fill in all required fields.');
            return;
        }
        if (step === 2 && (!form.service || !form.date)) {
            setError('Please select a service and date.');
            return;
        }
        setError('');
        setStep(step + 1);
    }

    function initPaystack() {
        setLoading(true);
        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_REPLACE_WITH_YOUR_KEY',
            email: form.email,
            amount: (selected?.price || 0) * 100,
            currency: 'GHS',
            ref: `SAKZEE-${Date.now()}`,
            callback: function () {
                setLoading(false);
                setSuccess(true);
            },
            onClose: function () {
                setLoading(false);
                setError('Payment was cancelled. Please try again.');
            },
        });
        handler.openIframe();
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0',
        borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'inherit', color: '#1a2456', background: 'white',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem',
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', maxWidth: '480px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Booking Confirmed!</h2>
                    <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '1rem' }}>
                        Thank you <strong>{form.name}</strong>! Your booking for <strong>{selected?.label}</strong> on <strong>{form.date}</strong> has been received.
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>A confirmation will be sent to <strong>{form.email}</strong>. Our team will contact you within 24 hours.</p>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '2rem' }}>Questions? Call: 0256089599 / 0256089598</p>
                    <Link href="/" style={{ background: '#f97316', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, display: 'inline-block' }}>
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />

            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 700 }}>
                    <span>sak</span><span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
            </nav>

            <div style={{ maxWidth: '560px', margin: '3rem auto', padding: '0 1rem' }}>

                {/* STEP INDICATORS */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {['Your Details', 'Choose Service', 'Payment'].map((label, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: step > i + 1 ? '#22c55e' : step === i + 1 ? '#1a2456' : '#e2e8f0',
                                color: step >= i + 1 ? 'white' : '#999', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                            }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: step === i + 1 ? '#1a2456' : '#999', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
                            {i < 2 && <div style={{ width: '20px', height: '2px', background: step > i + 1 ? '#22c55e' : '#e2e8f0', flexShrink: 0 }} />}
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <h1 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {step === 1 ? 'Your Information' : step === 2 ? 'Select a Service' : 'Review & Pay'}
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '2rem' }}>
                        {step === 1 ? 'Tell us about yourself and your business' : step === 2 ? 'Choose the service you need' : 'Confirm your booking and complete payment'}
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Full Name *</label>
                                <input style={inputStyle} name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
                            </div>
                            <div>
                                <label style={labelStyle}>Email Address *</label>
                                <input style={inputStyle} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone Number *</label>
                                <input style={inputStyle} name="phone" value={form.phone} onChange={handleChange} placeholder="0XX XXX XXXX" />
                            </div>
                            <div>
                                <label style={labelStyle}>Business Name (optional)</label>
                                <input style={inputStyle} name="business" value={form.business} onChange={handleChange} placeholder="Your business or brand name" />
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Select Service *</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {SERVICES.map(s => (
                                        <label key={s.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.85rem 1rem', border: `2px solid ${form.service === s.id ? '#1a2456' : '#e2e8f0'}`,
                                            borderRadius: '10px', cursor: 'pointer', background: form.service === s.id ? '#f0f3ff' : 'white',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <input type="radio" name="service" value={s.id} checked={form.service === s.id} onChange={handleChange} style={{ accentColor: '#1a2456' }} />
                                                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a2456' }}>{s.label}</span>
                                            </div>
                                            <span style={{ color: '#f97316', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>GHS {s.price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Preferred Start Date *</label>
                                <input style={inputStyle} name="date" type="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div>
                                <label style={labelStyle}>Additional Notes (optional)</label>
                                <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handleChange} placeholder="Describe your needs, inventory size, special requirements..." />
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && selected && (
                        <div>
                            <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Booking Summary</h3>
                                {([
                                    ['Customer', form.name],
                                    ['Email', form.email],
                                    ['Phone', form.phone],
                                    form.business ? ['Business', form.business] : null,
                                    ['Service', selected.label],
                                    ['Start Date', form.date],
                                    form.notes ? ['Notes', form.notes] : null,
                                ] as [string, string][]).filter(Boolean).map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#666' }}>{k}</span>
                                        <span style={{ color: '#1a2456', fontWeight: 500, maxWidth: '240px', textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
                                    <span style={{ color: '#1a2456' }}>Total</span>
                                    <span style={{ color: '#f97316' }}>GHS {selected.price}</span>
                                </div>
                            </div>
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#16a34a' }}>
                                Payments secured by Paystack — supports Mobile Money, Visa and Mastercard
                            </div>
                            <button
                                onClick={initPaystack}
                                disabled={loading}
                                style={{ width: '100%', background: loading ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                                {loading ? 'Processing...' : `Pay GHS ${selected.price} with Paystack`}
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
                        {step > 1 && (
                            <button onClick={() => { setStep(step - 1); setError(''); }} style={{ flex: 1, padding: '0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
                                Back
                            </button>
                        )}
                        {step < 3 && (
                            <button onClick={nextStep} style={{ flex: 1, padding: '0.85rem', background: '#1a2456', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
                                Continue
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
