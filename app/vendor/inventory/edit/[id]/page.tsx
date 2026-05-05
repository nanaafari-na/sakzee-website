'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params }: { params: { id: string } }) {
    const [form, setForm] = useState({ name: '', sku: '', category: '', low_stock_threshold: '10', space_type: 'shelf' });
    const [checkinStatus, setCheckinStatus] = useState('');
    const [currentQty, setCurrentQty] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('vendor_token');
        if (!token) { router.push('/vendor/login'); return; }
        loadProduct(token);
    }, []);

    async function loadProduct(token: string) {
        try {
            const res = await fetch(`/api/vendor/products/single?id=${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!data || data.error) throw new Error('Product not found');
            setForm({
                name: data.name || '',
                sku: data.sku || '',
                category: data.category || '',
                low_stock_threshold: String(data.low_stock_threshold || 10),
                space_type: data.space_type || 'shelf',
            });
            setCheckinStatus(data.checkin_status || '');
            setCurrentQty(data.quantity || 0);
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    }

    async function handleSave() {
        if (!form.name) { setError('Product name is required.'); return; }
        setError('');
        setSaving(true);
        const token = localStorage.getItem('vendor_token');
        try {
            const res = await fetch(`/api/vendor/products?id=${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: form.name,
                    sku: form.sku,
                    category: form.category,
                    low_stock_threshold: Number(form.low_stock_threshold),
                    space_type: form.space_type,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');
            setSuccess(true);
            setTimeout(() => router.push('/vendor/inventory'), 1200);
        } catch (e: any) {
            setError(e.message);
        }
        setSaving(false);
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

    const SHELF_RATE = 5;
    const PALLET_RATE = 12;
    const rate = form.space_type === 'pallet' ? PALLET_RATE : SHELF_RATE;

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", color: '#9ca3af' }}>
            Loading product...
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/vendor/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <Link href="/vendor/inventory" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Inventory</Link>
            </nav>

            <div style={{ maxWidth: '540px', margin: '3rem auto', padding: '0 1rem' }}>
                <h1 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Edit Product</h1>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>Update product details — stock quantity is managed by Sakzee warehouse</p>

                {/* Current stock status */}
                <div style={{ background: checkinStatus === 'pending_checkin' ? '#fff7ed' : '#f0fdf4', border: `1px solid ${checkinStatus === 'pending_checkin' ? '#fed7aa' : '#bbf7d0'}`, borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.2rem' }}>Current Stock Status</div>
                            <div style={{ fontWeight: 700, color: checkinStatus === 'pending_checkin' ? '#c2410c' : '#15803d', fontSize: '0.95rem' }}>
                                {checkinStatus === 'pending_checkin' ? 'Awaiting warehouse check-in' : `${currentQty} units in stock`}
                            </div>
                        </div>
                        <span style={{ background: checkinStatus === 'pending_checkin' ? '#fff7ed' : '#f0fdf4', color: checkinStatus === 'pending_checkin' ? '#c2410c' : '#15803d', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, border: `1px solid ${checkinStatus === 'pending_checkin' ? '#fed7aa' : '#bbf7d0'}` }}>
                            {checkinStatus === 'pending_checkin' ? 'Pending' : 'Checked In'}
                        </span>
                    </div>
                    {checkinStatus === 'pending_checkin' && (
                        <p style={{ color: '#c2410c', fontSize: '0.78rem', marginTop: '0.5rem', marginBottom: 0 }}>
                            Sakzee warehouse staff will verify and count your goods. You will be notified once confirmed.
                        </p>
                    )}
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>
                    )}
                    {success && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', color: '#15803d', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                            ✓ Product updated successfully! Redirecting...
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div>
                            <label style={lbl}>Product Name *</label>
                            <input style={inp} name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Men's White T-Shirt" />
                        </div>
                        <div>
                            <label style={lbl}>SKU (optional)</label>
                            <input style={inp} name="sku" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SHIRT-WHT-M" />
                        </div>
                        <div>
                            <label style={lbl}>Category (optional)</label>
                            <input style={inp} name="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Fashion, Electronics, Food" />
                        </div>
                        <div>
                            <label style={lbl}>Low Stock Alert At</label>
                            <input style={inp} name="low_stock_threshold" type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} placeholder="10" />
                        </div>
                        <div>
                            <label style={lbl}>Storage Space Type *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {[
                                    { value: 'shelf', label: 'Shelf Space', desc: `GHS ${SHELF_RATE}/day`, sub: 'Small-medium items' },
                                    { value: 'pallet', label: 'Pallet Space', desc: `GHS ${PALLET_RATE}/day`, sub: 'Large/bulk items' },
                                ].map(opt => (
                                    <label key={opt.value} style={{ display: 'block', padding: '0.9rem 1rem', border: `2px solid ${form.space_type === opt.value ? '#1a2456' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: form.space_type === opt.value ? '#f0f3ff' : 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                            <input type="radio" name="space_type" value={opt.value} checked={form.space_type === opt.value} onChange={e => setForm({ ...form, space_type: e.target.value })} style={{ accentColor: '#1a2456' }} />
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
                            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>Storage cost</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: '#374151' }}>Daily</span>
                                <span style={{ fontWeight: 700, color: '#1a2456' }}>GHS {rate}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                <span style={{ color: '#374151' }}>Monthly (30 days)</span>
                                <span style={{ fontWeight: 700, color: '#f97316' }}>GHS {rate * 30}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleSave}
                                disabled={saving || success}
                                style={{ flex: 1, background: saving || success ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '0.95rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: saving || success ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                            >
                                {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
                            </button>
                            <Link href="/vendor/inventory" style={{ flex: 1, background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', padding: '0.95rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}