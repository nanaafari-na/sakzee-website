'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Assignment = {
    id: string;
    booking_id: string;
    status: string;
    assigned_at: string;
    picked_up_at: string | null;
    delivered_at: string | null;
    failure_reason?: string;
    failure_notes?: string;
    booking: {
        name: string;
        phone: string;
        pickup_address: string;
        delivery_address: string;
        package_description: string;
        pickup_date: string;
        pickup_time: string;
        delivery_fee: number;
    };
};

export default function RiderDashboard() {
    const [riderName, setRiderName] = useState('');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [trackingActive, setTrackingActive] = useState(false);
    const [locationStatus, setLocationStatus] = useState('');
    const [error, setError] = useState('');
    const [reportingIssue, setReportingIssue] = useState<string | null>(null);
    const [issueReason, setIssueReason] = useState('');
    const [issueNotes, setIssueNotes] = useState('');
    const [reportingLoading, setReportingLoading] = useState(false);
    const locationInterval = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const id = localStorage.getItem('rider_id');
        const name = localStorage.getItem('rider_name');
        if (!id) { router.push('/rider/login'); return; }
        setRiderName(name || '');
        loadAssignments(id);
    }, []);

    async function loadAssignments(riderId: string) {
        try {
            const res = await fetch(`/api/rider/assignments?rider_id=${riderId}`);
            const data = await res.json();
            setAssignments(Array.isArray(data) ? data : []);
            const active = data?.find((a: Assignment) => ['assigned', 'picked_up'].includes(a.status));

        } catch { }
        setLoading(false);
    }

    // Start sharing location
    function startTracking() {
        if (!navigator.geolocation) {
            setLocationStatus('GPS not available on this device');
            return;
        }
        setTrackingActive(true);
        setLocationStatus('📍 Sharing location...');
        sendLocation();
        locationInterval.current = setInterval(sendLocation, 30000);
    }

    function stopTracking() {
        clearInterval(locationInterval.current);
        setTrackingActive(false);
        setLocationStatus('');
    }

    async function sendLocation() {
        const riderId = localStorage.getItem('rider_id');
        navigator.geolocation.getCurrentPosition(async pos => {
            try {
                await fetch('/api/rider/location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rider_id: riderId,
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    }),
                });
                setLocationStatus(`📍 Location updated at ${new Date().toLocaleTimeString()}`);
            } catch { }
        }, () => setLocationStatus('⚠️ Could not get location'));
    }

    async function updateStatus(assignmentId: string, status: string) {
        const riderId = localStorage.getItem('rider_id');
        try {
            const res = await fetch(`/api/rider/assignments?id=${assignmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, rider_id: riderId }),
            });
            if (!res.ok) throw new Error('Failed to update');
            await loadAssignments(riderId!);
            if (status === 'picked_up') startTracking();
            if (status === 'delivered') stopTracking();
        } catch (e: any) {
            setError(e.message);
        }
    }

    async function reportIssue(assignmentId: string) {
        if (!issueReason) { setError('Please select a reason.'); return; }
        setReportingLoading(true);
        const riderId = localStorage.getItem('rider_id');
        try {
            await fetch(`/api/rider/assignments?id=${assignmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'failed',
                    rider_id: riderId,
                    failure_reason: issueReason,
                    failure_notes: issueNotes,
                }),
            });
            stopTracking();
            setReportingIssue(null);
            setIssueReason('');
            setIssueNotes('');
            await loadAssignments(riderId!);
        } catch (e: any) {
            setError(e.message);
        }
        setReportingLoading(false);
    }

    async function uploadProof(assignmentId: string, file: File) {
        setUploading(true);
        const riderId = localStorage.getItem('rider_id');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('assignment_id', assignmentId);
            formData.append('rider_id', riderId!);

            const res = await fetch('/api/rider/proof', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            await updateStatus(assignmentId, 'delivered');
        } catch (e: any) {
            setError(e.message);
        }
        setUploading(false);
    }

    function logout() {
        stopTracking();
        ['rider_id', 'rider_name', 'rider_phone'].forEach(k => localStorage.removeItem(k));
        router.push('/rider/login');
    }

    const statusColors: Record<string, { bg: string; color: string; label: string }> = {
        assigned: { bg: '#eff6ff', color: '#1d4ed8', label: 'Assigned' },
        picked_up: { bg: '#fff7ed', color: '#c2410c', label: 'Picked Up' },
        delivered: { bg: '#f0fdf4', color: '#15803d', label: 'Delivered' },
    };

    const activeAssignments = assignments.filter(a => a.status !== 'delivered');
    const completedAssignments = assignments.filter(a => a.status === 'delivered');

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif", maxWidth: '480px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ background: '#1a2456', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>sak<span style={{ color: '#f97316' }}>zee</span> Rider</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>Hi {riderName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {trackingActive && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,197,94,0.2)', padding: '0.3rem 0.65rem', borderRadius: '20px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                            <span style={{ color: '#22c55e', fontSize: '0.72rem', fontWeight: 600 }}>Live</span>
                        </div>
                    )}
                    <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                        Logout
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

            <div style={{ padding: '1.25rem' }}>
                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        {error} <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700, marginLeft: '0.5rem' }}>×</button>
                    </div>
                )}

                {locationStatus && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.65rem 1rem', color: '#15803d', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        {locationStatus}
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Active', value: activeAssignments.length, color: '#f97316' },
                        { label: 'Completed', value: completedAssignments.length, color: '#15803d' },
                        { label: 'Total', value: assignments.length, color: '#1a2456' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{loading ? '...' : s.value}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Active Assignments */}
                <h2 style={{ color: '#1a2456', fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    Active Deliveries
                </h2>

                {loading ? (
                    <div style={{ background: 'white', borderRadius: '14px', padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                ) : activeAssignments.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '14px', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No active deliveries right now</p>
                    </div>
                ) : activeAssignments.map(a => (
                    <div key={a.id} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #efefef' }}>
                        {/* Status badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a2456', fontSize: '0.9rem' }}>{a.booking_id}</span>
                            <span style={{ background: statusColors[a.status]?.bg, color: statusColors[a.status]?.color, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                {statusColors[a.status]?.label}
                            </span>
                        </div>

                        {/* Addresses */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                                <div style={{ width: '24px', height: '24px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                    <span style={{ fontSize: '0.75rem' }}>📍</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.1rem' }}>Pickup</div>
                                    <div style={{ fontSize: '0.875rem', color: '#1a2456', fontWeight: 600 }}>{a.booking?.pickup_address}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.booking?.pickup_date} at {a.booking?.pickup_time}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                                <div style={{ width: '24px', height: '24px', background: '#fff3e8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                    <span style={{ fontSize: '0.75rem' }}>🏁</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.1rem' }}>Deliver To</div>
                                    <div style={{ fontSize: '0.875rem', color: '#1a2456', fontWeight: 600 }}>{a.booking?.delivery_address}</div>
                                </div>
                            </div>
                        </div>

                        {/* Customer */}
                        <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Customer</div>
                                <div style={{ fontWeight: 600, color: '#1a2456', fontSize: '0.875rem' }}>{a.booking?.name}</div>
                            </div>
                            <a href={`tel:${a.booking?.phone}`} style={{ background: '#1a2456', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                📞 Call
                            </a>
                        </div>

                        {/* Package */}
                        {a.booking?.package_description && (
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem', background: '#f8f9ff', padding: '0.65rem', borderRadius: '8px' }}>
                                📦 {a.booking.package_description}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {a.status === 'assigned' && (
                                <button
                                    onClick={() => updateStatus(a.id, 'picked_up')}
                                    style={{ width: '100%', background: '#f97316', color: 'white', border: 'none', padding: '0.9rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                    ✅ Confirm Pickup
                                </button>
                            )}

                            {a.status === 'picked_up' && (
                                <>
                                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a.booking?.delivery_address || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ flex: 1, background: '#1a2456', color: 'white', padding: '0.85rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, textAlign: 'center', display: 'block' }}
                                        >
                                            🗺️ Navigate
                                        </a>
                                        <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem', fontSize: '0.78rem', color: '#15803d', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                            {trackingActive ? 'Live tracking on' : 'Starting...'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        style={{ width: '100%', background: uploading ? '#ccc' : '#15803d', color: 'white', border: 'none', padding: '0.9rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                                    >
                                        {uploading ? 'Uploading...' : '📸 Upload Proof & Mark Delivered'}
                                    </button>
                                    <button
                                        onClick={() => setReportingIssue(a.id)}
                                        style={{ width: '100%', background: 'white', color: '#dc2626', border: '2px solid #fecaca', padding: '0.85rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                        ↩️ Report Issue / Failed Delivery
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadProof(a.id, file);
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {/* Completed */}
                {completedAssignments.length > 0 && (
                    <>
                        <h2 style={{ color: '#1a2456', fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.85rem' }}>
                            Completed Today
                        </h2>
                        {completedAssignments.map(a => (
                            <div key={a.id} style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem', border: '1px solid #efefef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a2456', fontSize: '0.85rem' }}>{a.booking_id}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.15rem' }}>{a.booking?.delivery_address}</div>
                                </div>
                                <span style={{ background: '#f0fdf4', color: '#15803d', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>Delivered</span>
                            </div>
                        ))}
                    </>
                )}
            </div>


            {/* Report Issue Modal */}
            {reportingIssue && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <h2 style={{ color: '#dc2626', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>↩️ Report Failed Delivery</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Please provide details about why delivery could not be completed.</p>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Reason *</label>
                            <select value={issueReason} onChange={e => setIssueReason(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit', color: '#1a2456', background: 'white', appearance: 'none' as const }}>
                                <option value="">Select a reason</option>
                                <option value="Recipient not available">Recipient not available</option>
                                <option value="Wrong address">Wrong address</option>
                                <option value="Recipient refused package">Recipient refused package</option>
                                <option value="Unable to locate address">Unable to locate address</option>
                                <option value="Access denied to location">Access denied to location</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Additional Notes (optional)</label>
                            <textarea value={issueNotes} onChange={e => setIssueNotes(e.target.value)} placeholder="Any additional details..." style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit', color: '#1a2456', minHeight: '80px', resize: 'vertical' as const, boxSizing: 'border-box' as const }} />
                        </div>
                        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#c2410c' }}>
                            ⚠️ The sender will be charged the original delivery fee plus a return fee. This action cannot be undone.
                        </div>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.65rem', color: '#dc2626', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</div>}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => reportingIssue && reportIssue(reportingIssue)} disabled={reportingLoading} style={{ flex: 1, background: reportingLoading ? '#ccc' : '#dc2626', color: 'white', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 700, cursor: reportingLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
                                {reportingLoading ? 'Reporting...' : 'Confirm Failed Delivery'}
                            </button>
                            <button onClick={() => { setReportingIssue(null); setIssueReason(''); setIssueNotes(''); setError(''); }} style={{ flex: 1, background: 'white', color: '#374151', border: '1.5px solid #e2e8f0', padding: '0.9rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
    );
}