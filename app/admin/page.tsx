'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATUS_OPTIONS = ['Received', 'Processing', 'Packed', 'Shipped', 'Delivered'];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    Received: { bg: '#eff6ff', color: '#1d4ed8' },
    Processing: { bg: '#fff7ed', color: '#c2410c' },
    Packed: { bg: '#f5f3ff', color: '#6d28d9' },
    Shipped: { bg: '#ecfeff', color: '#0e7490' },
    Delivered: { bg: '#f0fdf4', color: '#15803d' },
};

type Booking = {
    id: string;
    reference: string;
    name: string;
    email: string;
    phone: string;
    business: string;
    service: string;
    date: string;
    notes: string;
    status: string;
    paid_at: string;
};

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState('');
    const [pwError, setPwError] = useState('');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selected, setSelected] = useState<Booking | null>(null);

    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'sakzee2025';

    function handleLogin() {
        if (password === ADMIN_PASSWORD) {
            setAuthed(true);
            loadBookings();
        } else {
            setPwError('Incorrect password. Please try again.');
        }
    }

    async function loadBookings() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch { setBookings([]); }
        setLoading(false);
    }

    async function updateStatus(reference: string, status: string) {
        setUpdating(reference);
        try {
            await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference, status }),
            });
            setBookings(prev => prev.map(b => b.reference === reference ? { ...b, status } : b));
            if (selected?.reference === reference) setSelected(prev => prev ? { ...prev, status } : null);
        } catch { alert('Failed to update status. Please try again.'); }
        setUpdating(null);
    }

    const filtered = bookings.filter(b => {
        const matchSearch = search === '' || b.name.toLowerCase().includes(search.toLowerCase()) || b.reference.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || b.status === filterStatus;
        return matchSearch && matchStatus;
    });

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
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        placeholder="Enter admin password"
                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '0.75rem' }}
                    />
                    {pwError && <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{pwError}</div>}
                    <button onClick={handleLogin} style={{ width: '100%', background: '#1a2456', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                        Log In
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>← Back to website</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span> <span style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.6 }}>Admin</span></div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={loadBookings} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.45rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Refresh
                    </button>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>← Website</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
                {/* Stats */}
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

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, email or reference..."
                        style={{ flex: 1, minWidth: '200px', padding: '0.65rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                    />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.65rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', background: 'white' }}>
                        <option>All</option>
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #efefef', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading bookings...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No bookings found</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#f8f9ff', borderBottom: '1px solid #efefef' }}>
                                    {['Reference', 'Customer', 'Service', 'Date', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((b, i) => (
                                    <tr key={b.reference} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer' }} onClick={() => setSelected(b)}>
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
                                            <select
                                                value={b.status}
                                                onChange={e => updateStatus(b.reference, e.target.value)}
                                                disabled={updating === b.reference}
                                                style={{ padding: '0.35rem 0.65rem', border: '1.5px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Detail modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={() => setSelected(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Booking Details</h2>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.25rem', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1.1rem', marginBottom: '1.25rem' }}>
                            {[
                                ['Reference', selected.reference],
                                ['Name', selected.name],
                                ['Email', selected.email],
                                ['Phone', selected.phone],
                                selected.business && ['Business', selected.business],
                                ['Service', selected.service],
                                ['Start Date', selected.date],
                                selected.notes && ['Notes', selected.notes],
                                ['Booked On', new Date(selected.paid_at).toLocaleString('en-GH')],
                            ].filter(Boolean).map(([k, v]) => (
                                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#6b7280' }}>{k as string}</span>
                                    <span style={{ color: '#1a2456', fontWeight: 500, maxWidth: '260px', textAlign: 'right' }}>{v as string}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Update Status</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {STATUS_OPTIONS.map(s => (
                                    <button key={s} onClick={() => updateStatus(selected.reference, s)} disabled={updating === selected.reference}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: `2px solid ${selected.status === s ? '#1a2456' : '#e2e8f0'}`, background: selected.status === s ? '#1a2456' : 'white', color: selected.status === s ? 'white' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
