'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VendorNav from '@/components/VendorNav';

export default function VendorSettingsPage() {
    const [profile, setProfile] = useState({ business_name: '', contact_name: '', phone: '', address: '', notification_preference: 'both' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        if (!token || !id) { router.push('/vendor/login'); return; }
        loadProfile(id, token);
    }, []);

    async function loadProfile(id: string, token: string) {
        try {
            const res = await fetch(`/api/vendor/profile?vendor_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data) setProfile({
                business_name: data.business_name || '',
                contact_name: data.contact_name || '',
                phone: data.phone || '',
                address: data.address || '',
                notification_preference: data.notification_preference || 'both',
            });
        } catch { }
        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        setError('');
        setSuccess(false);
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        try {
            const res = await fetch('/api/vendor/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ vendor_id: id, ...profile }),
            });
            if (!res.ok) throw new Error('Failed to save');
            localStorage.setItem('vendor_name', profile.business_name);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e: any) {
            setError(e.message);
        }
        setSaving(false);
    }

    const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a2456', background: 'white' };
    const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <VendorNav />

            <div style={{ maxWidth: '540px', margin: '3rem auto', padding: '0 1rem' }}>
                <h1 style={{ color: '#1a2456', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem' }}>Account Settings</h1>
                <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '2rem' }}>Update your profile and notification preferences</p>

                {loading ? (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}
                        {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', color: '#15803d', fontSize: '0.875rem', marginBottom: '1.25rem' }}>✓ Settings saved successfully!</div>}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Profile</div>
                            </div>
                            <div><label style={lbl}>Business Name</label><input style={inp} value={profile.business_name} onChange={e => setProfile({ ...profile, business_name: e.target.value })} /></div>
                            <div><label style={lbl}>Contact Person</label><input style={inp} value={profile.contact_name} onChange={e => setProfile({ ...profile, contact_name: e.target.value })} /></div>
                            <div><label style={lbl}>Phone Number</label><input style={inp} value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
                            <div><label style={lbl}>Business Address</label><input style={inp} value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} /></div>

                            {/* Notification preference */}
                            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Notification Preference</div>
                            </div>
                            <div>
                                <label style={{ ...lbl, marginBottom: '0.75rem' }}>How would you like to receive notifications? *</label>
                                <div style={{ display: 'flex', gap: '0.65rem' }}>
                                    {[
                                        { value: 'email', icon: '✉️', label: 'Email' },
                                        { value: 'whatsapp', icon: '💬', label: 'WhatsApp' },
                                        { value: 'both', icon: '🔔', label: 'Both (Recommended)' },
                                    ].map(opt => (
                                        <label key={opt.value} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.75rem 0.5rem', border: `2px solid ${profile.notification_preference === opt.value ? '#1a2456' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: profile.notification_preference === opt.value ? '#f0f3ff' : 'white', textAlign: 'center' }}>
                                            <input type="radio" name="notification_preference" value={opt.value} checked={profile.notification_preference === opt.value} onChange={e => setProfile({ ...profile, notification_preference: e.target.value })} style={{ width: '16px', height: '16px', accentColor: '#1a2456', cursor: 'pointer' }} />
                                            <span style={{ fontSize: '1.15rem' }}>{opt.icon}</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: profile.notification_preference === opt.value ? '#1a2456' : '#6b7280', lineHeight: 1.3 }}>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: saving ? '#ccc' : '#1a2456', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '0.5rem' }}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}