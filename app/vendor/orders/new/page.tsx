'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

declare global { interface Window { PaystackPop: any; } }

type Product = { id: string; name: string; sku: string; quantity: number; space_type: string; };

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

const BASE_FEE = 20;
const PER_KM = 2;
const WEIGHT_THRESHOLD = 5;
const PER_KG_OVER = 3;

function calcDeliveryFee(km: number, weight: number) {
    const distFee = BASE_FEE + km * PER_KM;
    const weightFee = weight > WEIGHT_THRESHOLD ? (weight - WEIGHT_THRESHOLD) * PER_KG_OVER : 0;
    return Math.round(distFee + weightFee);
}

export default function NewOrderPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedItems, setSelectedItems] = useState<{ product_id: string; product_name: string; quantity: number }[]>([]);
    const [form, setForm] = useState({ recipient_name: '', recipient_phone: '', delivery_address: '', region: '', weight_kg: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [success, setSuccess] = useState(false);
    const [orderRef, setOrderRef] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        if (!token || !id) { router.push('/vendor/login'); return; }
        loadProducts(id, token);
    }, []);

    async function loadProducts(id: string, token: string) {
        try {
            const res = await fetch(`/api/vendor/products?vendor_id=${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setProducts(Array.isArray(data) ? data.filter((p: Product) => p.quantity > 0) : []);
        } catch { }
    }

    function toggleItem(product: Product) {
        const exists = selectedItems.find(i => i.product_id === product.id);
        if (exists) {
            setSelectedItems(prev => prev.filter(i => i.product_id !== product.id));
        } else {
            setSelectedItems(prev => [...prev, { product_id: product.id, product_name: product.name, quantity: 1 }]);
        }
    }

    function updateQty(product_id: string, qty: number) {
        const product = products.find(p => p.id === product_id);
        if (!product) return;
        const clamped = Math.max(1, Math.min(qty, product.quantity));
        setSelectedItems(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity: clamped } : i));
    }

    const selectedRegion = REGIONS.find(r => r.label === form.region);
    const km = selectedRegion?.base_km || 0;
    const weight = Number(form.weight_kg) || 0;
    const deliveryFee = calcDeliveryFee(km, weight);

    function nextStep() {
        if (step === 1 && selectedItems.length === 0) { setError('Select at least one product.'); return; }
        if (step === 2 && (!form.recipient_name || !form.recipient_phone || !form.delivery_address || !form.region)) { setError('Please fill in all delivery details.'); return; }
        setError(''); setStep(step + 1);
    }

    function initPaystack() {
        setLoading(true);
        const ref = `SORDER-${Date.now()}`;
        const token = localStorage.getItem('vendor_token');
        const vendor_id = localStorage.getItem('vendor_id');
        const vendorEmail = localStorage.getItem('vendor_email') || 'vendor@sakzee.com';

        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_6acba43a4893ab00f1a9618f7e84e5a471fe16ac',
            email: vendorEmail,
            amount: deliveryFee * 100,
            currency: 'GHS',
            ref,
            callback: function () {
                saveOrder(ref, token!, vendor_id!);
            },
            onClose: function () {
                setLoading(false);
                setError('Payment cancelled. Please try again.');
            },
        });
        handler.openIframe();
    }

    async function saveOrder(ref: string, token: string, vendor_id: string) {
        try {
            const res = await fetch('/api/vendor/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ reference: ref, vendor_id, items: selectedItems, recipient_name: form.recipient_name, recipient_phone: form.recipient_phone, delivery_address: form.delivery_address, region: form.region, distance_km: km, weight_kg: weight, delivery_fee: deliveryFee, status: 'Pending', payment_status: 'paid', paid_at: new Date().toISOString() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setOrderRef(ref);
            setSuccess(true);
            setLoading(false);
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

    if (success) return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", padding: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', maxWidth: '460px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ width: '56px', height: '56px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Order Created!</h2>
                <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.92rem' }}>Your order has been placed and Sakzee will begin fulfillment shortly.</p>
                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', marginBottom: '1.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Order Reference</div>
                    <div style={{ fontWeight: 800, color: '#1a2456', fontSize: '1rem', letterSpacing: '0.03em', fontFamily: 'monospace' }}>{orderRef}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link href="/vendor/orders" style={{ background: '#1a2456', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>View Orders</Link>
                    <Link href="/vendor/dashboard" style={{ background: '#f97316', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Dashboard</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/vendor/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                <Link href="/vendor/orders" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Orders</Link>
            </nav>

            <div style={{ maxWidth: '580px', margin: '3rem auto', padding: '0 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {['Select Items', 'Delivery Details', 'Pay & Confirm'].map((label, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i + 1 ? '#22c55e' : step === i + 1 ? '#1a2456' : '#e2e8f0', color: step >= i + 1 ? 'white' : '#999', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                                {step > i + 1 ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: step === i + 1 ? '#1a2456' : '#999', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
                            {i < 2 && <div style={{ width: '18px', height: '2px', background: step > i + 1 ? '#22c55e' : '#e2e8f0', flexShrink: 0 }} />}
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                    <h2 style={{ color: '#1a2456', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {step === 1 ? 'Select Products' : step === 2 ? 'Delivery Details' : 'Review & Pay'}
                    </h2>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        {step === 1 ? 'Choose items from your inventory to deliver' : step === 2 ? 'Where should we deliver?' : 'Confirm your order and pay delivery fee'}
                    </p>

                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

                    {step === 1 && (
                        <div>
                            {products.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>No products in stock</p>
                                    <Link href="/vendor/inventory/add" style={{ background: '#1a2456', color: 'white', padding: '0.7rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Add Inventory First</Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    {products.map(p => {
                                        const selected = selectedItems.find(i => i.product_id === p.id);
                                        return (
                                            <div key={p.id} style={{ padding: '0.9rem 1rem', border: `2px solid ${selected ? '#1a2456' : '#e2e8f0'}`, borderRadius: '10px', background: selected ? '#f0f3ff' : 'white', cursor: 'pointer' }} onClick={() => toggleItem(p)}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                        <input type="checkbox" checked={!!selected} onChange={() => { }} style={{ accentColor: '#1a2456' }} />
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: '#1a2456', fontSize: '0.9rem' }}>{p.name}</div>
                                                            <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.sku && `SKU: ${p.sku} · `}In stock: {p.quantity}</div>
                                                        </div>
                                                    </div>
                                                    {selected && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => updateQty(p.id, selected.quantity - 1)} style={{ width: '26px', height: '26px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                                            <span style={{ fontWeight: 700, color: '#1a2456', minWidth: '24px', textAlign: 'center' }}>{selected.quantity}</span>
                                                            <button onClick={() => updateQty(p.id, selected.quantity + 1)} style={{ width: '26px', height: '26px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><label style={lbl}>Recipient Name *</label><input style={inp} name="recipient_name" value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} placeholder="Who receives the delivery?" /></div>
                            <div><label style={lbl}>Recipient Phone *</label><input style={inp} name="recipient_phone" value={form.recipient_phone} onChange={e => setForm({ ...form, recipient_phone: e.target.value })} placeholder="0XX XXX XXXX" /></div>
                            <div><label style={lbl}>Delivery Address *</label><input style={inp} name="delivery_address" value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} placeholder="Full delivery address" /></div>
                            <div>
                                <label style={lbl}>Region *</label>
                                <select style={{ ...inp, appearance: 'none' as const }} name="region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                                    <option value="">Select a region</option>
                                    {REGIONS.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                                </select>
                            </div>
                            <div><label style={lbl}>Total Weight (kg)</label><input style={inp} name="weight_kg" type="number" min="0" step="0.1" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} placeholder="Estimated weight in kg" /></div>
                            {form.region && (
                                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>Delivery fee estimate</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        <span style={{ color: '#374151' }}>Base fee + distance ({km}km)</span>
                                        <span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {BASE_FEE + km * PER_KM}</span>
                                    </div>
                                    {weight > WEIGHT_THRESHOLD && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#374151' }}>Weight surcharge ({(weight - WEIGHT_THRESHOLD).toFixed(1)}kg over {WEIGHT_THRESHOLD}kg)</span>
                                            <span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {Math.round((weight - WEIGHT_THRESHOLD) * PER_KG_OVER)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                                        <span style={{ color: '#1a2456' }}>Total</span>
                                        <span style={{ color: '#f97316' }}>GHS {deliveryFee}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Order Summary</h3>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem' }}>Items</div>
                                    {selectedItems.map(item => (
                                        <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.25rem 0' }}>
                                            <span style={{ color: '#374151' }}>{item.product_name}</span>
                                            <span style={{ color: '#1a2456', fontWeight: 600 }}>x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                {[['Recipient', form.recipient_name], ['Phone', form.recipient_phone], ['Address', form.delivery_address], ['Region', form.region], ['Weight', `${weight}kg`]].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderTop: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#6b7280' }}>{k}</span>
                                        <span style={{ color: '#1a2456', fontWeight: 500 }}>{v}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontSize: '1.05rem', fontWeight: 700 }}>
                                    <span style={{ color: '#1a2456' }}>Delivery Fee</span>
                                    <span style={{ color: '#f97316' }}>GHS {deliveryFee}</span>
                                </div>
                            </div>
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                Payment secured by Paystack
                            </div>
                            <button onClick={initPaystack} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {loading ? 'Processing...' : `Pay GHS ${deliveryFee} & Place Order`}
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        {step > 1 && <button onClick={() => { setStep(step - 1); setError(''); }} style={{ flex: 1, padding: '0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>← Back</button>}
                        {step < 3 && <button onClick={nextStep} style={{ flex: 1, padding: '0.85rem', background: '#1a2456', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>Continue →</button>}
                    </div>
                </div>
            </div>
        </div>
    );
}
