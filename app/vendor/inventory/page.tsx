'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
        if (p.checkin_status === 'pending_checkin') {
            return { bg: '#fff7ed', color: '#c2410c', label: 'Awaiting check-in' };
        }
        if (p.checkin_status === 'checked_in') {
            return { bg: '#f0fdf4', color: '#15803d', label: 'Checked in' };
        }
        return { bg: '#f3f4f6', color: '#374151', label: p.checkin_status };
    }

    function getStockBadge(p: Product) {
        if (p.checkin_status === 'pending_checkin') {
            return { bg: '#fff7ed', color: '#c2410c', label: 'Pending warehouse receipt' };
        }
        if (p.quantity === 0) return { bg: '#fef2f2', color: '#dc2626', label: 'Out of stock' };
        if (p.quantity <= p.low_stock_threshold) return { bg: '#fff7ed', color: '#c2410c', label: 'Low stock' };
        return { bg: '#f0fdf4', color: '#15803d', label: 'In stock' };
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/vendor/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/vendor/dashboard" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Dashboard</Link>
                    <Link href="/vendor/orders" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Orders</Link>
                    <Link href="/vendor/billing" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Billing</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Inventory</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>{products.length} products stored with Sakzee</p>
                    </div>
                    <Link href="/vendor/inventory/add" style={{ background: '#1a2456', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Product
                    </Link>
                </div>

                {/* Check-in info banner */}
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.9rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c2410c', lineHeight: 1.6 }}>
                    <strong>How inventory check-in works:</strong> When you add a product, Sakzee warehouse staff will physically verify and count the goods. Your available stock is updated once they confirm receipt. Products showing <strong>Awaiting check-in</strong> cannot be used for orders yet.
                </div>

                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, SKU or category..."
                    style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', marginBottom: '1.25rem', boxSizing: 'border-box', background: 'white' }}
                />

                <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading inventory...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: '#9ca3af', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                {search ? 'No products match your search' : 'No products yet — add your first product'}
                            </p>
                            {!search && (
                                <Link href="/vendor/inventory/add" style={{ background: '#1a2456', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                                    Add First Product
                                </Link>
                            )}
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#f8f9ff', borderBottom: '1px solid #efefef' }}>
                                    {['Product', 'SKU', 'Space Type', 'Stock', 'Warehouse Status', 'Checked In', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
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
                                                    <Link href={`/vendor/inventory/edit/${p.id}`} style={{ color: '#1a2456', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.7rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteProduct(p.id)}
                                                        disabled={deleting === p.id}
                                                        style={{ color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                                    >
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
            </div>
        </div>
    );
}