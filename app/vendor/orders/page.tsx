'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Order = {
    id: string;
    reference: string;
    recipient_name: string;
    recipient_phone: string;
    delivery_address: string;
    region: string;
    distance_km: number;
    weight_kg: number;
    delivery_fee: number;
    status: string;
    payment_status: string;
    created_at: string;
};

const STATUS_STEPS = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered'];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    Pending: { bg: '#eff6ff', color: '#1d4ed8' },
    Processing: { bg: '#fff7ed', color: '#c2410c' },
    Packed: { bg: '#f5f3ff', color: '#6d28d9' },
    Shipped: { bg: '#ecfeff', color: '#0e7490' },
    Delivered: { bg: '#f0fdf4', color: '#15803d' },
};

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selected, setSelected] = useState<Order | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        if (!token || !id) { router.push('/vendor/login'); return; }
        loadOrders(id, token);
    }, []);

    async function loadOrders(id: string, token: string) {
        try {
            const res = await fetch(`/api/vendor/orders?vendor_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch { }
        setLoading(false);
    }

    const filtered = orders.filter(o => {
        const matchSearch = search === '' ||
            o.reference.toLowerCase().includes(search.toLowerCase()) ||
            o.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
            o.delivery_address.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const currentStep = (status: string) => STATUS_STEPS.indexOf(status);

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/vendor/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/vendor/dashboard" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Dashboard</Link>
                    <Link href="/vendor/inventory" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Inventory</Link>
                    <Link href="/vendor/billing" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Billing</Link>
                    <Link href="/vendor/orders/new" style={{ background: '#f97316', color: 'white', padding: '0.45rem 1rem', borderRadius: '7px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700 }}>
                        + New Order
                    </Link>
                </div>
            </nav>

            <div style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>My Orders</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>{orders.length} total orders</p>
                    </div>
                    <Link href="/vendor/orders/new" style={{ background: '#1a2456', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Create New Order
                    </Link>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'All Orders', value: orders.length, color: '#1a2456' },
                        { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: '#1d4ed8' },
                        { label: 'In Transit', value: orders.filter(o => o.status === 'Shipped').length, color: '#0e7490' },
                        { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, color: '#15803d' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.label}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{loading ? '...' : s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by reference, recipient or address..."
                        style={{ flex: 1, minWidth: '220px', padding: '0.65rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', background: 'white' }}
                    />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '0.65rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', background: 'white', color: '#1a2456' }}
                    >
                        <option value="All">All Statuses</option>
                        {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Orders list */}
                {loading ? (
                    <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading orders...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#9ca3af', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                            {search || filterStatus !== 'All' ? 'No orders match your search' : 'No orders yet — create your first order'}
                        </p>
                        {!search && filterStatus === 'All' && (
                            <Link href="/vendor/orders/new" style={{ background: '#1a2456', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                                Create First Order
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {filtered.map(order => (
                            <div
                                key={order.id}
                                onClick={() => setSelected(order)}
                                style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#1a2456', fontSize: '0.95rem', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{order.reference}</div>
                                        <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                            {new Date(order.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ background: STATUS_COLORS[order.status]?.bg || '#f3f4f6', color: STATUS_COLORS[order.status]?.color || '#374151', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                                            {order.status}
                                        </span>
                                        <span style={{ background: order.payment_status === 'paid' ? '#f0fdf4' : '#fef2f2', color: order.payment_status === 'paid' ? '#15803d' : '#dc2626', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>
                                            {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        {STATUS_STEPS.map((s, i) => (
                                            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem',
                                                    background: i <= currentStep(order.status) ? (STATUS_COLORS[order.status]?.color || '#1a2456') : '#e5e7eb',
                                                    color: i <= currentStep(order.status) ? 'white' : '#9ca3af', fontSize: '0.65rem', fontWeight: 700,
                                                }}>
                                                    {i < currentStep(order.status)
                                                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                        : i + 1}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', color: i <= currentStep(order.status) ? '#1a2456' : '#9ca3af', fontWeight: i === currentStep(order.status) ? 700 : 400, textAlign: 'center' }}>{s}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ position: 'relative', height: '3px', background: '#e5e7eb', borderRadius: '2px', margin: '0 10px' }}>
                                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '2px', background: STATUS_COLORS[order.status]?.color || '#1a2456', width: `${Math.max(0, (currentStep(order.status) / (STATUS_STEPS.length - 1)) * 100)}%`, transition: 'width 0.4s ease' }} />
                                    </div>
                                </div>

                                {/* Delivery info */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.15rem' }}>Recipient</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{order.recipient_name}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.15rem' }}>Destination</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{order.region}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.15rem' }}>Weight</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{order.weight_kg}kg</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.15rem' }}>Delivery Fee</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f97316' }}>GHS {order.delivery_fee}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order detail modal */}
            {selected && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}
                    onClick={() => setSelected(null)}
                >
                    <div
                        style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: 'monospace' }}>{selected.reference}</h2>
                                <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                                    {new Date(selected.created_at).toLocaleString('en-GH')}
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.5rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
                        </div>

                        {/* Status progress */}
                        <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '1rem' }}>Delivery Status</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                {STATUS_STEPS.map((s, i) => (
                                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                            width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem',
                                            background: i <= currentStep(selected.status) ? (STATUS_COLORS[selected.status]?.color || '#1a2456') : '#e5e7eb',
                                            color: 'white', fontSize: '0.7rem', fontWeight: 700,
                                        }}>
                                            {i < currentStep(selected.status)
                                                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                : i + 1}
                                        </div>
                                        <div style={{ fontSize: '0.62rem', color: i <= currentStep(selected.status) ? '#1a2456' : '#9ca3af', fontWeight: i === currentStep(selected.status) ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>{s}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ position: 'relative', height: '4px', background: '#e5e7eb', borderRadius: '2px', margin: '0 13px' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '2px', background: STATUS_COLORS[selected.status]?.color || '#1a2456', width: `${Math.max(0, (currentStep(selected.status) / (STATUS_STEPS.length - 1)) * 100)}%` }} />
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                            {[
                                ['Recipient', selected.recipient_name],
                                ['Phone', selected.recipient_phone],
                                ['Address', selected.delivery_address],
                                ['Region', selected.region],
                                ['Distance', `${selected.distance_km} km`],
                                ['Weight', `${selected.weight_kg} kg`],
                                ['Delivery Fee', `GHS ${selected.delivery_fee}`],
                                ['Payment', selected.payment_status === 'paid' ? '✅ Paid' : '❌ Unpaid'],
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280' }}>{k}</span>
                                    <span style={{ color: '#1a2456', fontWeight: 500, maxWidth: '260px', textAlign: 'right' }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        <p style={{ color: '#9ca3af', fontSize: '0.78rem', textAlign: 'center' }}>
                            Questions? Call <a href="tel:+233256089599" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>0256 089 599</a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}