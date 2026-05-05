'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const BOOKING_STATUS = ['Received', 'Processing', 'Packed', 'Shipped', 'Delivered'];
const ORDER_STATUS = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered'];
const STATUS_STEPS = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered'];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    Received: { bg: '#eff6ff', color: '#1d4ed8' },
    Pending: { bg: '#eff6ff', color: '#1d4ed8' },
    Processing: { bg: '#fff7ed', color: '#c2410c' },
    Packed: { bg: '#f5f3ff', color: '#6d28d9' },
    Shipped: { bg: '#ecfeff', color: '#0e7490' },
    Delivered: { bg: '#f0fdf4', color: '#15803d' },
};

type Booking = { id: string; reference: string; name: string; email: string; phone: string; business: string; service: string; date: string; notes: string; status: string; paid_at: string; };
type Vendor = { id: string; email: string; business_name: string; contact_name: string; phone: string; status: string; created_at: string; approved_at: string | null; suspended_at: string | null; suspension_reason: string | null; };
type Product = { id: string; name: string; sku: string; quantity: number; space_type: string; checkin_status: string; checked_in_quantity: number; vendor_id: string; };
type VendorOrder = { id: string; reference: string; vendor_id: string; vendor: { business_name: string; contact_name: string; email: string; phone: string } | null; recipient_name: string; recipient_phone: string; delivery_address: string; region: string; distance_km: number; weight_kg: number; delivery_fee: number; status: string; payment_status: string; created_at: string; };

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState('');
    const [pwError, setPwError] = useState('');
    const [tab, setTab] = useState<'bookings' | 'orders' | 'vendors' | 'inventory'>('bookings');

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingFilter, setBookingFilter] = useState('All');

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vendorsLoading, setVendorsLoading] = useState(false);
    const [suspendModal, setSuspendModal] = useState<Vendor | null>(null);
    const [suspendReason, setSuspendReason] = useState('');
    const [updatingVendor, setUpdatingVendor] = useState<string | null>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [checkinQty, setCheckinQty] = useState<Record<string, string>>({});
    const [checkingIn, setCheckingIn] = useState<string | null>(null);

    const [vendorOrders, setVendorOrders] = useState<VendorOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
    const [orderSearch, setOrderSearch] = useState('');
    const [orderFilter, setOrderFilter] = useState('All');

    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'sakzee2025';

    function handleLogin() {
        if (password === ADMIN_PASSWORD) { setAuthed(true); loadAll(); }
        else setPwError('Incorrect password.');
    }

    function loadAll() { loadBookings(); loadVendors(); loadProducts(); loadVendorOrders(); }

    async function loadBookings() {
        setBookingsLoading(true);
        try { const r = await fetch('/api/admin/bookings'); const d = await r.json(); setBookings(Array.isArray(d) ? d : []); } catch { }
        setBookingsLoading(false);
    }

    async function loadVendors() {
        setVendorsLoading(true);
        try { const r = await fetch('/api/admin/vendors'); const d = await r.json(); setVendors(Array.isArray(d) ? d : []); } catch { }
        setVendorsLoading(false);
    }

    async function loadProducts() {
        setProductsLoading(true);
        try { const r = await fetch('/api/admin/inventory'); const d = await r.json(); setProducts(Array.isArray(d) ? d : []); } catch { }
        setProductsLoading(false);
    }

    async function loadVendorOrders() {
        setOrdersLoading(true);
        try { const r = await fetch('/api/admin/orders'); const d = await r.json(); setVendorOrders(Array.isArray(d) ? d : []); } catch { }
        setOrdersLoading(false);
    }

    async function updateBookingStatus(reference: string, status: string) {
        setUpdatingBooking(reference);
        try {
            await fetch('/api/admin/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, status }) });
            setBookings(p => p.map(b => b.reference === reference ? { ...b, status } : b));
            if (selectedBooking?.reference === reference) setSelectedBooking(p => p ? { ...p, status } : null);
        } catch { alert('Failed to update'); }
        setUpdatingBooking(null);
    }

    async function updateOrderStatus(id: string, status: string) {
        setUpdatingOrder(id);
        try {
            await fetch(`/api/admin/orders?id=${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
            setVendorOrders(p => p.map(o => o.id === id ? { ...o, status } : o));
            if (selectedOrder?.id === id) setSelectedOrder(p => p ? { ...p, status } : null);
        } catch { alert('Failed to update'); }
        setUpdatingOrder(null);
    }

    async function approveVendor(vendor: Vendor) {
        setUpdatingVendor(vendor.id);
        try {
            await fetch(`/api/admin/vendors?id=${vendor.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active', approved_at: new Date().toISOString(), suspended_at: null, suspension_reason: null }) });
            setVendors(p => p.map(v => v.id === vendor.id ? { ...v, status: 'active', approved_at: new Date().toISOString() } : v));
        } catch { alert('Failed'); }
        setUpdatingVendor(null);
    }

    async function suspendVendor() {
        if (!suspendModal || !suspendReason.trim()) { alert('Please enter a reason.'); return; }
        setUpdatingVendor(suspendModal.id);
        try {
            await fetch(`/api/admin/vendors?id=${suspendModal.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'suspended', suspended_at: new Date().toISOString(), suspension_reason: suspendReason }) });
            setVendors(p => p.map(v => v.id === suspendModal.id ? { ...v, status: 'suspended', suspension_reason: suspendReason } : v));
            setSuspendModal(null); setSuspendReason('');
        } catch { alert('Failed'); }
        setUpdatingVendor(null);
    }

    async function confirmCheckin(product: Product) {
        const qty = Number(checkinQty[product.id]);
        if (!qty || qty <= 0) { alert('Enter a valid quantity.'); return; }
        setCheckingIn(product.id);
        try {
            await fetch(`/api/admin/inventory?id=${product.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkin_status: 'checked_in', checked_in_quantity: qty, quantity: qty, checked_in_at: new Date().toISOString() }) });
            setProducts(p => p.map(pr => pr.id === product.id ? { ...pr, checkin_status: 'checked_in', checked_in_quantity: qty, quantity: qty } : pr));
            setCheckinQty(p => ({ ...p, [product.id]: '' }));
        } catch { alert('Failed'); }
        setCheckingIn(null);
    }

    const pendingVendors = vendors.filter(v => v.status === 'pending');
    const pendingCheckins = products.filter(p => p.checkin_status === 'pending_checkin');
    const pendingOrders = vendorOrders.filter(o => o.status === 'Pending');

    const filteredBookings = bookings.filter(b => {
        const s = bookingSearch.toLowerCase();
        return (!s || b.name?.toLowerCase().includes(s) || b.reference?.toLowerCase().includes(s) || b.email?.toLowerCase().includes(s)) && (bookingFilter === 'All' || b.status === bookingFilter);
    });

    const filteredOrders = vendorOrders.filter(o => {
        const s = orderSearch.toLowerCase();
        return (!s || o.reference?.toLowerCase().includes(s) || o.vendor?.business_name?.toLowerCase().includes(s) || o.recipient_name?.toLowerCase().includes(s)) && (orderFilter === 'All' || o.status === orderFilter);
    });

    const inp = { padding: '0.65rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', background: 'white' };

    function NavTab({ id, label, count }: { id: typeof tab; label: string; count?: number }) {
        return (
            <button onClick={() => setTab(id)} style={{ background: tab === id ? 'white' : 'transparent', color: tab === id ? '#1a2456' : 'rgba(255,255,255,0.65)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: tab === id ? 700 : 500, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {label}
                {count !== undefined && count > 0 && <span style={{ background: '#f97316', color: 'white', borderRadius: '20px', padding: '0.1rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}>{count}</span>}
            </button>
        );
    }

    if (!authed) return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '380px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a2456', marginBottom: '0.25rem' }}>sak<span style={{ color: '#f97316' }}>zee</span></div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2456' }}>Admin Panel</div>
                    <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>Staff access only</div>
                </div>
                <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter admin password" style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', marginBottom: '0.75rem' }} />
                {pwError && <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{pwError}</div>}
                <button onClick={handleLogin} style={{ width: '100%', background: '#1a2456', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}>Log In</button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}><Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>← Back to website</Link></div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span> <span style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.6 }}>Admin</span></div>
                <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.25rem', flexWrap: 'wrap' }}>
                    <NavTab id="bookings" label="Client Bookings" />
                    <NavTab id="orders" label="Vendor Orders" count={pendingOrders.length} />
                    <NavTab id="vendors" label="Vendors" count={pendingVendors.length} />
                    <NavTab id="inventory" label="Inventory" count={pendingCheckins.length} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={loadAll} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.45rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>Refresh</button>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>← Website</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* CLIENT BOOKINGS */}
                {tab === 'bookings' && <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[{ l: 'Total', v: bookings.length, c: '#1a2456' }, { l: 'Delivered', v: bookings.filter(b => b.status === 'Delivered').length, c: '#15803d' }, { l: 'In Progress', v: bookings.filter(b => !['Delivered', 'Received'].includes(b.status)).length, c: '#f97316' }, { l: 'New', v: bookings.filter(b => b.status === 'Received').length, c: '#3b82f6' }].map(s => (
                            <div key={s.l} style={{ background: 'white', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.l}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.c }}>{s.v}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        <input value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} placeholder="Search name, email or reference..." style={{ flex: 1, minWidth: '200px', ...inp }} />
                        <select value={bookingFilter} onChange={e => setBookingFilter(e.target.value)} style={inp}><option>All</option>{BOOKING_STATUS.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                    <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #efefef', overflow: 'hidden' }}>
                        {bookingsLoading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> : filteredBookings.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No bookings found</div> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead><tr style={{ background: '#f8f9ff', borderBottom: '1px solid #efefef' }}>{['Reference', 'Customer', 'Service', 'Date', 'Status', 'Update'].map(h => <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{h}</th>)}</tr></thead>
                                <tbody>{filteredBookings.map((b, i) => (
                                    <tr key={b.reference} style={{ borderBottom: i < filteredBookings.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }} onClick={() => setSelectedBooking(b)}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1a2456', fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.reference}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}><div style={{ fontWeight: 600, color: '#1a2456' }}>{b.name}</div><div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{b.email}</div></td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#374151', maxWidth: '180px' }}>{b.service}</td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#6b7280', whiteSpace: 'nowrap' as const }}>{b.date}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}><span style={{ background: STATUS_COLORS[b.status]?.bg || '#f3f4f6', color: STATUS_COLORS[b.status]?.color || '#374151', padding: '0.28rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{b.status}</span></td>
                                        <td style={{ padding: '0.85rem 1rem' }} onClick={e => e.stopPropagation()}><select value={b.status} onChange={e => updateBookingStatus(b.reference, e.target.value)} disabled={updatingBooking === b.reference} style={{ padding: '0.35rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>{BOOKING_STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                </>}

                {/* VENDOR ORDERS */}
                {tab === 'orders' && <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[{ l: 'Total Orders', v: vendorOrders.length, c: '#1a2456' }, { l: 'Pending', v: pendingOrders.length, c: '#1d4ed8' }, { l: 'In Transit', v: vendorOrders.filter(o => o.status === 'Shipped').length, c: '#0e7490' }, { l: 'Delivered', v: vendorOrders.filter(o => o.status === 'Delivered').length, c: '#15803d' }].map(s => (
                            <div key={s.l} style={{ background: 'white', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.l}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.c }}>{s.v}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search reference, vendor or recipient..." style={{ flex: 1, minWidth: '200px', ...inp }} />
                        <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)} style={inp}><option>All</option>{ORDER_STATUS.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                    <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #efefef', overflow: 'hidden' }}>
                        {ordersLoading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> : filteredOrders.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No vendor orders found</div> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead><tr style={{ background: '#f8f9ff', borderBottom: '1px solid #efefef' }}>{['Reference', 'Vendor', 'Recipient', 'Region', 'Fee', 'Status', 'Update'].map(h => <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{h}</th>)}</tr></thead>
                                <tbody>{filteredOrders.map((o, i) => (
                                    <tr key={o.id} style={{ borderBottom: i < filteredOrders.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1a2456', fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.reference}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}><div style={{ fontWeight: 600, color: '#1a2456', fontSize: '0.875rem' }}>{o.vendor?.business_name || '—'}</div><div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{o.vendor?.contact_name}</div></td>
                                        <td style={{ padding: '0.85rem 1rem' }}><div style={{ fontWeight: 500, color: '#374151' }}>{o.recipient_name}</div><div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{o.recipient_phone}</div></td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#374151' }}>{o.region}</td>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#f97316' }}>GHS {o.delivery_fee}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}><span style={{ background: STATUS_COLORS[o.status]?.bg || '#f3f4f6', color: STATUS_COLORS[o.status]?.color || '#374151', padding: '0.28rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{o.status}</span></td>
                                        <td style={{ padding: '0.85rem 1rem' }} onClick={e => e.stopPropagation()}><select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} disabled={updatingOrder === o.id} style={{ padding: '0.35rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>{ORDER_STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                </>}

                {/* VENDORS */}
                {tab === 'vendors' && <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[{ l: 'Total', v: vendors.length, c: '#1a2456' }, { l: 'Active', v: vendors.filter(v => v.status === 'active').length, c: '#15803d' }, { l: 'Pending', v: pendingVendors.length, c: '#f97316' }, { l: 'Suspended', v: vendors.filter(v => v.status === 'suspended').length, c: '#dc2626' }].map(s => (
                            <div key={s.l} style={{ background: 'white', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.l}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.c }}>{s.v}</div>
                            </div>
                        ))}
                    </div>
                    {pendingVendors.length > 0 && <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.9rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c2410c' }}><strong>{pendingVendors.length} vendor{pendingVendors.length > 1 ? 's' : ''} awaiting approval.</strong></div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {vendorsLoading ? <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> :
                            vendors.length === 0 ? <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No vendors yet</div> :
                                vendors.map(v => (
                                    <div key={v.id} style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: `1px solid ${v.status === 'pending' ? '#fed7aa' : v.status === 'suspended' ? '#fecaca' : '#e5e7eb'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '1rem' }}>{v.business_name}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.2rem' }}>{v.contact_name} · {v.email} · {v.phone}</div>
                                                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.2rem' }}>Registered {new Date(v.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}{v.approved_at && ` · Approved ${new Date(v.approved_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}`}</div>
                                                {v.status === 'suspended' && v.suspension_reason && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.35rem' }}>Reason: {v.suspension_reason}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span style={{ background: v.status === 'active' ? '#f0fdf4' : v.status === 'pending' ? '#fff7ed' : '#fef2f2', color: v.status === 'active' ? '#15803d' : v.status === 'pending' ? '#c2410c' : '#dc2626', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{v.status === 'active' ? 'Active' : v.status === 'pending' ? 'Pending' : 'Suspended'}</span>
                                                {v.status === 'pending' && <button onClick={() => approveVendor(v)} disabled={updatingVendor === v.id} style={{ background: '#15803d', color: 'white', border: 'none', padding: '0.45rem 1rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>{updatingVendor === v.id ? '...' : '✓ Approve'}</button>}
                                                {v.status === 'active' && <button onClick={() => setSuspendModal(v)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.45rem 1rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>Suspend</button>}
                                                {v.status === 'suspended' && <button onClick={() => approveVendor(v)} disabled={updatingVendor === v.id} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.45rem 1rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>{updatingVendor === v.id ? '...' : 'Reinstate'}</button>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                    </div>
                </>}

                {/* INVENTORY */}
                {tab === 'inventory' && <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[{ l: 'Total Products', v: products.length, c: '#1a2456' }, { l: 'Awaiting Check-in', v: pendingCheckins.length, c: '#f97316' }, { l: 'Checked In', v: products.filter(p => p.checkin_status === 'checked_in').length, c: '#15803d' }].map(s => (
                            <div key={s.l} style={{ background: 'white', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.l}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.c }}>{s.v}</div>
                            </div>
                        ))}
                    </div>
                    {pendingCheckins.length > 0 && <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.9rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c2410c' }}><strong>{pendingCheckins.length} product{pendingCheckins.length > 1 ? 's' : ''} awaiting physical check-in.</strong></div>}
                    <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #efefef', overflow: 'hidden' }}>
                        {productsLoading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> : products.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No products yet</div> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead><tr style={{ background: '#f8f9ff', borderBottom: '1px solid #efefef' }}>{['Product', 'SKU', 'Space', 'Status', 'Stock', 'Confirm Check-in'].map(h => <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{h}</th>)}</tr></thead>
                                <tbody>{products.map((p, i) => (
                                    <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1a2456' }}>{p.name}</td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.sku || '—'}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}><span style={{ background: p.space_type === 'pallet' ? '#fff3e8' : '#f0f3ff', color: p.space_type === 'pallet' ? '#c2410c' : '#1d4ed8', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{p.space_type === 'pallet' ? 'Pallet' : 'Shelf'}</span></td>
                                        <td style={{ padding: '0.85rem 1rem' }}><span style={{ background: p.checkin_status === 'pending_checkin' ? '#fff7ed' : '#f0fdf4', color: p.checkin_status === 'pending_checkin' ? '#c2410c' : '#15803d', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>{p.checkin_status === 'pending_checkin' ? 'Awaiting' : 'Checked in'}</span></td>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1a2456' }}>{p.checkin_status === 'checked_in' ? `${p.quantity} units` : '—'}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            {p.checkin_status === 'pending_checkin' ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <input type="number" min="1" placeholder="Qty received" value={checkinQty[p.id] || ''} onChange={e => setCheckinQty(prev => ({ ...prev, [p.id]: e.target.value }))} style={{ width: '110px', padding: '0.4rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit' }} />
                                                    <button onClick={() => confirmCheckin(p)} disabled={checkingIn === p.id} style={{ background: '#15803d', color: 'white', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>{checkingIn === p.id ? '...' : '✓ Confirm'}</button>
                                                </div>
                                            ) : <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>{p.checked_in_quantity} confirmed</span>}
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                </>}
            </div>

            {/* Booking detail modal */}
            {selectedBooking && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={() => setSelectedBooking(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>{selectedBooking.reference}</h2>
                            <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                            {([['Customer', selectedBooking.name], ['Email', selectedBooking.email], ['Phone', selectedBooking.phone], ['Business', selectedBooking.business], ['Service', selectedBooking.service], ['Date', selectedBooking.date], ['Notes', selectedBooking.notes]] as [string, string][]).filter(([, v]) => v).map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.38rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#666' }}>{k}</span><span style={{ color: '#1a2456', fontWeight: 500, maxWidth: '260px', textAlign: 'right' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Update Status</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {BOOKING_STATUS.map(s => <button key={s} onClick={() => updateBookingStatus(selectedBooking.reference, s)} disabled={updatingBooking === selectedBooking.reference} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: `2px solid ${selectedBooking.status === s ? '#1a2456' : '#e2e8f0'}`, background: selectedBooking.status === s ? '#1a2456' : 'white', color: selectedBooking.status === s ? 'white' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vendor order detail modal */}
            {selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={() => setSelectedOrder(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '520px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' as const }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: 'monospace' }}>{selectedOrder.reference}</h2>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
                        </div>

                        {/* Progress bar */}
                        <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                {STATUS_STEPS.map((s, i) => {
                                    const cur = STATUS_STEPS.indexOf(selectedOrder.status);
                                    return (
                                        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.3rem', background: i <= cur ? (STATUS_COLORS[selectedOrder.status]?.color || '#1a2456') : '#e5e7eb', color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>
                                                {i < cur ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
                                            </div>
                                            <div style={{ fontSize: '0.6rem', color: i <= cur ? '#1a2456' : '#9ca3af', fontWeight: i === cur ? 700 : 400, textAlign: 'center' }}>{s}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ position: 'relative', height: '3px', background: '#e5e7eb', borderRadius: '2px', margin: '0 12px' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: '2px', background: STATUS_COLORS[selectedOrder.status]?.color || '#1a2456', width: `${Math.max(0, (STATUS_STEPS.indexOf(selectedOrder.status) / (STATUS_STEPS.length - 1)) * 100)}%` }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                            {([
                                ['Vendor', selectedOrder.vendor?.business_name],
                                ['Contact', selectedOrder.vendor?.contact_name],
                                ['Vendor Phone', selectedOrder.vendor?.phone],
                                ['Recipient', selectedOrder.recipient_name],
                                ['Recipient Phone', selectedOrder.recipient_phone],
                                ['Address', selectedOrder.delivery_address],
                                ['Region', selectedOrder.region],
                                ['Distance', `${selectedOrder.distance_km} km`],
                                ['Weight', `${selectedOrder.weight_kg} kg`],
                                ['Delivery Fee', `GHS ${selectedOrder.delivery_fee}`],
                                ['Payment', selectedOrder.payment_status === 'paid' ? '✅ Paid' : '❌ Unpaid'],
                            ] as [string, string][]).filter(([, v]) => v).map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.38rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#666' }}>{k}</span><span style={{ color: '#1a2456', fontWeight: 500, maxWidth: '260px', textAlign: 'right' }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Update Delivery Status</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {ORDER_STATUS.map(s => <button key={s} onClick={() => updateOrderStatus(selectedOrder.id, s)} disabled={updatingOrder === selectedOrder.id} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: `2px solid ${selectedOrder.status === s ? '#1a2456' : '#e2e8f0'}`, background: selectedOrder.status === s ? '#1a2456' : 'white', color: selectedOrder.status === s ? 'white' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend modal */}
            {suspendModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={() => setSuspendModal(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: '#dc2626', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Suspend Vendor</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.25rem' }}>You are about to suspend <strong>{suspendModal.business_name}</strong>. They will be blocked from logging in immediately.</p>
                        <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Reason *</label>
                        <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="e.g. Unpaid invoices, fraudulent activity..." style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical' as const, boxSizing: 'border-box' as const, marginBottom: '1.25rem' }} />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={suspendVendor} disabled={updatingVendor === suspendModal.id} style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{updatingVendor === suspendModal.id ? 'Suspending...' : 'Suspend Vendor'}</button>
                            <button onClick={() => { setSuspendModal(null); setSuspendReason(''); }} style={{ flex: 1, background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', padding: '0.85rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}