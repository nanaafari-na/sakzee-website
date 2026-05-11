'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VendorNav from '@/components/VendorNav';

type Stats = { total_products: number; total_orders: number; pending_orders: number; storage_due: number; };
type Order = { id: string; reference: string; status: string; delivery_address: string; delivery_fee: number; created_at: string; };
type Invoice = { id: string; month: string; total_amount: number; status: string; };

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    Pending: { bg: '#eff6ff', color: '#1d4ed8' },
    Processing: { bg: '#fff7ed', color: '#c2410c' },
    Packed: { bg: '#f5f3ff', color: '#6d28d9' },
    Shipped: { bg: '#ecfeff', color: '#0e7490' },
    Delivered: { bg: '#f0fdf4', color: '#15803d' },
};

export default function VendorDashboard() {
    const [vendorName, setVendorName] = useState('');
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        const name = localStorage.getItem('vendor_name');
        if (!token || !id) { router.push('/vendor/login'); return; }
        setVendorName(name || '');
        loadDashboard(id, token);
    }, []);

    async function loadDashboard(id: string, token: string, isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await fetch(`/api/vendor/dashboard?vendor_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            setStats(data.stats);
            setRecentOrders(data.recent_orders || []);
            setInvoices(data.invoices || []);
        } catch { }
        setLoading(false);
        setRefreshing(false);
    }

    function handleRefresh() {
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        if (token && id) loadDashboard(id, token, true);
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
        @media (max-width: 640px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-panels { grid-template-columns: 1fr !important; }
          .dash-actions { flex-direction: column !important; }
          .dash-actions a, .dash-actions button { text-align: center; justify-content: center; }
        }
        @media (max-width: 380px) {
          .dash-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>

            <VendorNav />

            <div style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1rem' }}>

                {/* Header with refresh */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ color: '#1a2456', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                            Welcome back, {vendorName || 'Vendor'}
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.25rem' }}>Here is a summary of your account</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', color: '#1a2456', border: '1.5px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px', cursor: refreshing ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>

                {/* Stats */}
                <div className="dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Products', value: stats?.total_products ?? '—', color: '#1a2456', link: '/vendor/inventory' },
                        { label: 'Total Orders', value: stats?.total_orders ?? '—', color: '#3b82f6', link: '/vendor/orders' },
                        { label: 'Pending Orders', value: stats?.pending_orders ?? '—', color: '#f97316', link: '/vendor/orders' },
                        { label: 'Storage Due (GHS)', value: stats?.storage_due !== undefined ? Number(stats.storage_due).toFixed(2) : '—', color: '#22c55e', link: '/vendor/billing' },
                    ].map(s => (
                        <Link key={s.label} href={s.link} style={{ textDecoration: 'none' }}>
                            <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef', transition: 'box-shadow 0.15s' }}>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.3rem' }}>{s.label}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{loading ? '...' : s.value}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Panels */}
                <div className="dash-panels" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

                    {/* Recent Orders */}
                    <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ color: '#1a2456', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Orders</h2>
                            <Link href="/vendor/orders" style={{ color: '#f97316', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>View all →</Link>
                        </div>
                        {loading ? <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading...</p> :
                            recentOrders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>No orders yet</p>
                                    <Link href="/vendor/orders/new" style={{ background: '#1a2456', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Create First Order
                                    </Link>
                                </div>
                            ) : recentOrders.map(o => (
                                <div key={o.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.82rem', fontFamily: 'monospace' }}>{o.reference}</div>
                                            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.15rem' }}>{o.delivery_address}</div>
                                        </div>
                                        <span style={{ background: STATUS_COLORS[o.status]?.bg || '#f3f4f6', color: STATUS_COLORS[o.status]?.color || '#374151', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                                            {o.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Storage Invoices */}
                    <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ color: '#1a2456', fontSize: '1rem', fontWeight: 700, margin: 0 }}>Storage Invoices</h2>
                            <Link href="/vendor/billing" style={{ color: '#f97316', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>View all →</Link>
                        </div>
                        {loading ? <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Loading...</p> :
                            invoices.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No invoices yet</p>
                                </div>
                            ) : invoices.map(inv => (
                                <div key={inv.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1a2456', fontSize: '0.875rem' }}>{inv.month}</div>
                                        <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>GHS {Number(inv.total_amount).toFixed(2)}</div>
                                    </div>
                                    <span style={{ background: inv.status === 'paid' ? '#f0fdf4' : '#fef2f2', color: inv.status === 'paid' ? '#15803d' : '#dc2626', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                                        {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dash-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link href="/vendor/inventory/add" style={{ background: '#1a2456', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Inventory
                    </Link>
                    <Link href="/vendor/orders/new" style={{ background: '#f97316', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Create Order
                    </Link>
                    <Link href="/vendor/billing" style={{ background: 'white', color: '#1a2456', padding: '0.75rem 1.5rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1.5px solid #e2e8f0' }}>
                        View Billing
                    </Link>
                </div>
            </div>
        </div>
    );
}