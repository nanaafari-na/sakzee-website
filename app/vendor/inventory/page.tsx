'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VendorNav from '@/components/VendorNav';

type Product = {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    space_type: string;
    low_stock_threshold: number;
    checkin_status: string;
    checked_in_quantity: number;
    checked_in_at: string | null;
    created_at: string;
};

export default function VendorInventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        if (!token || !id) { router.push('/vendor/login'); return; }
        loadProducts(id, token);
    }, []);

    async function loadProducts(id: string, token: string) {
        try {
            const res = await fetch(`/api/vendor/products?vendor_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch { }
        setLoading(false);
    }

    async function deleteProduct(productId: string) {
        if (!confirm('Delete this product?')) return;
        setDeleting(productId);
        const token = localStorage.getItem('vendor_token');
        try {
            await fetch(`/api/vendor/products?id=${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch { alert('Failed to delete'); }
        setDeleting(null);
    }

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    function getCheckinBadge(p: Product) {
        if (p.checkin_status === 'pending_checkin') return { bg: '#fff7ed', color: '#c2410c', label: 'Awaiting check-in' };
        if (p.checkin_status === 'checked_in') return { bg: '#f0fdf4', color: '#15803d', label: 'Checked in' };
        return { bg: '#f3f4f6', color: '#374151', label: p.checkin_status };
    }

    function getStockBadge(p: Product) {
        if (p.checkin_status === 'pending_checkin') return { bg: '#fff7ed', color: '#c2410c', label: 'Pending' };
        if (p.quantity === 0) return { bg: '#fef2f2', color: '#dc2626', label: 'Out of stock' };
        if (p.quantity <= p.low_stock_threshold) return { bg: '#fff7ed', color: '#c2410c', label: 'Low stock' };
        return { bg: '#f0fdf4', color: '#15803d', label: 'In stock' };
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
        @media (max-width: 640px) {
          .inv-header { flex-direction: column !important; align-items: flex-start !important; }
          .inv-table-wrap { display: none !important; }
          .inv-cards { display: flex !important; }
        }
        @media (min-width: 641px) {
          .inv-cards { display: none !important; }
        }
      `}</style>

            <VendorNav />

            <div style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1rem' }}>
                <div className="inv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                    <div>
                        <h1 style={{ color: '#1a2456', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Inventory</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.25rem' }}>{products.length} products stored with Sakzee</p>
                    </div>
                    <Link href="/vendor/inventory/add" style={{ background: '#1a2456', color: 'white', padding: '0.65rem 1.25rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' as const }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Product
                    </Link>
                </div>

                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.9rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#c2410c', lineHeight: 1.6 }}>
                    <strong>Check-in flow:</strong> New products show as <strong>Awaiting check-in</strong> until Sakzee warehouse staff confirms receipt. Only checked-in products can be used for orders.
                </div>

                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, SKU or category..."
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', marginBottom: '1.25rem', boxSizing: 'border-box' as const, background: 'white' }}
                />

                {/* DESKTOP TABLE */}
                <div className="inv-table-wrap" style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: '#9ca3af', marginBottom: '1rem', fontSize: '0.9rem' }}>{search ? 'No products match your search' : 'No products yet'}</p>
                            {!search && <Link href="/vendor/inventory/add" style={{ background: '#1a2456', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>Add First Product</Link>}
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#f8f9ff', borderBottom: '1px solid #efefef' }}>
                                    {['Product', 'SKU', 'Space', 'Stock', 'Status', 'Checked In', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, i) => {
                                    const checkin = getCheckinBadge(p);
                                    const stock = getStockBadge(p);
                                    return (
                                        <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <div style={{ fontWeight: 600, color: '#1a2456' }}>{p.name}</div>
                                                {p.category && <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.category}</div>}
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.sku || '—'}</td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <span style={{ background: p.space_type === 'pallet' ? '#fff3e8' : '#f0f3ff', color: p.space_type === 'pallet' ? '#c2410c' : '#1d4ed8', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {p.space_type === 'pallet' ? 'Pallet' : 'Shelf'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <span style={{ background: stock.bg, color: stock.color, padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                    {p.checkin_status === 'pending_checkin' ? 'Pending' : `${p.quantity} units`}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <span style={{ background: checkin.bg, color: checkin.color, padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                    {checkin.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem', color: '#374151', fontSize: '0.82rem' }}>
                                                {p.checkin_status === 'checked_in' && p.checked_in_at
                                                    ? new Date(p.checked_in_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })
                                                    : '—'}
                                            </td>
                                            <td style={{ padding: '0.9rem 1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <Link href={`/vendor/inventory/edit/${p.id}`} style={{ color: '#1a2456', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.7rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>Edit</Link>
                                                    <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id} style={{ color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                        {deleting === p.id ? '...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* MOBILE CARDS */}
                <div className="inv-cards" style={{ display: 'none', flexDirection: 'column', gap: '0.85rem' }}>
                    {loading ? (
                        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ background: 'white', borderRadius: '12px', padding: '2.5rem', textAlign: 'center' }}>
                            <p style={{ color: '#9ca3af', marginBottom: '1rem', fontSize: '0.9rem' }}>{search ? 'No products match' : 'No products yet'}</p>
                            {!search && <Link href="/vendor/inventory/add" style={{ background: '#1a2456', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>Add First Product</Link>}
                        </div>
                    ) : filtered.map(p => {
                        const checkin = getCheckinBadge(p);
                        const stock = getStockBadge(p);
                        return (
                            <div key={p.id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #efefef', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.95rem' }}>{p.name}</div>
                                        {p.category && <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.15rem' }}>{p.category}</div>}
                                        {p.sku && <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontFamily: 'monospace' }}>SKU: {p.sku}</div>}
                                    </div>
                                    <span style={{ background: p.space_type === 'pallet' ? '#fff3e8' : '#f0f3ff', color: p.space_type === 'pallet' ? '#c2410c' : '#1d4ed8', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                                        {p.space_type === 'pallet' ? 'Pallet' : 'Shelf'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <span style={{ background: checkin.bg, color: checkin.color, padding: '0.22rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{checkin.label}</span>
                                    <span style={{ background: stock.bg, color: stock.color, padding: '0.22rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                        {p.checkin_status === 'pending_checkin' ? 'Pending stock' : `${p.quantity} units`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link href={`/vendor/inventory/edit/${p.id}`} style={{ flex: 1, textAlign: 'center', color: '#1a2456', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, padding: '0.55rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>Edit</Link>
                                    <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id} style={{ flex: 1, color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.55rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {deleting === p.id ? '...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}