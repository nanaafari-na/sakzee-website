'use client';
import { useState, useEffect } from 'react';

type Rider = {
    id: string;
    name: string;
    phone: string;
    vehicle_type: string;
    license_plate: string;
    status: string;
    current_lat: number | null;
    current_lng: number | null;
    last_location_update: string | null;
};

type Booking = {
    reference: string;
    name: string;
    phone: string;
    pickup_address: string;
    delivery_address: string;
    status: string;
    delivery_fee: number;
    paid_at: string;
    booking_type: string;
};

const inp: React.CSSProperties = { width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456' };
const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.35rem' };

export default function AdminRidersPage() {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'riders' | 'assign'>('riders');
    const [showAddRider, setShowAddRider] = useState(false);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', phone: '', pin: '', vehicle_type: 'motorcycle', license_plate: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [selectedRiders, setSelectedRiders] = useState<Record<string, string>>({});
    const [showPin, setShowPin] = useState(false);
    const [assignedRefs, setAssignedRefs] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [ridersRes, bookingsRes] = await Promise.all([
                fetch('/api/admin/riders'),
                fetch('/api/admin/bookings'),
            ]);
            const [ridersData, bookingsData] = await Promise.all([ridersRes.json(), bookingsRes.json()]);
            setRiders(Array.isArray(ridersData) ? ridersData : []);
            setBookings(Array.isArray(bookingsData) ? bookingsData.filter((b: Booking) => b.booking_type === 'delivery' && ['Received', 'Processing', 'Packed'].includes(b.status)) : []);
        } catch { }
        setLoading(false);
    }

    async function addRider() {
        if (!form.name || !form.phone || !form.pin) { setError('Name, phone and PIN are required.'); return; }
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/admin/riders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add rider');
            setSuccess('Rider added successfully!');
            setShowAddRider(false);
            setForm({ name: '', phone: '', pin: '', vehicle_type: 'motorcycle', license_plate: '', email: '' });
            await loadData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e: any) {
            setError(e.message);
        }
        setSaving(false);
    }

    async function toggleRiderStatus(rider: Rider) {
        const newStatus = rider.status === 'active' ? 'inactive' : 'active';
        try {
            await fetch(`/api/admin/riders?id=${rider.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            setRiders(prev => prev.map(r => r.id === rider.id ? { ...r, status: newStatus } : r));
        } catch { }
    }

    async function assignRider(bookingReference: string, riderId: string) {
        if (!riderId) { setError('Please select a rider first.'); return; }
        setAssigning(bookingReference);
        setError('');
        try {
            const res = await fetch('/api/admin/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: bookingReference, rider_id: riderId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`);
            // Mark as assigned locally without reloading
            setAssignedRefs(prev => [...prev, bookingReference]);
            const riderName = riders.find(r => r.id === riderId)?.name || 'Rider';
            setSuccess(`✅ ${bookingReference} assigned to ${riderName}`);
            setTimeout(() => setSuccess(''), 4000);
        } catch (e: any) {
            setError(`Assignment failed: ${e.message}`);
        }
        setAssigning(null);
    }


    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <nav style={{ background: '#1a2456', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem' }}>sak<span style={{ color: '#f97316' }}>zee</span> <span style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.7 }}>Admin</span></div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="/admin" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.88rem' }}>← Admin Panel</a>
                </div>
            </nav>

            <div style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ color: '#1a2456', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Rider Management</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.25rem' }}>{riders.length} riders · {Math.max(0, bookings.length - assignedRefs.length)} unassigned deliveries</p>
                    </div>
                    <button onClick={() => setShowAddRider(true)} style={{ background: '#1a2456', color: 'white', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '9px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Rider
                    </button>
                </div>

                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>×</button></div>}
                {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem 1rem', color: '#15803d', fontSize: '0.875rem', marginBottom: '1rem' }}>✓ {success}</div>}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'white', padding: '0.4rem', borderRadius: '10px', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {[['riders', '🏍️ Riders'], ['assign', '📦 Assign Deliveries']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key as any)} style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', background: tab === key ? '#1a2456' : 'transparent', color: tab === key ? 'white' : '#6b7280' }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Riders tab */}
                {tab === 'riders' && (
                    loading ? <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> :
                        riders.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center' }}>
                                <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>No riders yet</p>
                                <button onClick={() => setShowAddRider(true)} style={{ background: '#1a2456', color: 'white', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Add First Rider</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {riders.map(rider => (
                                    <div key={rider.id} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '1rem' }}>{rider.name}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{rider.phone}</div>
                                            </div>
                                            <span style={{ background: rider.status === 'active' ? '#f0fdf4' : '#fef2f2', color: rider.status === 'active' ? '#15803d' : '#dc2626', padding: '0.22rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                {rider.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                            <span>🏍️ {rider.vehicle_type}</span>
                                            {rider.license_plate && <span>🪪 {rider.license_plate}</span>}
                                            {rider.last_location_update && (
                                                <span>📍 {new Date(rider.last_location_update).toLocaleTimeString()}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <a href={`tel:${rider.phone}`} style={{ flex: 1, background: '#f0f3ff', color: '#1a2456', padding: '0.55rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, textAlign: 'center' }}>📞 Call</a>
                                            <button onClick={() => toggleRiderStatus(rider)} style={{ flex: 1, background: rider.status === 'active' ? '#fef2f2' : '#f0fdf4', color: rider.status === 'active' ? '#dc2626' : '#15803d', border: 'none', padding: '0.55rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit' }}>
                                                {rider.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                )}

                {/* Assign tab */}
                {tab === 'assign' && (
                    loading ? <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div> :
                        bookings.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '14px', padding: '3rem', textAlign: 'center' }}>
                                <p style={{ color: '#9ca3af' }}>No unassigned deliveries right now</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {bookings.map(booking => (
                                    <div key={booking.reference} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #efefef' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a2456', fontSize: '0.95rem' }}>{booking.reference}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.15rem' }}>{booking.name} · {booking.phone}</div>
                                            </div>
                                            <span style={{ background: '#fff7ed', color: '#c2410c', padding: '0.22rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{booking.status}</span>
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: '#374151', marginBottom: '1rem' }}>
                                            <div>📍 <strong>From:</strong> {booking.pickup_address}</div>
                                            <div style={{ marginTop: '0.3rem' }}>🏁 <strong>To:</strong> {booking.delivery_address}</div>
                                        </div>
                                        <div>
                                            <label style={lbl}>Assign to Rider</label>
                                            {assignedRefs.includes(booking.reference) ? (
                                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', color: '#15803d', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                    Assigned successfully
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.65rem' }}>
                                                    <select
                                                        value={selectedRiders[booking.reference] || ''}
                                                        onChange={e => setSelectedRiders(prev => ({ ...prev, [booking.reference]: e.target.value }))}
                                                        style={{ ...inp, flex: 1 }}
                                                    >
                                                        <option value="" disabled>Select a rider</option>
                                                        {riders.filter(r => r.status === 'active').map(r => (
                                                            <option key={r.id} value={r.id}>{r.name} — {r.phone}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        disabled={assigning === booking.reference}
                                                        onClick={() => assignRider(booking.reference, selectedRiders[booking.reference] || '')}
                                                        style={{ background: assigning === booking.reference ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '0.7rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: assigning === booking.reference ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', whiteSpace: 'nowrap' as const }}
                                                    >
                                                        {assigning === booking.reference ? 'Assigning...' : 'Assign'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                )}
            </div>

            {/* Add Rider Modal */}
            {showAddRider && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={() => setShowAddRider(false)}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: '#1a2456', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Add New Rider</h2>
                            <button onClick={() => setShowAddRider(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            <div><label style={lbl}>Full Name *</label><input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rider's full name" /></div>
                            <div><label style={lbl}>Phone Number *</label><input style={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0XX XXX XXXX" /></div>
                            <div>
                                <label style={lbl}>PIN * (4-6 digits)</label>
                                <div style={{ position: 'relative' }}>
                                    <input style={{ ...inp, paddingRight: '2.75rem' }} value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })} placeholder="e.g. 1234" maxLength={6} type={showPin ? 'text' : 'password'} />
                                    <button type="button" onClick={() => setShowPin(!showPin)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 0 }}>
                                        {showPin ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                                    </button>
                                </div>
                            </div>
                            <div><label style={lbl}>Email (optional)</label><input style={inp} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="rider@email.com" /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={lbl}>Vehicle Type</label>
                                    <select style={{ ...inp, appearance: 'none' as const }} value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })}>
                                        <option value="motorcycle">Motorcycle</option>
                                        <option value="bicycle">Bicycle</option>
                                        <option value="car">Car</option>
                                        <option value="van">Van</option>
                                        <option value="truck">Truck</option>
                                    </select>
                                </div>
                                <div><label style={lbl}>License Plate</label><input style={inp} value={form.license_plate} onChange={e => setForm({ ...form, license_plate: e.target.value })} placeholder="GR-1234-23" /></div>
                            </div>
                            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.65rem', color: '#dc2626', fontSize: '0.82rem' }}>{error}</div>}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button onClick={addRider} disabled={saving} style={{ flex: 1, background: saving ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '0.95rem' }}>
                                    {saving ? 'Adding...' : 'Add Rider'}
                                </button>
                                <button onClick={() => setShowAddRider(false)} style={{ flex: 1, background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', padding: '0.9rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}