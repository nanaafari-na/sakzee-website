'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type ReportData = {
    summary: {
        total_bookings: number;
        total_vendor_orders: number;
        total_vendors: number;
        total_delivery_revenue: number;
        total_storage_revenue: number;
        total_storage_outstanding: number;
        total_revenue: number;
    };
    bookings: { by_status: Record<string, number>; by_service: Record<string, number> };
    orders: { by_status: Record<string, number>; by_region: Record<string, number> };
    vendors: { active: number; pending: number; suspended: number };
    inventory: { total: number; checked_in: number; pending_checkin: number; low_stock: number; out_of_stock: number; shelf_spaces: number; pallet_spaces: number };
    storage: { revenue: number; outstanding: number; invoices: { paid: number; unpaid: number } };
    trends: {
        monthly_bookings: { month: string; count: number }[];
        monthly_orders: { month: string; count: number; revenue: number }[];
        monthly_storage: { month: string; revenue: number }[];
    };
    top_vendors: { business_name: string; count: number }[];
};

function formatMonth(m: string) {
    const [y, mo] = m.split('-');
    return new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-GH', { month: 'short', year: '2-digit' });
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
        </div>
    );
}

export default function AdminReportsPage() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState('');
    const [pwError, setPwError] = useState('');
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'orders' | 'vendors' | 'storage'>('overview');

    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'sakzee2025';

    async function handleLogin() {
        if (password !== ADMIN_PASSWORD) { setPwError('Incorrect password.'); return; }
        setAuthed(true);
        loadReports();
    }

    async function loadReports() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/reports');
            const d = await res.json();
            setData(d);
        } catch { }
        setLoading(false);
    }

    function TabBtn({ id, label }: { id: typeof activeTab; label: string }) {
        return (
            <button onClick={() => setActiveTab(id)} style={{ background: activeTab === id ? '#1a2456' : 'white', color: activeTab === id ? 'white' : '#6b7280', border: '1.5px solid', borderColor: activeTab === id ? '#1a2456' : '#e2e8f0', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                {label}
            </button>
        );
    }

    if (!authed) return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '380px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a2456', marginBottom: '0.25rem' }}>sak<span style={{ color: '#f97316' }}>zee</span></div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2456' }}>Reports</div>
                    <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>Admin access only</div>
                </div>
                <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter admin password"
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', marginBottom: '0.75rem' }} />
                {pwError && <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{pwError}</div>}
                <button onClick={handleLogin} style={{ width: '100%', background: '#1a2456', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}>View Reports</button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link href="/admin" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.82rem' }}>← Back to Admin Panel</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span> <span style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.6 }}>Reports</span></div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={loadReports} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.45rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>Refresh</button>
                    <Link href="/admin" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>← Admin Panel</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Business Reports</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>Full overview of Sakzee operations</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <TabBtn id="overview" label="Overview" />
                        <TabBtn id="bookings" label="Bookings" />
                        <TabBtn id="orders" label="Deliveries" />
                        <TabBtn id="vendors" label="Vendors" />
                        <TabBtn id="storage" label="Storage" />
                    </div>
                </div>

                {loading && <div style={{ background: 'white', borderRadius: '14px', padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>Loading reports...</div>}

                {!loading && data && <>

                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && <>
                        {/* Revenue cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Total Revenue', value: `GHS ${data.summary.total_revenue.toFixed(2)}`, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: '💰' },
                                { label: 'Delivery Revenue', value: `GHS ${data.summary.total_delivery_revenue.toFixed(2)}`, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: '🚚' },
                                { label: 'Storage Revenue', value: `GHS ${data.summary.total_storage_revenue.toFixed(2)}`, color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe', icon: '🏭' },
                                { label: 'Outstanding', value: `GHS ${data.summary.total_storage_outstanding.toFixed(2)}`, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '⚠️' },
                            ].map(s => (
                                <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '1.25rem', border: `1px solid ${s.border}` }}>
                                    <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{s.icon}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.3rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Activity summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Client Bookings', value: data.summary.total_bookings, color: '#1a2456' },
                                { label: 'Vendor Orders', value: data.summary.total_vendor_orders, color: '#f97316' },
                                { label: 'Active Vendors', value: data.vendors.active, color: '#15803d' },
                                { label: 'Products Stored', value: data.inventory.checked_in, color: '#6d28d9' },
                            ].map(s => (
                                <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Monthly trends */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                            {/* Delivery revenue trend */}
                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Monthly Delivery Revenue</h3>
                                {(() => {
                                    const maxRev = Math.max(...data.trends.monthly_orders.map(m => m.revenue), 1);
                                    return data.trends.monthly_orders.map(m => (
                                        <div key={m.month} style={{ marginBottom: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#6b7280' }}>{formatMonth(m.month)}</span>
                                                <span style={{ fontWeight: 700, color: '#1a2456' }}>GHS {m.revenue.toFixed(0)}</span>
                                            </div>
                                            <Bar value={m.revenue} max={maxRev} color="#f97316" />
                                        </div>
                                    ));
                                })()}
                            </div>

                            {/* Storage revenue trend */}
                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Monthly Storage Revenue</h3>
                                {(() => {
                                    const maxRev = Math.max(...data.trends.monthly_storage.map(m => m.revenue), 1);
                                    return data.trends.monthly_storage.map(m => (
                                        <div key={m.month} style={{ marginBottom: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#6b7280' }}>{formatMonth(m.month)}</span>
                                                <span style={{ fontWeight: 700, color: '#1a2456' }}>GHS {m.revenue.toFixed(0)}</span>
                                            </div>
                                            <Bar value={m.revenue} max={maxRev} color="#6d28d9" />
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Top vendors */}
                        {data.top_vendors.length > 0 && (
                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Top Vendors by Orders</h3>
                                {(() => {
                                    const max = Math.max(...data.top_vendors.map(v => v.count), 1);
                                    return data.top_vendors.map((v, i) => (
                                        <div key={v.business_name} style={{ marginBottom: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.875rem' }}>
                                                <span style={{ color: '#374151', fontWeight: 600 }}>{i + 1}. {v.business_name}</span>
                                                <span style={{ fontWeight: 700, color: '#1a2456' }}>{v.count} orders</span>
                                            </div>
                                            <Bar value={v.count} max={max} color="#1a2456" />
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                    </>}

                    {/* ── BOOKINGS ── */}
                    {activeTab === 'bookings' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Bookings by Status</h3>
                                {Object.entries(data.bookings.by_status).map(([status, count]) => {
                                    const max = Math.max(...Object.values(data.bookings.by_status), 1);
                                    return (
                                        <div key={status} style={{ marginBottom: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.875rem' }}>
                                                <span style={{ color: '#374151' }}>{status}</span>
                                                <span style={{ fontWeight: 700, color: '#1a2456' }}>{count}</span>
                                            </div>
                                            <Bar value={count} max={max} color="#3b82f6" />
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Bookings by Service</h3>
                                {Object.entries(data.bookings.by_service).length === 0
                                    ? <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No data yet</p>
                                    : Object.entries(data.bookings.by_service).sort(([, a], [, b]) => b - a).map(([svc, count]) => {
                                        const max = Math.max(...Object.values(data.bookings.by_service), 1);
                                        return (
                                            <div key={svc} style={{ marginBottom: '0.85rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.875rem' }}>
                                                    <span style={{ color: '#374151', maxWidth: '200px' }}>{svc}</span>
                                                    <span style={{ fontWeight: 700, color: '#1a2456' }}>{count}</span>
                                                </div>
                                                <Bar value={count} max={max} color="#f97316" />
                                            </div>
                                        );
                                    })}
                            </div>

                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Monthly Booking Volume</h3>
                                {(() => {
                                    const max = Math.max(...data.trends.monthly_bookings.map(m => m.count), 1);
                                    return data.trends.monthly_bookings.map(m => (
                                        <div key={m.month} style={{ marginBottom: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                                                <span style={{ color: '#6b7280' }}>{formatMonth(m.month)}</span>
                                                <span style={{ fontWeight: 700, color: '#1a2456' }}>{m.count} bookings</span>
                                            </div>
                                            <Bar value={m.count} max={max} color="#1a2456" />
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </>}

                    {/* ── ORDERS ── */}
                    {activeTab === 'orders' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Orders by Status</h3>
                                {Object.entries(data.orders.by_status).map(([status, count]) => {
                                    const max = Math.max(...Object.values(data.orders.by_status), 1);
                                    return (
                                        <div key={status} style={{ marginBottom: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.875rem' }}>
                                                <span style={{ color: '#374151' }}>{status}</span>
                                                <span style={{ fontWeight: 700, color: '#1a2456' }}>{count}</span>
                                            </div>
                                            <Bar value={count} max={max} color="#0e7490" />
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Orders by Region</h3>
                                {Object.entries(data.orders.by_region).length === 0
                                    ? <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No data yet</p>
                                    : Object.entries(data.orders.by_region).sort(([, a], [, b]) => b - a).map(([region, count]) => {
                                        const max = Math.max(...Object.values(data.orders.by_region), 1);
                                        return (
                                            <div key={region} style={{ marginBottom: '0.85rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.875rem' }}>
                                                    <span style={{ color: '#374151' }}>{region}</span>
                                                    <span style={{ fontWeight: 700, color: '#1a2456' }}>{count}</span>
                                                </div>
                                                <Bar value={count} max={max} color="#f97316" />
                                            </div>
                                        );
                                    })}
                            </div>

                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Monthly Order Volume & Revenue</h3>
                                {data.trends.monthly_orders.map(m => (
                                    <div key={m.month} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                                            <span style={{ color: '#6b7280', fontWeight: 600 }}>{formatMonth(m.month)}</span>
                                            <span style={{ fontWeight: 700, color: '#f97316' }}>GHS {m.revenue.toFixed(0)}</span>
                                        </div>
                                        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.3rem' }}>{m.count} orders</div>
                                        <Bar value={m.revenue} max={Math.max(...data.trends.monthly_orders.map(x => x.revenue), 1)} color="#f97316" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>}

                    {/* ── VENDORS ── */}
                    {activeTab === 'vendors' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Vendor Account Status</h3>
                                {[{ label: 'Active', value: data.vendors.active, color: '#15803d', bg: '#f0fdf4' }, { label: 'Pending Approval', value: data.vendors.pending, color: '#c2410c', bg: '#fff7ed' }, { label: 'Suspended', value: data.vendors.suspended, color: '#dc2626', bg: '#fef2f2' }].map(s => (
                                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: s.bg, borderRadius: '10px', marginBottom: '0.65rem' }}>
                                        <span style={{ color: '#374151', fontWeight: 600, fontSize: '0.9rem' }}>{s.label}</span>
                                        <span style={{ fontWeight: 800, color: s.color, fontSize: '1.25rem' }}>{s.value}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem 0', borderTop: '1px solid #f3f4f6', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Total Vendors</span>
                                    <span style={{ fontWeight: 800, color: '#1a2456', fontSize: '1.1rem' }}>{data.summary.total_vendors}</span>
                                </div>
                            </div>

                            {data.top_vendors.length > 0 && (
                                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                    <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Most Active Vendors</h3>
                                    {data.top_vendors.map((v, i) => {
                                        const max = Math.max(...data.top_vendors.map(x => x.count), 1);
                                        return (
                                            <div key={v.business_name} style={{ marginBottom: '0.85rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.875rem' }}>
                                                    <span style={{ color: '#374151', fontWeight: 600 }}>{i + 1}. {v.business_name}</span>
                                                    <span style={{ fontWeight: 700, color: '#1a2456' }}>{v.count} orders</span>
                                                </div>
                                                <Bar value={v.count} max={max} color="#1a2456" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>}

                    {/* ── STORAGE ── */}
                    {activeTab === 'storage' && <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                            {[
                                { label: 'Storage Revenue Collected', value: `GHS ${data.storage.revenue.toFixed(2)}`, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
                                { label: 'Outstanding Balance', value: `GHS ${data.storage.outstanding.toFixed(2)}`, color: data.storage.outstanding > 0 ? '#dc2626' : '#15803d', bg: data.storage.outstanding > 0 ? '#fef2f2' : '#f0fdf4', border: data.storage.outstanding > 0 ? '#fecaca' : '#bbf7d0' },
                                { label: 'Paid Invoices', value: String(data.storage.invoices.paid), color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
                                { label: 'Unpaid Invoices', value: String(data.storage.invoices.unpaid), color: data.storage.invoices.unpaid > 0 ? '#dc2626' : '#15803d', bg: data.storage.invoices.unpaid > 0 ? '#fef2f2' : '#f0fdf4', border: data.storage.invoices.unpaid > 0 ? '#fecaca' : '#bbf7d0' },
                            ].map(s => (
                                <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '1.25rem', border: `1px solid ${s.border}` }}>
                                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.3rem' }}>{s.label}</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Warehouse Occupancy</h3>
                                {[
                                    { label: 'Total Products', value: data.inventory.total, color: '#1a2456' },
                                    { label: 'Checked In', value: data.inventory.checked_in, color: '#15803d' },
                                    { label: 'Awaiting Check-in', value: data.inventory.pending_checkin, color: '#c2410c' },
                                    { label: 'Shelf Spaces Used', value: data.inventory.shelf_spaces, color: '#1d4ed8' },
                                    { label: 'Pallet Spaces Used', value: data.inventory.pallet_spaces, color: '#6d28d9' },
                                    { label: 'Low Stock Items', value: data.inventory.low_stock, color: '#f97316' },
                                    { label: 'Out of Stock', value: data.inventory.out_of_stock, color: '#dc2626' },
                                ].map(s => (
                                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#6b7280' }}>{s.label}</span>
                                        <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Monthly Storage Revenue</h3>
                                {data.trends.monthly_storage.map(m => (
                                    <div key={m.month} style={{ marginBottom: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                                            <span style={{ color: '#6b7280' }}>{formatMonth(m.month)}</span>
                                            <span style={{ fontWeight: 700, color: '#6d28d9' }}>GHS {m.revenue.toFixed(0)}</span>
                                        </div>
                                        <Bar value={m.revenue} max={Math.max(...data.trends.monthly_storage.map(x => x.revenue), 1)} color="#6d28d9" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>}
                </>}
            </div>
        </div>
    );
}