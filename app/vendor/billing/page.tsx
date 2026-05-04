'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

declare global { interface Window { PaystackPop: any; } }

type Invoice = {
    id: string;
    month: string;
    shelf_days: number;
    pallet_days: number;
    shelf_rate: number;
    pallet_rate: number;
    total_amount: number;
    status: string;
    paid_at: string | null;
    created_at: string;
};

export default function VendorBillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [vendorEmail, setVendorEmail] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        const email = localStorage.getItem('vendor_email') || '';
        if (!token || !id) { router.push('/vendor/login'); return; }
        setVendorEmail(email);
        loadInvoices(id, token);
    }, []);

    // Load Paystack script manually
    useEffect(() => {
        const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
        if (existing) return;
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    }, []);

    async function loadInvoices(id: string, token: string) {
        try {
            const res = await fetch(`/api/vendor/billing?vendor_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            setInvoices(Array.isArray(data) ? data : []);
        } catch { }
        setLoading(false);
    }

    function payInvoice(invoice: Invoice) {
        setError('');
        if (!window.PaystackPop) {
            setError('Payment system not loaded. Please refresh the page and try again.');
            return;
        }
        setPaying(invoice.id);
        const token = localStorage.getItem('vendor_token');

        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_6acba43a4893ab00f1a9618f7e84e5a471fe16ac',
            email: vendorEmail || 'vendor@sakzee.com',
            amount: Math.round(invoice.total_amount * 100),
            currency: 'GHS',
            ref: `SINV-${invoice.id}-${Date.now()}`,
            metadata: {
                custom_fields: [
                    { display_name: 'Invoice', variable_name: 'invoice_id', value: invoice.id },
                    { display_name: 'Month', variable_name: 'month', value: invoice.month },
                ],
            },
            callback: function () {
                fetch(`/api/vendor/billing?id=${invoice.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString() }),
                }).then(() => {
                    setInvoices(prev => prev.map(inv =>
                        inv.id === invoice.id
                            ? { ...inv, status: 'paid', paid_at: new Date().toISOString() }
                            : inv
                    ));
                    setPaying(null);
                }).catch(() => {
                    setPaying(null);
                });
            },
            onClose: function () {
                setPaying(null);
            },
        });
        handler.openIframe();
    }

    const totalUnpaid = invoices
        .filter(i => i.status === 'unpaid')
        .reduce((sum, i) => sum + i.total_amount, 0);

    const totalPaid = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0);

    function formatMonth(month: string) {
        const [year, m] = month.split('-');
        const date = new Date(Number(year), Number(m) - 1);
        return date.toLocaleDateString('en-GH', { month: 'long', year: 'numeric' });
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>

            <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/vendor/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
                    sak<span style={{ color: '#f97316' }}>zee</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link href="/vendor/dashboard" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Dashboard</Link>
                    <Link href="/vendor/inventory" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Inventory</Link>
                    <Link href="/vendor/orders" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.88rem' }}>Orders</Link>
                </div>
            </nav>

            <div style={{ maxWidth: '860px', margin: '2rem auto', padding: '0 1rem' }}>

                <div style={{ marginBottom: '1.75rem' }}>
                    <h1 style={{ color: '#1a2456', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Storage Billing</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Monthly storage invoices — billed daily based on occupied shelf and pallet spaces
                    </p>
                </div>

                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        {
                            label: 'Outstanding Balance',
                            value: `GHS ${totalUnpaid.toFixed(2)}`,
                            color: totalUnpaid > 0 ? '#dc2626' : '#15803d',
                            bg: totalUnpaid > 0 ? '#fef2f2' : '#f0fdf4',
                            border: totalUnpaid > 0 ? '#fecaca' : '#bbf7d0',
                        },
                        { label: 'Total Paid', value: `GHS ${totalPaid.toFixed(2)}`, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
                        { label: 'Total Invoices', value: String(invoices.length), color: '#1a2456', bg: '#f0f3ff', border: '#c7d2fe' },
                        {
                            label: 'Unpaid Invoices',
                            value: String(invoices.filter(i => i.status === 'unpaid').length),
                            color: invoices.filter(i => i.status === 'unpaid').length > 0 ? '#dc2626' : '#15803d',
                            bg: '#f8f9ff',
                            border: '#e2e8f0',
                        },
                    ].map(s => (
                        <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '1.1rem 1.25rem', border: `1px solid ${s.border}` }}>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.3rem' }}>{s.label}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>
                                {loading ? '...' : s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* How billing works */}
                <div style={{ background: '#f0f3ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#1d4ed8', lineHeight: 1.6 }}>
                    <strong>How storage billing works:</strong> Your inventory is counted daily. Each shelf space costs <strong>GHS 5/day</strong> and each pallet space costs <strong>GHS 12/day</strong>. Invoices are generated monthly and due by the end of each month.
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                        {error}
                    </div>
                )}

                {/* Invoices */}
                {loading ? (
                    <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                        Loading invoices...
                    </div>
                ) : invoices.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                            No invoices yet — invoices are generated once you store inventory
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {invoices.map(inv => (
                            <div key={inv.id} style={{
                                background: 'white', borderRadius: '14px', padding: '1.5rem',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                border: `1px solid ${inv.status === 'unpaid' ? '#fecaca' : '#e5e7eb'}`,
                            }}>

                                {/* Invoice header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#1a2456', fontSize: '1.1rem' }}>{formatMonth(inv.month)}</div>
                                        <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                                            {inv.status === 'paid' && inv.paid_at
                                                ? `Paid on ${new Date(inv.paid_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                : 'Payment due end of month'}
                                        </div>
                                    </div>
                                    <span style={{
                                        background: inv.status === 'paid' ? '#f0fdf4' : '#fef2f2',
                                        color: inv.status === 'paid' ? '#15803d' : '#dc2626',
                                        padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                                    }}>
                                        {inv.status === 'paid' ? '✓ Paid' : 'Unpaid'}
                                    </span>
                                </div>

                                {/* Breakdown */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <div style={{ background: '#f0f3ff', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                                        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.35rem' }}>Shelf Space</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.95rem' }}>{inv.shelf_days} shelf-days</div>
                                                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>@ GHS {inv.shelf_rate}/day</div>
                                            </div>
                                            <div style={{ fontWeight: 800, color: '#1a2456', fontSize: '1rem' }}>
                                                GHS {(inv.shelf_days * inv.shelf_rate).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff3e8', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                                        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.35rem' }}>Pallet Space</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.95rem' }}>{inv.pallet_days} pallet-days</div>
                                                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>@ GHS {inv.pallet_rate}/day</div>
                                            </div>
                                            <div style={{ fontWeight: 800, color: '#1a2456', fontSize: '1rem' }}>
                                                GHS {(inv.pallet_days * inv.pallet_rate).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Total and pay button */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Total Amount</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: inv.status === 'unpaid' ? '#dc2626' : '#15803d' }}>
                                            GHS {inv.total_amount.toFixed(2)}
                                        </div>
                                    </div>
                                    {inv.status === 'unpaid' && (
                                        <button
                                            onClick={() => payInvoice(inv)}
                                            disabled={paying === inv.id}
                                            style={{
                                                background: paying === inv.id ? '#ccc' : '#f97316',
                                                color: 'white', border: 'none',
                                                padding: '0.8rem 1.75rem', borderRadius: '9px',
                                                fontWeight: 700, fontSize: '0.95rem',
                                                cursor: paying === inv.id ? 'not-allowed' : 'pointer',
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            {paying === inv.id ? 'Processing...' : `Pay GHS ${inv.total_amount.toFixed(2)}`}
                                        </button>
                                    )}
                                    {inv.status === 'paid' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 600, fontSize: '0.9rem' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Payment received
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}