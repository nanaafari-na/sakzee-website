'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
    const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', low_stock_threshold: '10', space_type: 'shelf' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!localStorage.getItem('vendor_token')) router.push('/vendor/login');
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit() {
        if (!form.name || !form.quantity) { setError('Product name and quantity are required.'); return; }
        if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0) { setError('Quantity must be a valid number.'); return; }
        setError('');
        setLoading(true);
        const token = localStorage.getItem('vendor_token');
        const vendor_id = localStorage.getItem('vendor_id');
        try {
            const res = await fetch('/api/vendor/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...form, quantity: Number(form.quantity), low_stock_threshold: Number(form.low_stock_threshold), vendor_id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add product');
            router.push('/vendor/inventory');
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

    const SHELF_RATE = 5;
    const PALLET_RATE = 12;
    const rate = form.space_type === 'pallet' ? PALLET_RATE : SHELF_RATE;

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/vendor/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                <Link href="/vendor/inventory" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Inventory</Link>
            </nav>

            <div style={{ maxWidth: '540px', margin: '3rem auto', padding: '0 1rem' }}>
                <h1 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Add Product</h1>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>Add a product to store in the Sakzee warehouse</p>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div><label style={lbl}>Product Name *</label><input style={inp} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Men's White T-Shirt" /></div>
                        <div><label style={lbl}>SKU (optional)</label><input style={inp} name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. SHIRT-WHT-M" /></div>
                        <div><label style={lbl}>Category (optional)</label><input style={inp} name="category" value={form.category} onChange={handleChange} placeholder="e.g. Fashion, Electronics, Food" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label style={lbl}>Initial Quantity *</label><input style={inp} name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="0" /></div>
                            <div><label style={lbl}>Low Stock Alert At</label><input style={inp} name="low_stock_threshold" type="number" min="0" value={form.low_stock_threshold} onChange={handleChange} placeholder="10" /></div>
                        </div>
                        <div>
                            <label style={lbl}>Storage Space Type *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {[{ value: 'shelf', label: 'Shelf Space', desc: `GHS ${SHELF_RATE}/day`, sub: 'Small-medium items' }, { value: 'pallet', label: 'Pallet Space', desc: `GHS ${PALLET_RATE}/day`, sub: 'Large/bulk items' }].map(opt => (
                                    <label key={opt.value} style={{ display: 'block', padding: '0.9rem 1rem', border: `2px solid ${form.space_type === opt.value ? '#1a2456' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: form.space_type === opt.value ? '#f0f3ff' : 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                            <input type="radio" name="space_type" value={opt.value} checked={form.space_type === opt.value} onChange={handleChange} style={{ accentColor: '#1a2456' }} />
                                            <span style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.875rem' }}>{opt.label}</span>
                                        </div>
                                        <div style={{ color: '#f97316', fontWeight: 700, fontSize: '0.875rem' }}>{opt.desc}</div>
                                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{opt.sub}</div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Cost preview */}
                        <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>Estimated storage cost</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: '#374151' }}>Daily</span><span style={{ fontWeight: 700, color: '#1a2456' }}>GHS {rate}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                <span style={{ color: '#374151' }}>Monthly (30 days)</span><span style={{ fontWeight: 700, color: '#f97316' }}>GHS {rate * 30}</span>
                            </div>
                        </div>

                        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '0.95rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                            {loading ? 'Adding product...' : 'Add to Inventory'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
