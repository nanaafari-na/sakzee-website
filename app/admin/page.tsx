'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['Received', 'Processing', 'Packed', 'Shipped', 'Delivered'];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    Received: { bg: '#eff6ff', color: '#1d4ed8' },
    Processing: { bg: '#fff7ed', color: '#c2410c' },
    Packed: { bg: '#f5f3ff', color: '#6d28d9' },
    Shipped: { bg: '#ecfeff', color: '#0e7490' },
    Delivered: { bg: '#f0fdf4', color: '#15803d' },
};

type Booking = { id: string; reference: string; name: string; email: string; phone: string; business: string; service: string; date: string; notes: string; status: string; paid_at: string; };
type Vendor = { id: string; email: string; business_name: string; contact_name: string; phone: string; status: string; created_at: string; approved_at: string | null; suspended_at: string | null; suspension_reason: string | null; };
type Product = { id: string; name: string; sku: string; quantity: number; space_type: string; checkin_status: string; checked_in_quantity: number; vendor_id: string; };

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState('');
    const [pwError, setPwError] = useState('');
    const [tab, setTab] = useState<'bookings' | 'vendors' | 'inventory'>('bookings');

    // Bookings
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Vendors
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [vendorsLoading, setVendorsLoading] = useState(false);
    const [suspendModal, setSuspendModal] = useState<Vendor | null>(null);
    const [suspendReason, setSuspendReason] = useState('');
    const [updatingVendor, setUpdatingVendor] = useState<string | null>(null);

    // Inventory check-ins
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [checkinQty, setCheckinQty] = useState<Record<string, string>>({});
    const [checkingIn, setCheckingIn] = useState<string | null>(null);

    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'sakzee2025';

    function handleLogin() {
        if (password === ADMIN_PASSWORD) {
            setAuthed(true);
            loadBookings();
            loadVendors();
            loadProducts();
        } else {
            setPwError('Incorrect password.');
        }
    }

    async function loadBookings() {
        setBookingsLoading(true);
        try {
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch { }
        setBookingsLoading(false);
    }

    async function loadVendors() {
        setVendorsLoading(true);
        try {
            const res = await fetch('/api/admin/vendors');
            const data = await res.json();
            setVendors(Array.isArray(data) ? data : []);
        } catch { }
        setVendorsLoading(false);
    }

    async function loadProducts() {
        setProductsLoading(true);
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch { }
        setProductsLoading(false);
    }

    async function updateBookingStatus(reference: string, status: string) {
        setUpdatingBooking(reference);
        try {
            await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference, status }),
            });
            setBookings(prev => prev.map(b => b.reference === reference ? { ...b, status } : b));
            if (selectedBooking?.reference === reference) setSelectedBooking(prev => prev ? { ...prev, status } : null);
        } catch { alert('Failed to update status'); }
        setUpdatingBooking(null);
    }

    async function approveVendor(vendor: Vendor) {
        setUpdatingVendor(vendor.id);
        try {
            await fetch(`/api/admin/vendors?id=${vendor.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active', approved_at: new Date().toISOString(), suspended_at: null, suspension_reason: null }),
            });
            setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: 'active', approved_at: new Date().toISOString() } : v));
        } catch { alert('Failed to approve vendor'); }
        setUpdatingVendor(null);
    }

    async function suspendVendor() {
        if (!suspendModal) return;
        if (!suspendReason.trim()) { alert('Please enter a suspension reason.'); return; }
        setUpdatingVendor(suspendModal.id);
        try {
            await fetch(`/api/admin/vendors?id=${suspendModal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'suspended', suspended_at: new Date().toISOString(), suspension_reason: suspendReason }),
            });
            setVendors(prev => prev.map(v => v.id === suspendModal.id ? { ...v, status: 'suspended', suspension_reason: suspendReason } : v));
            setSuspendModal(null);
            setSuspendReason('');
        } catch { alert('Failed to suspend vendor'); }
        setUpdatingVendor(null);
    }

    async function confirmCheckin(product: Product) {
        const qty = Number(checkinQty[product.id]);
        if (!qty || qty <= 0) { alert('Please enter a valid quantity.'); return; }
        setCheckingIn(product.id);
        try {
            await fetch(`/api/admin/inventory?id=${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkin_status: 'checked_in',
                    checked_in_quantity: qty,
                    quantity: qty,
                    checked_in_at: new Date().toISOString(),
                }),
            });
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, checkin_status: 'checked_in', checked_in_quantity: qty, quantity: qty } : p));
            setCheckinQty(prev => ({ ...prev, [product.id]: '' }));
        } catch { alert('Failed to confirm check-in'); }
        setCheckingIn(null);
    }

    const pendingVendors = vendors.filter(v => v.status === 'pending');
    const pendingCheckins = products.filter(p => p.checkin_status === 'pending_checkin');

    const navTab = (id: typeof tab, label: string, count?: number) => (
        <button
            onClick={() => setTab(id)}
            style={{ background: tab === id ? 'white' : 'transparent', color: tab === id ? '#1a2456' : 'rgba(255,255,255,0.65)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: tab === id ? 700 : 500, cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
            {label}
            {count !== undefined && count > 0 && (
                <span style={{ background: '#f97316', color: 'white', borderRadius: '20px', padding: '0.1rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}>{count}</span>
            )}
        </button>
    );

    if (!authed) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '380px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a2456', marginBottom: '0.25rem' }}>sak<span style={{ color: '#f97316' }}>zee</span></div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2456' }}>Admin Panel</div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>Staff access only</div>
                    </div>
                    <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter admin password"
                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '0.75rem' }} />
                    {pwError && <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{pwError}</div>}
                    <button onClick={handleLogin} style={{ width: '100%', background: '#1a2456', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}>Log In</button>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>← Back to website</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span> <span style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.6 }}>Admin</span></div>
                <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.25rem' }}>
                    {navTab('bookings', 'Client Bookings')}
                    {navTab('vendors', 'Vendors', pendingVendors.length)}
                    {navTab('inventory', 'Inventory Check-in', pendingCheckins.length)}
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => { loadBookings(); loadVendors(); loadProducts(); }} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.45rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>Refresh</button>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>← Website</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* ==================== BOOKINGS TAB ==================== */}
                {tab === 'bookings' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Total Bookings', value: bookings.length, color: '#1a2456' },
                                { label: 'Delivered', value: bookings.filter(b => b.status === 'Delivered').length, color: '#22c55e' },
                                { label: 'In Progress', value: bookings.filter(b => !['Delivered', 'Received'].includes(b.status)).length, color: '#f97316' },
                                { label: 'New', value: bookings.filter(b => b.status === 'Received').length, color: '#3b82f6' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #efefef', overflow: 'hidden' }}>
                            {bookingsLoading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> :
                                bookings.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No bookings yet</div> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f8f9ff', borderBottom: '1px solid #efefef' }}>
                                                {['Reference', 'Customer', 'Service', 'Date', 'Status', 'Update'].map(h => (
                                                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((b, i) => (
                                                <tr key={b.reference} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }} onClick={() => setSelectedBooking(b)}>
                                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1a2456', fontFamily: 'monospace', fontSize: '0.8rem' }}>{b.reference}</td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ fontWeight: 600, color: '#1a2456' }}>{b.name}</div>
                                                        <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{b.email}</div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', color: '#374151', maxWidth: '180px' }}>{b.service}</td>
                                                    <td style={{ padding: '0.85rem 1rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{b.date}</td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <span style={{ background: STATUS_COLORS[b.status]?.bg || '#f3f4f6', color: STATUS_COLORS[b.status]?.color || '#374151', padding: '0.28rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{b.status}</span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }} onClick={e => e.stopPropagation()}>
                                                        <select value={b.status} onChange={e => updateBookingStatus(b.reference, e.target.value)} disabled={updatingBooking === b.reference}
                                                            style={{ padding: '0.35rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                        </div>
                    </>
                )}

                {/* ==================== VENDORS TAB ==================== */}
                {tab === 'vendors' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Total Vendors', value: vendors.length, color: '#1a2456' },
                                { label: 'Active', value: vendors.filter(v => v.status === 'active').length, color: '#15803d' },
                                { label: 'Pending Approval', value: pendingVendors.length, color: '#f97316' },
                                { label: 'Suspended', value: vendors.filter(v => v.status === 'suspended').length, color: '#dc2626' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {pendingVendors.length > 0 && (
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c2410c' }}>
                                <strong>{pendingVendors.length} vendor{pendingVendors.length > 1 ? 's' : ''} awaiting approval.</strong> Review and approve or reject below.
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {vendorsLoading ? <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> :
                                vendors.length === 0 ? <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No vendors yet</div> :
                                    vendors.map(v => (
                                        <div key={v.id} style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: `1px solid ${v.status === 'pending' ? '#fed7aa' : v.status === 'suspended' ? '#fecaca' : '#e5e7eb'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '1rem' }}>{v.business_name}</div>
                                                    <div style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.2rem' }}>{v.contact_name} · {v.email} · {v.phone}</div>
                                                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                                        Registered {new Date(v.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        {v.approved_at && ` · Approved ${new Date(v.approved_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}`}
                                                    </div>
                                                    {v.status === 'suspended' && v.suspension_reason && (
                                                        <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.35rem' }}>Reason: {v.suspension_reason}</div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        background: v.status === 'active' ? '#f0fdf4' : v.status === 'pending' ? '#fff7ed' : '#fef2f2',
                                                        color: v.status === 'active' ? '#15803d' : v.status === 'pending' ? '#c2410c' : '#dc2626',
                                                        padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                                                    }}>
                                                        {v.status === 'active' ? 'Active' : v.status === 'pending' ? 'Pending' : 'Suspended'}
                                                    </span>
                                                    {v.status === 'pending' && (
                                                        <button onClick={() => approveVendor(v)} disabled={updatingVendor === v.id}
                                                            style={{ background: '#15803d', color: 'white', border: 'none', padding: '0.45rem 1rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                            {updatingVendor === v.id ? '...' : '✓ Approve'}
                                                        </button>
                                                    )}
                                                    {v.status === 'active' && (
                                                        <button onClick={() => setSuspendModal(v)}
                                                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.45rem 1rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                            Suspend
                                                        </button>
                                                    )}
                                                    {v.status === 'suspended' && (
                                                        <button onClick={() => approveVendor(v)} disabled={updatingVendor === v.id}
                                                            style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.45rem 1rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                            {updatingVendor === v.id ? '...' : 'Reinstate'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                        </div>
                    </>
                )}

                {/* ==================== INVENTORY TAB ==================== */}
                {tab === 'inventory' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Total Products', value: products.length, color: '#1a2456' },
                                { label: 'Awaiting Check-in', value: pendingCheckins.length, color: '#f97316' },
                                { label: 'Checked In', value: products.filter(p => p.checkin_status === 'checked_in').length, color: '#15803d' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {pendingCheckins.length > 0 && (
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c2410c' }}>
                                <strong>{pendingCheckins.length} product{pendingCheckins.length > 1 ? 's' : ''} awaiting physical check-in.</strong> Verify goods received and enter actual quantity.
                            </div>
                        )}

                        <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #efefef', overflow: 'hidden' }}>
                            {productsLoading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> :
                                products.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No products yet</div> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f8f9ff', borderBottom: '1px solid #efefef' }}>
                                                {['Product', 'SKU', 'Space', 'Status', 'Stock', 'Confirm Check-in'].map(h => (
                                                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((p, i) => (
                                                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1a2456' }}>{p.name}</td>
                                                    <td style={{ padding: '0.85rem 1rem', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.sku || '—'}</td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <span style={{ background: p.space_type === 'pallet' ? '#fff3e8' : '#f0f3ff', color: p.space_type === 'pallet' ? '#c2410c' : '#1d4ed8', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                            {p.space_type === 'pallet' ? 'Pallet' : 'Shelf'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <span style={{ background: p.checkin_status === 'pending_checkin' ? '#fff7ed' : '#f0fdf4', color: p.checkin_status === 'pending_checkin' ? '#c2410c' : '#15803d', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                            {p.checkin_status === 'pending_checkin' ? 'Awaiting check-in' : 'Checked in'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#1a2456' }}>
                                                        {p.checkin_status === 'checked_in' ? `${p.quantity} units` : '—'}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        {p.checkin_status === 'pending_checkin' ? (
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    placeholder="Qty received"
                                                                    value={checkinQty[p.id] || ''}
                                                                    onChange={e => setCheckinQty(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                                    style={{ width: '110px', padding: '0.4rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit' }}
                                                                />
                                                                <button
                                                                    onClick={() => confirmCheckin(p)}
                                                                    disabled={checkingIn === p.id}
                                                                    style={{ background: '#15803d', color: 'white', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                                                                >
                                                                    {checkingIn === p.id ? '...' : '✓ Confirm'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                                                                {p.checked_in_quantity} units confirmed
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                        </div>
                    </>
                )}
            </div>

            {/* Booking detail modal */}
            {selectedBooking && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={() => setSelectedBooking(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>{selectedBooking.reference}</h2>
                            <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                            {[['Customer', selectedBooking.name], ['Email', selectedBooking.email], ['Phone', selectedBooking.phone], ['Business', selectedBooking.business], ['Service', selectedBooking.service], ['Date', selectedBooking.date], ['Notes', selectedBooking.notes]].filter(([, v]) => v).map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.38rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#666' }}>{k}</span>
                                    <span style={{ color: '#1a2456', fontWeight: 500, maxWidth: '260px', textAlign: 'right' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Update Status</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {STATUS_OPTIONS.map(s => (
                                    <button key={s} onClick={() => updateBookingStatus(selectedBooking.reference, s)} disabled={updatingBooking === selectedBooking.reference}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: `2px solid ${selectedBooking.status === s ? '#1a2456' : '#e2e8f0'}`, background: selectedBooking.status === s ? '#1a2456' : 'white', color: selectedBooking.status === s ? 'white' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {s}
                                    </button>
                                ))}
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
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                            You are about to suspend <strong>{suspendModal.business_name}</strong>. They will be blocked from logging in immediately.
                        </p>
                        <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Reason for suspension *</label>
                        <textarea
                            value={suspendReason}
                            onChange={e => setSuspendReason(e.target.value)}
                            placeholder="e.g. Unpaid invoices, fraudulent activity, policy violation..."
                            style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '1.25rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={suspendVendor} disabled={updatingVendor === suspendModal.id}
                                style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                {updatingVendor === suspendModal.id ? 'Suspending...' : 'Suspend Vendor'}
                            </button>
                            <button onClick={() => { setSuspendModal(null); setSuspendReason(''); }}
                                style={{ flex: 1, background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', padding: '0.85rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}