'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

declare global { interface Window { google: any; initGoogleMaps: () => void; } }

const BASE_FEE = 25;
const BASE_KM = 10;
const PER_KM = 1.5;
const WEIGHT_SURCHARGE = 10;
const MAX_STOPS = 5;
const MAPS_KEY = 'AIzaSyBAK6MKw3OJtKMQAgvToW8ZtQVklFCr1i8';

function calcFee(totalKm: number, hasHeavy: boolean) {
    const distFee = BASE_FEE + (totalKm > BASE_KM ? (totalKm - BASE_KM) * PER_KM : 0);
    return Math.round(distFee + (hasHeavy ? WEIGHT_SURCHARGE : 0));
}

type Pref = 'email' | 'whatsapp' | 'both';
type DeliveryType = 'single' | 'multi_delivery' | 'multi_pickup';

interface Stop {
    id: string;
    address: string;
    contact_name: string;
    contact_phone: string;
    package_description: string;
    weight_over_5kg: boolean;
    distance_km: number;
    fee: number;
    paying_party: 'booker' | 'recipient';
}

function newStop(): Stop {
    return { id: Date.now().toString(), address: '', contact_name: '', contact_phone: '', package_description: '', weight_over_5kg: false, distance_km: 0, fee: 0, paying_party: 'booker' };
}

const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', color: '#1a2456', background: 'white' };
const lbl: React.CSSProperties = { display: 'block', color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' };

function updateStop(list: Stop[], setList: (s: Stop[]) => void, idx: number, field: keyof Stop, value: any) {
    const updated = [...list];
    updated[idx] = { ...updated[idx], [field]: value };
    setList(updated);
}

function removeStop(list: Stop[], setList: (s: Stop[]) => void, idx: number) {
    if (list.length > 1) setList(list.filter((_, i) => i !== idx));
}

function StopCard({ stop, index, label, list, setList, showWeight = true, showPayingParty = false, bookerName = '', mapsReady, attachStopAC }: {
    stop: Stop; index: number; label: string; list: Stop[]; setList: (s: Stop[]) => void;
    showWeight?: boolean; showPayingParty?: boolean; bookerName?: string;
    mapsReady: boolean; attachStopAC: (el: HTMLInputElement, onSelect: (addr: string) => void) => void;
}) {
    return (
        <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e5e7eb', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.9rem' }}>{label} {index + 1}</div>
                    {stop.fee > 0 && <div style={{ color: '#f97316', fontWeight: 700, fontSize: '0.82rem', marginTop: '0.15rem' }}>Fee: GHS {stop.fee}</div>}
                </div>
                {list.length > 1 && (
                    <button onClick={() => removeStop(list, setList, index)} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', borderRadius: '6px', padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>Remove</button>
                )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                    <label style={lbl}>Address *</label>
                    <input
                        style={inp}
                        value={stop.address}
                        onChange={e => updateStop(list, setList, index, 'address', e.target.value)}
                        placeholder="Start typing address..."
                        autoComplete="off"
                        ref={el => { if (el && mapsReady) attachStopAC(el, (addr) => updateStop(list, setList, index, 'address', addr)); }}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                        <label style={lbl}>Contact Name *</label>
                        <input style={inp} value={stop.contact_name} onChange={e => updateStop(list, setList, index, 'contact_name', e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                        <label style={lbl}>Phone *</label>
                        <input style={inp} value={stop.contact_phone} onChange={e => updateStop(list, setList, index, 'contact_phone', e.target.value)} placeholder="0XX XXX XXXX" />
                    </div>
                </div>
                <div>
                    <label style={lbl}>Package Description</label>
                    <input style={inp} value={stop.package_description} onChange={e => updateStop(list, setList, index, 'package_description', e.target.value)} placeholder="e.g. 2 boxes of clothing" />
                </div>
                {showWeight && (
                    <div>
                        <label style={lbl}>Package Weight</label>
                        <select style={{ ...inp, appearance: 'none' as const }} value={stop.weight_over_5kg ? 'over' : 'under'} onChange={e => updateStop(list, setList, index, 'weight_over_5kg', e.target.value === 'over')}>
                            <option value="under">Under 5kg</option>
                            <option value="over">Over 5kg (+GHS 10 surcharge)</option>
                        </select>
                    </div>
                )}
                {showPayingParty && (
                    <div>
                        <label style={{ ...lbl, marginBottom: '0.5rem' }}>Who pays for this stop?</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {[
                                { value: 'booker', label: `Sender (${bookerName || 'You'})`, icon: '👤' },
                                { value: 'recipient', label: `Recipient (${stop.contact_name || 'Recipient'})`, icon: '📦' },
                            ].map(opt => (
                                <label key={opt.value} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.75rem', border: `2px solid ${stop.paying_party === opt.value ? '#f97316' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', background: stop.paying_party === opt.value ? '#fff7ed' : 'white' }}>
                                    <input type="radio" name={`paying_party_${stop.id}`} value={opt.value} checked={stop.paying_party === opt.value} onChange={() => updateStop(list, setList, index, 'paying_party', opt.value)} style={{ accentColor: '#f97316', flexShrink: 0 }} />
                                    <span style={{ fontSize: '1rem' }}>{opt.icon}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: stop.paying_party === opt.value ? '#c2410c' : '#6b7280', lineHeight: 1.3 }}>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BookDeliveryPage() {
    const [step, setStep] = useState(1);
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('single');
    const [notifPref, setNotifPref] = useState<Pref>('whatsapp');

    // Sender
    const [sender, setSender] = useState({ name: '', phone: '', email: '' });

    // Single booking fields
    const [single, setSingle] = useState({
        pickup_address: '', delivery_address: '',
        recipient_name: '', recipient_phone: '',
        paying_party: 'booker' as 'booker' | 'recipient',
        same_person: false,
        pickup_date: '', pickup_time: '',
        package_description: '', weight_over_5kg: false,
    });

    // Multi stops
    const [pickupStops, setPickupStops] = useState<Stop[]>([newStop()]);
    const [deliveryStops, setDeliveryStops] = useState<Stop[]>([newStop()]);
    const [sharedPickupDate, setSharedPickupDate] = useState('');
    const [sharedPickupTime, setSharedPickupTime] = useState('');
    const [singleDeliveryAddress, setSingleDeliveryAddress] = useState('');
    const [singleRecipient, setSingleRecipient] = useState({ name: '', phone: '' });
    const [singlePickupAddress, setSinglePickupAddress] = useState('');

    // Distance and fee
    const [totalDistanceKm, setTotalDistanceKm] = useState(0);
    const [distanceText, setDistanceText] = useState('');
    const [calculatingDistance, setCalculatingDistance] = useState(false);
    const [mapsReady, setMapsReady] = useState(false);

    // UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [reference, setReference] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    // Autocomplete refs for single booking
    const pickupRef = useRef<HTMLInputElement>(null);
    const deliveryRef = useRef<HTMLInputElement>(null);
    const pickupAC = useRef<any>(null);
    const deliveryAC = useRef<any>(null);

    useEffect(() => {
        window.initGoogleMaps = () => setMapsReady(true);
        if (window.google?.maps?.places) { setMapsReady(true); return; }
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&callback=initGoogleMaps`;
            s.async = true; s.defer = true; document.head.appendChild(s);
        }
    }, []);

    // Attach autocomplete to single booking inputs
    const attachSingleAC = useCallback(() => {
        if (!mapsReady || !window.google?.maps?.places) return;
        if (pickupRef.current && !pickupAC.current) {
            pickupAC.current = new window.google.maps.places.Autocomplete(pickupRef.current, { componentRestrictions: { country: 'gh' }, fields: ['formatted_address'] });
            pickupAC.current.addListener('place_changed', () => {
                const p = pickupAC.current.getPlace();
                if (p?.formatted_address) setSingle(prev => ({ ...prev, pickup_address: p.formatted_address }));
            });
        }
        if (deliveryRef.current && !deliveryAC.current) {
            deliveryAC.current = new window.google.maps.places.Autocomplete(deliveryRef.current, { componentRestrictions: { country: 'gh' }, fields: ['formatted_address'] });
            deliveryAC.current.addListener('place_changed', () => {
                const p = deliveryAC.current.getPlace();
                if (p?.formatted_address) setSingle(prev => ({ ...prev, delivery_address: p.formatted_address }));
            });
        }
    }, [mapsReady]);

    useEffect(() => {
        if (step === 3 && deliveryType === 'single') setTimeout(attachSingleAC, 150);
    }, [step, mapsReady, deliveryType, attachSingleAC]);

    // Attach autocomplete to a dynamic stop input
    function attachStopAC(input: HTMLInputElement, onSelect: (addr: string) => void) {
        if (!mapsReady || !window.google?.maps?.places) return;
        const ac = new window.google.maps.places.Autocomplete(input, { componentRestrictions: { country: 'gh' }, fields: ['formatted_address'] });
        ac.addListener('place_changed', () => {
            const p = ac.getPlace();
            if (p?.formatted_address) onSelect(p.formatted_address);
        });
    }

    // Calculate distance for single booking
    useEffect(() => {
        if (deliveryType === 'single' && single.pickup_address && single.delivery_address && mapsReady) {
            const t = setTimeout(() => calcSingleDistance(), 800);
            return () => clearTimeout(t);
        }
    }, [single.pickup_address, single.delivery_address, mapsReady, deliveryType]);

    async function calcSingleDistance() {
        if (!window.google) return;
        setCalculatingDistance(true);
        const service = new window.google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [single.pickup_address],
            destinations: [single.delivery_address],
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (res: any, status: string) => {
            if (status === 'OK' && res.rows[0]?.elements[0]?.status === 'OK') {
                const el = res.rows[0].elements[0];
                const km = Math.ceil(el.distance.value / 1000);
                setTotalDistanceKm(km);
                setDistanceText(el.distance.text);
            } else { setTotalDistanceKm(20); setDistanceText('~20 km (estimated)'); }
            setCalculatingDistance(false);
        });
    }

    // Calculate distance for each delivery stop independently from pickup
    async function calcMultiDeliveryDistances(pickup: string, stops: Stop[]) {
        if (!window.google || !pickup) return;
        setCalculatingDistance(true);
        const service = new window.google.maps.DistanceMatrixService();
        const dests = stops.map(s => s.address).filter(Boolean);
        if (!dests.length) { setCalculatingDistance(false); return; }

        service.getDistanceMatrix({
            origins: [pickup],
            destinations: dests,
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (res: any, status: string) => {
            if (status === 'OK' && res.rows[0]) {
                const updated = [...stops];
                res.rows[0].elements.forEach((el: any, i: number) => {
                    if (el.status === 'OK') {
                        const km = Math.ceil(el.distance.value / 1000);
                        updated[i] = { ...updated[i], distance_km: km, fee: calcFee(km, updated[i].weight_over_5kg) };
                    } else {
                        updated[i] = { ...updated[i], distance_km: 20, fee: calcFee(20, updated[i].weight_over_5kg) };
                    }
                });
                setDeliveryStops(updated);
                const total = updated.reduce((sum, s) => sum + (s.fee || 0), 0);
                setTotalDistanceKm(total); // store total fee in totalDistanceKm for multi-delivery
                setDistanceText(`${updated.length} stops`);
            }
            setCalculatingDistance(false);
        });
    }

    // Calculate cumulative distance for multi-pickup
    async function calcMultiPickupDistance(pickups: Stop[], delivery: string) {
        if (!window.google || !delivery) return;
        setCalculatingDistance(true);
        const service = new window.google.maps.DistanceMatrixService();
        const allPoints = [...pickups.map(s => s.address).filter(Boolean), delivery];
        if (allPoints.length < 2) { setCalculatingDistance(false); return; }

        let totalKm = 0;
        for (let i = 0; i < allPoints.length - 1; i++) {
            await new Promise<void>(resolve => {
                service.getDistanceMatrix({
                    origins: [allPoints[i]], destinations: [allPoints[i + 1]],
                    travelMode: window.google.maps.TravelMode.DRIVING,
                }, (res: any, status: string) => {
                    if (status === 'OK' && res.rows[0]?.elements[0]?.status === 'OK') {
                        totalKm += Math.ceil(res.rows[0].elements[0].distance.value / 1000);
                    } else totalKm += 10;
                    resolve();
                });
            });
        }
        setTotalDistanceKm(totalKm);
        setDistanceText(`${totalKm} km total`);
        setCalculatingDistance(false);
    }
    useEffect(() => {
        if (!mapsReady) return;
        if (deliveryType === 'multi_delivery') {
            const validStops = deliveryStops.filter(s => s.address);
            if (singlePickupAddress && validStops.length) {
                const t = setTimeout(() => calcMultiDeliveryDistances(singlePickupAddress, deliveryStops), 1000);
                return () => clearTimeout(t);
            }
        } else if (deliveryType === 'multi_pickup') {
            const validPickups = pickupStops.filter(s => s.address);
            if (validPickups.length && singleDeliveryAddress) {
                const t = setTimeout(() => calcMultiPickupDistance(pickupStops, singleDeliveryAddress), 1000);
                return () => clearTimeout(t);
            }
        }
    }, [deliveryStops, pickupStops, singlePickupAddress, singleDeliveryAddress, mapsReady, deliveryType]);

    const hasHeavy = deliveryType === 'single' ? single.weight_over_5kg
        : deliveryType === 'multi_delivery' ? deliveryStops.some(s => s.weight_over_5kg)
            : pickupStops.some(s => s.weight_over_5kg);

    // For multi-delivery: total = sum of individual stop fees
    // For single/multi-pickup: calculate from distance
    const multiDeliveryTotal = deliveryType === 'multi_delivery'
        ? deliveryStops.reduce((sum, s) => sum + (s.fee || 0), 0)
        : 0;
    const deliveryFee = deliveryType === 'multi_delivery'
        ? multiDeliveryTotal
        : totalDistanceKm > 0 ? calcFee(totalDistanceKm, hasHeavy) : 0;

    function addStop(list: Stop[], setList: (s: Stop[]) => void) {
        if (list.length < MAX_STOPS) setList([...list, newStop()]);
    }

    function validateStep() {
        setError('');
        if (step === 1) return true;
        if (step === 2) {
            if (!sender.name || !sender.phone) { setError('Please enter your name and phone number.'); return false; }
            if ((notifPref === 'email' || notifPref === 'both') && !sender.email) { setError('Please enter your email address.'); return false; }
            return true;
        }
        if (step === 3) {
            if (deliveryType === 'single') {
                if (!single.pickup_address || !single.delivery_address || !single.pickup_date || !single.pickup_time) { setError('Please fill in all delivery details.'); return false; }
                if (!single.same_person && (!single.recipient_name || !single.recipient_phone)) { setError('Please fill in recipient details.'); return false; }
            } else if (deliveryType === 'multi_delivery') {
                if (!singlePickupAddress || !sharedPickupDate || !sharedPickupTime) { setError('Please fill in pickup details.'); return false; }
                if (deliveryStops.some(s => !s.address || !s.contact_name || !s.contact_phone)) { setError('Please fill in all delivery stop details.'); return false; }
            } else if (deliveryType === 'multi_pickup') {
                if (!singleDeliveryAddress || !singleRecipient.name || !singleRecipient.phone || !sharedPickupDate || !sharedPickupTime) { setError('Please fill in all details.'); return false; }
                if (pickupStops.some(s => !s.address || !s.contact_name || !s.contact_phone)) { setError('Please fill in all pickup stop details.'); return false; }
            }
            return true;
        }
        return true;
    }

    function nextStep() {
        if (validateStep()) setStep(step + 1);
    }

    async function confirmBooking() {
        setLoading(true); setError('');
        try {
            const ref = `SAKDEL-${Date.now()}`;
            const stops = deliveryType === 'multi_delivery'
                ? [{ type: 'pickup', address: singlePickupAddress, contact_name: sender.name, contact_phone: sender.phone },
                ...deliveryStops.map((s, i) => ({ type: 'delivery', ...s, stop_order: i + 1, paying_party: s.paying_party, fee: s.fee }))]
                : deliveryType === 'multi_pickup'
                    ? [...pickupStops.map((s, i) => ({ type: 'pickup', ...s, stop_order: i + 1 })),
                    { type: 'delivery', address: singleDeliveryAddress, contact_name: singleRecipient.name, contact_phone: singleRecipient.phone }]
                    : [];

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: ref,
                    name: sender.name,
                    phone: sender.phone,
                    email: sender.email || null,
                    delivery_type: deliveryType,
                    total_stops: deliveryType === 'single' ? 1 : stops.length,
                    notification_preference: notifPref,
                    booking_type: 'delivery',
                    service: 'Delivery',
                    date: deliveryType === 'single' ? single.pickup_date : sharedPickupDate,
                    pickup_time: deliveryType === 'single' ? single.pickup_time : sharedPickupTime,
                    pickup_address: deliveryType === 'single' ? single.pickup_address : deliveryType === 'multi_delivery' ? singlePickupAddress : pickupStops[0]?.address,
                    delivery_address: deliveryType === 'single' ? single.delivery_address : deliveryType === 'multi_pickup' ? singleDeliveryAddress : deliveryStops[0]?.address,
                    recipient_name: deliveryType === 'single' ? (single.same_person ? sender.name : single.recipient_name) : deliveryType === 'multi_pickup' ? singleRecipient.name : deliveryStops[0]?.contact_name,
                    recipient_phone: deliveryType === 'single' ? (single.same_person ? sender.phone : single.recipient_phone) : deliveryType === 'multi_pickup' ? singleRecipient.phone : deliveryStops[0]?.contact_phone,
                    paying_party: 'booker',
                    package_description: deliveryType === 'single' ? single.package_description : '',
                    weight_kg: hasHeavy ? 6 : 0,
                    delivery_fee: deliveryFee,
                    distance_km: totalDistanceKm,
                    payment_status: 'pending',
                    status: 'Received',
                    stops: stops,
                }),
            });
            if (!res.ok) throw new Error('Failed to confirm booking');
            setReference(ref);
            setSuccess(true);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    }

    async function downloadReceipt() {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const navy = [26, 36, 86] as [number, number, number];
        const orange = [249, 115, 22] as [number, number, number];
        const gray = [107, 114, 128] as [number, number, number];

        doc.setFillColor(...navy);
        doc.rect(0, 0, 210, 38, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22); doc.setFont('helvetica', 'bold');
        doc.text('sak', 15, 18);
        doc.setTextColor(...orange);
        doc.text('zee', 30, 18);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text('Moving Dreams, Delivering Growth', 15, 25);
        doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text('DELIVERY RECEIPT', 195, 18, { align: 'right' });
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}`, 195, 25, { align: 'right' });

        doc.setFillColor(248, 249, 255); doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, 44, 180, 16, 3, 3, 'FD');
        doc.setTextColor(...gray); doc.setFontSize(8);
        doc.text('TRACKING REFERENCE', 105, 50, { align: 'center' });
        doc.setTextColor(...navy); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
        doc.text(reference, 105, 57, { align: 'center' });

        let y = 72;

        function sectionHeader(title: string) {
            doc.setFillColor(...navy); doc.rect(15, y - 5, 180, 8, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
            doc.text(title, 18, y); y += 8;
        }

        function row(label: string, value: string) {
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
            doc.setTextColor(...gray); doc.text(label, 18, y);
            doc.setTextColor(...navy); doc.setFont('helvetica', 'bold');
            const lines = doc.splitTextToSize(value, 110);
            doc.text(lines, 195, y, { align: 'right' });
            doc.setDrawColor(243, 244, 246); doc.line(15, y + 2, 195, y + 2);
            y += 8 * lines.length;
        }

        sectionHeader('SENDER');
        row('Name', sender.name);
        row('Phone', sender.phone);
        if (sender.email) row('Email', sender.email);
        y += 4;

        sectionHeader('DELIVERY TYPE');
        row('Type', deliveryType === 'single' ? 'Single' : deliveryType === 'multi_delivery' ? `Multi-Drop (${deliveryStops.length} stops)` : `Multi-Pickup (${pickupStops.length} stops)`);
        row('Date', deliveryType === 'single' ? single.pickup_date : sharedPickupDate);
        row('Time', deliveryType === 'single' ? single.pickup_time : sharedPickupTime);
        y += 4;

        if (deliveryType === 'single') {
            sectionHeader('DELIVERY DETAILS');
            row('Pickup', single.pickup_address);
            row('Delivery', single.delivery_address);
            row('Recipient', single.same_person ? sender.name : single.recipient_name);
            row('Recipient Phone', single.same_person ? sender.phone : single.recipient_phone);
            row('Weight', single.weight_over_5kg ? 'Over 5kg' : 'Under 5kg');
            if (single.package_description) row('Package', single.package_description);
        } else if (deliveryType === 'multi_delivery') {
            sectionHeader('PICKUP');
            row('Pickup address', singlePickupAddress);
            row('Date', `${sharedPickupDate} at ${sharedPickupTime}`);
            y += 2;
            sectionHeader('DELIVERY STOPS');
            deliveryStops.forEach((s, i) => {
                row(`Stop ${i + 1} — Address`, s.address);
                row(`Stop ${i + 1} — Recipient`, `${s.contact_name} · ${s.contact_phone}`);
                row(`Stop ${i + 1} — Weight`, s.weight_over_5kg ? 'Over 5kg' : 'Under 5kg');
                row(`Stop ${i + 1} — Pays`, s.paying_party === 'recipient' ? s.contact_name : sender.name || 'Sender');
                row(`Stop ${i + 1} — Fee`, `GHS ${s.fee}`);
                if (s.package_description) row(`Stop ${i + 1} — Package`, s.package_description);
                y += 2;
            });
        } else {
            sectionHeader('PICKUP STOPS');
            pickupStops.forEach((s, i) => {
                row(`Stop ${i + 1} - Address`, s.address);
                row(`Stop ${i + 1} - Contact`, s.contact_name);
                row(`Stop ${i + 1} - Phone`, s.contact_phone);
                y += 2;
            });
            sectionHeader('DELIVERY');
            row('Delivery address', singleDeliveryAddress);
            row('Recipient', singleRecipient.name);
            row('Recipient Phone', singleRecipient.phone);
        }

        y += 4;
        sectionHeader('PAYMENT');
        row('Distance', deliveryType === 'multi_delivery' ? `${deliveryStops.length} independent stops` : distanceText);
        if (deliveryType !== 'multi_delivery') row('Estimated fee', `GHS ${deliveryFee}`);
        row('Payment mode', deliveryType === 'multi_delivery' ? 'Per stop — pay on delivery' : 'Pay on delivery');
        row('Notifications', notifPref === 'both' ? 'Email & WhatsApp' : notifPref === 'email' ? 'Email' : 'WhatsApp');
        y += 4;

        if (deliveryType !== 'multi_delivery') {
            doc.setFillColor(255, 247, 237); doc.setDrawColor(...orange);
            doc.roundedRect(15, y, 180, 18, 3, 3, 'FD');
            doc.setTextColor(...gray); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.text('Total Estimated Fee', 20, y + 7);
            doc.setTextColor(...orange); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
            doc.text(`GHS ${deliveryFee}`, 190, y + 11, { align: 'right' });
            doc.setTextColor(...gray); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
            doc.text('Payable on delivery', 20, y + 14);
        } else {
            doc.setFillColor(255, 247, 237); doc.setDrawColor(...orange);
            doc.roundedRect(15, y, 180, 12, 3, 3, 'FD');
            doc.setTextColor(...orange); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.text('Each stop billed independently — pay on delivery per stop', 105, y + 8, { align: 'center' });
        }

        doc.setFillColor(...navy); doc.rect(0, 280, 210, 17, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text('Sakzee Company Limited', 105, 287, { align: 'center' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(200, 210, 230);
        doc.text('Ubuntu Court Estate, Oyarifa, Accra  •  0256 089 599  •  info@sakzee.com  •  sakzee.com', 105, 293, { align: 'center' });

        doc.save(`Sakzee-Receipt-${reference}.pdf`);
    }

    const STEPS = ['Type', 'Sender', 'Details', 'Confirm'];

    const totalStops = deliveryType === 'multi_delivery' ? deliveryStops.length : deliveryType === 'multi_pickup' ? pickupStops.length : 1;

    // ─── SUCCESS SCREEN ───────────────────────────────────────────
    if (success) return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', maxWidth: '500px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%' }}>
                <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h2 style={{ color: '#1a2456', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    {deliveryType === 'single' ? 'Delivery Booked!' : deliveryType === 'multi_delivery' ? `${deliveryStops.length} Deliveries Booked!` : `${pickupStops.length} Pickups Booked!`} 🚚
                </h2>
                <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.92rem' }}>
                    {deliveryType === 'multi_delivery'
                        ? `Each recipient has been notified via ${notifPref === 'both' ? 'Email & WhatsApp' : notifPref}.`
                        : deliveryType === 'multi_pickup'
                            ? `Each pickup contact has been notified via ${notifPref === 'both' ? 'Email & WhatsApp' : notifPref}.`
                            : `Notifications sent via ${notifPref === 'both' ? 'Email & WhatsApp' : notifPref}.`}
                </p>
                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>Tracking Reference</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2456', fontFamily: 'monospace' }}>{reference}</div>
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#c2410c' }}>
                    {deliveryType === 'multi_delivery'
                        ? <><strong>{deliveryStops.length} stops booked</strong> — each stop billed independently on delivery</>
                        : <><strong>Estimated fee: GHS {deliveryFee}</strong> — payment collected on delivery</>
                    }
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button onClick={downloadReceipt} style={{ width: '100%', background: '#1a2456', color: 'white', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Download Receipt (PDF)
                    </button>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link href="/track" style={{ flex: 1, background: '#f97316', color: 'white', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', textAlign: 'center', display: 'block' }}>Track Delivery</Link>
                        <Link href="/" style={{ flex: 1, background: '#f8f9ff', color: '#1a2456', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem', textAlign: 'center', display: 'block', border: '1px solid #e2e8f0' }}>Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
        @media (max-width: 640px) { .del-nav { display: none !important; } .del-ham { display: flex !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pac-container { z-index: 9999 !important; }
      `}</style>

            <nav style={{ background: '#1a2456', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></Link>
                <div className="del-nav" style={{ display: 'flex', gap: '1.75rem' }}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
                    <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
                    <Link href="/track" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem' }}>Track</Link>
                </div>
                <button className="del-ham" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px', padding: '4px' }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '2px' }} />)}
                </button>
            </nav>

            {menuOpen && (
                <div style={{ background: '#1a2456', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {[['/', 'Home'], ['/pricing', 'Pricing'], ['/track', 'Track']].map(([href, label]) => (
                        <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.95rem' }}>{label}</Link>
                    ))}
                </div>
            )}

            <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff3e8', color: '#f97316', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem' }}>🚚 Pay on Delivery</div>
                    <h1 style={{ color: '#1a2456', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.4rem' }}>Book a Delivery</h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Single or multi-stop · Pay when delivered · All parties notified</p>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginBottom: '1.75rem' }}>
                    {STEPS.map((label, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i + 1 ? '#22c55e' : step === i + 1 ? '#1a2456' : '#e2e8f0', color: step >= i + 1 ? 'white' : '#999', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                                {step > i + 1 ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: step === i + 1 ? '#1a2456' : '#999', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' as const }}>{label}</span>
                            {i < 3 && <div style={{ width: '14px', height: '2px', background: step > i + 1 ? '#22c55e' : '#e2e8f0', flexShrink: 0 }} />}
                        </div>
                    ))}
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                    {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{error}</div>}

                    {/* STEP 1 — TYPE + NOTIFICATION PREFERENCE */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <h2 style={{ color: '#1a2456', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Delivery Type</h2>
                                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>What kind of delivery do you need?</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    {[
                                        { value: 'single', icon: '📦', title: 'Single Delivery', desc: 'One pickup → One delivery address' },
                                        { value: 'multi_delivery', icon: '🏘️', title: 'Multiple Deliveries', desc: 'One pickup → Multiple delivery addresses' },
                                        { value: 'multi_pickup', icon: '🔄', title: 'Multiple Pickups', desc: 'Multiple pickup addresses → One delivery address' },
                                    ].map(opt => (
                                        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `2px solid ${deliveryType === opt.value ? '#1a2456' : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', background: deliveryType === opt.value ? '#f0f3ff' : 'white' }}>
                                            <input type="radio" name="deliveryType" value={opt.value} checked={deliveryType === opt.value} onChange={() => setDeliveryType(opt.value as DeliveryType)} style={{ width: '18px', height: '18px', accentColor: '#1a2456', flexShrink: 0 }} />
                                            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{opt.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, color: deliveryType === opt.value ? '#1a2456' : '#374151', fontSize: '0.9rem' }}>{opt.title}</div>
                                                <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{opt.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 style={{ color: '#1a2456', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Notification Preference</h2>
                                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>How would you like to receive updates? All parties will be notified via your chosen channel.</p>
                                <div style={{ display: 'flex', gap: '0.65rem' }}>
                                    {[
                                        { value: 'whatsapp', icon: '💬', label: 'WhatsApp' },
                                        { value: 'email', icon: '✉️', label: 'Email' },
                                        { value: 'both', icon: '🔔', label: 'Both' },
                                    ].map(opt => (
                                        <label key={opt.value} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.85rem 0.5rem', border: `2px solid ${notifPref === opt.value ? '#1a2456' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: notifPref === opt.value ? '#f0f3ff' : 'white', textAlign: 'center' }}>
                                            <input type="radio" name="notifPref" value={opt.value} checked={notifPref === opt.value} onChange={() => setNotifPref(opt.value as Pref)} style={{ display: 'none' }} />
                                            <span style={{ fontSize: '1.35rem' }}>{opt.icon}</span>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: notifPref === opt.value ? '#1a2456' : '#6b7280' }}>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — SENDER */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h2 style={{ color: '#1a2456', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0' }}>Sender Details</h2>
                            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.1rem' }}>Person placing this delivery order</p>
                            <div><label style={lbl}>Full Name *</label><input style={inp} value={sender.name} onChange={e => setSender({ ...sender, name: e.target.value })} placeholder="Your full name" /></div>
                            <div><label style={lbl}>Phone Number *</label><input style={inp} value={sender.phone} onChange={e => setSender({ ...sender, phone: e.target.value })} placeholder="0XX XXX XXXX" /></div>
                            {(notifPref === 'email' || notifPref === 'both') && (
                                <div><label style={lbl}>Email Address *</label><input style={inp} type="email" value={sender.email} onChange={e => setSender({ ...sender, email: e.target.value })} placeholder="you@example.com" /></div>
                            )}
                        </div>
                    )}

                    {/* STEP 3 — DELIVERY DETAILS */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h2 style={{ color: '#1a2456', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0' }}>Delivery Details</h2>
                            <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.1rem' }}>
                                {deliveryType === 'single' ? 'Pickup and delivery addresses' : deliveryType === 'multi_delivery' ? `One pickup, ${deliveryStops.length} delivery stop${deliveryStops.length > 1 ? 's' : ''}` : `${pickupStops.length} pickup stop${pickupStops.length > 1 ? 's' : ''}, one delivery`}
                            </p>

                            {/* Date/time — shared */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={lbl}>Pickup Date *</label>
                                    <input style={inp} type="date" value={deliveryType === 'single' ? single.pickup_date : sharedPickupDate}
                                        onChange={e => deliveryType === 'single' ? setSingle({ ...single, pickup_date: e.target.value }) : setSharedPickupDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label style={lbl}>Pickup Time *</label>
                                    <input style={inp} type="time" value={deliveryType === 'single' ? single.pickup_time : sharedPickupTime}
                                        onChange={e => deliveryType === 'single' ? setSingle({ ...single, pickup_time: e.target.value }) : setSharedPickupTime(e.target.value)} />
                                </div>
                            </div>

                            {/* SINGLE */}
                            {deliveryType === 'single' && (
                                <>
                                    <div>
                                        <label style={lbl}>Pickup Address *</label>
                                        <input ref={pickupRef} style={inp} value={single.pickup_address} onChange={e => setSingle({ ...single, pickup_address: e.target.value })} placeholder="Start typing pickup address..." autoComplete="off" />
                                        {mapsReady && <p style={{ color: '#9ca3af', fontSize: '0.72rem', marginTop: '0.3rem' }}>💡 Google Maps suggestions enabled</p>}
                                    </div>
                                    <div>
                                        <label style={lbl}>Delivery Address *</label>
                                        <input ref={deliveryRef} style={inp} value={single.delivery_address} onChange={e => setSingle({ ...single, delivery_address: e.target.value })} placeholder="Start typing delivery address..." autoComplete="off" />
                                    </div>

                                    {calculatingDistance && <div style={{ background: '#f8f9ff', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', border: '2px solid #1a2456', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Calculating distance...</div>}
                                    {totalDistanceKm > 0 && !calculatingDistance && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#15803d' }}>📍 Distance: <strong>{distanceText}</strong></div>}

                                    {/* Same person checkbox */}
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: '#f8f9ff', borderRadius: '10px', cursor: 'pointer', border: '1.5px solid #e2e8f0' }}>
                                        <input type="checkbox" checked={single.same_person} onChange={e => setSingle({ ...single, same_person: e.target.checked, recipient_name: e.target.checked ? sender.name : '', recipient_phone: e.target.checked ? sender.phone : '' })} style={{ width: '18px', height: '18px', accentColor: '#1a2456', cursor: 'pointer' }} />
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1a2456', fontSize: '0.9rem' }}>I am also the recipient</div>
                                            <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Sender and recipient are the same person</div>
                                        </div>
                                    </label>

                                    {!single.same_person && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <div><label style={lbl}>Recipient Name *</label><input style={inp} value={single.recipient_name} onChange={e => setSingle({ ...single, recipient_name: e.target.value })} placeholder="Recipient's name" /></div>
                                            <div><label style={lbl}>Recipient Phone *</label><input style={inp} value={single.recipient_phone} onChange={e => setSingle({ ...single, recipient_phone: e.target.value })} placeholder="0XX XXX XXXX" /></div>
                                        </div>
                                    )}

                                    {/* Who pays */}
                                    <div>
                                        <label style={{ ...lbl, marginBottom: '0.65rem' }}>Who pays on delivery?</label>
                                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                                            {[{ value: 'booker', icon: '👤', label: `Sender (${sender.name || 'You'})` }, { value: 'recipient', icon: '📦', label: `Recipient (${single.same_person ? sender.name || 'You' : single.recipient_name || 'Recipient'})` }].map(opt => (
                                                <label key={opt.value} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', padding: '0.85rem 0.5rem', border: `2px solid ${single.paying_party === opt.value ? '#f97316' : '#e2e8f0'}`, borderRadius: '10px', cursor: 'pointer', background: single.paying_party === opt.value ? '#fff7ed' : 'white', textAlign: 'center' }}>
                                                    <input type="radio" name="paying_party" value={opt.value} checked={single.paying_party === opt.value} onChange={() => setSingle({ ...single, paying_party: opt.value as 'booker' | 'recipient' })} style={{ display: 'none' }} />
                                                    <span style={{ fontSize: '1.35rem' }}>{opt.icon}</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: single.paying_party === opt.value ? '#c2410c' : '#6b7280', lineHeight: 1.3 }}>{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div><label style={lbl}>Package Weight</label><select style={{ ...inp, appearance: 'none' as const }} value={single.weight_over_5kg ? 'over' : 'under'} onChange={e => setSingle({ ...single, weight_over_5kg: e.target.value === 'over' })}><option value="under">Under 5kg</option><option value="over">Over 5kg (+GHS 10 surcharge)</option></select></div>
                                    <div><label style={lbl}>Package Description</label><textarea style={{ ...inp, minHeight: '65px', resize: 'vertical' as const }} value={single.package_description} onChange={e => setSingle({ ...single, package_description: e.target.value })} placeholder="e.g. 2 boxes of clothing..." /></div>
                                </>
                            )}

                            {/* MULTI DELIVERY */}
                            {deliveryType === 'multi_delivery' && (
                                <>
                                    <div>
                                        <label style={lbl}>Pickup Address *</label>
                                        <input style={inp} value={singlePickupAddress} onChange={e => setSinglePickupAddress(e.target.value)} placeholder="Start typing pickup address..." autoComplete="off"
                                            ref={el => { if (el && mapsReady) attachStopAC(el, setSinglePickupAddress); }} />
                                    </div>

                                    <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <label style={{ ...lbl, marginBottom: 0 }}>Delivery Stops ({deliveryStops.length}/{MAX_STOPS})</label>
                                            {deliveryStops.length < MAX_STOPS && (
                                                <button onClick={() => addStop(deliveryStops, setDeliveryStops)} style={{ background: '#1a2456', color: 'white', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 600 }}>+ Add Stop</button>
                                            )}
                                        </div>
                                        {deliveryStops.map((stop, i) => (
                                            <StopCard key={stop.id} stop={stop} index={i} label="Delivery Stop" list={deliveryStops} setList={setDeliveryStops} showPayingParty={true} bookerName={sender.name} mapsReady={mapsReady} attachStopAC={attachStopAC} />
                                        ))}
                                    </div>

                                    {calculatingDistance && <div style={{ background: '#f8f9ff', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', border: '2px solid #1a2456', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Calculating distances...</div>}
                                    {!calculatingDistance && deliveryStops.some(s => s.fee > 0) && (
                                        <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                                            <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>Fee per stop — each paid independently</div>
                                            {deliveryStops.map((s, i) => s.fee > 0 && (
                                                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', paddingBottom: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                                                    <span style={{ color: '#374151' }}>Stop {i + 1} — {s.contact_name || 'Recipient'} ({s.distance_km}km) · Paid by {s.paying_party === 'recipient' ? s.contact_name || 'Recipient' : sender.name || 'Sender'}</span>
                                                    <span style={{ color: '#f97316', fontWeight: 700, marginLeft: '0.5rem', flexShrink: 0 }}>GHS {s.fee}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* MULTI PICKUP */}
                            {deliveryType === 'multi_pickup' && (
                                <>
                                    <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <label style={{ ...lbl, marginBottom: 0 }}>Pickup Stops ({pickupStops.length}/{MAX_STOPS})</label>
                                            {pickupStops.length < MAX_STOPS && (
                                                <button onClick={() => addStop(pickupStops, setPickupStops)} style={{ background: '#1a2456', color: 'white', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 600 }}>+ Add Stop</button>
                                            )}
                                        </div>
                                        {pickupStops.map((stop, i) => (
                                            <StopCard key={stop.id} stop={stop} index={i} label="Pickup Stop" list={pickupStops} setList={setPickupStops} mapsReady={mapsReady} attachStopAC={attachStopAC} />
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '1rem' }}>
                                        <label style={{ ...lbl, marginBottom: '0.85rem' }}>Delivery Address *</label>
                                        <input style={{ ...inp, marginBottom: '0.75rem' }} value={singleDeliveryAddress} onChange={e => setSingleDeliveryAddress(e.target.value)} placeholder="Start typing delivery address..." autoComplete="off"
                                            ref={el => { if (el && mapsReady) attachStopAC(el, setSingleDeliveryAddress); }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <div><label style={lbl}>Recipient Name *</label><input style={inp} value={singleRecipient.name} onChange={e => setSingleRecipient({ ...singleRecipient, name: e.target.value })} placeholder="Recipient's name" /></div>
                                            <div><label style={lbl}>Recipient Phone *</label><input style={inp} value={singleRecipient.phone} onChange={e => setSingleRecipient({ ...singleRecipient, phone: e.target.value })} placeholder="0XX XXX XXXX" /></div>
                                        </div>
                                    </div>

                                    {calculatingDistance && <div style={{ background: '#f8f9ff', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '14px', height: '14px', border: '2px solid #1a2456', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Calculating total distance...</div>}
                                    {totalDistanceKm > 0 && !calculatingDistance && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', color: '#15803d' }}>📍 Total distance: <strong>{distanceText}</strong> across {pickupStops.length} pickup stops</div>}
                                </>
                            )}

                            {/* Fee breakdown */}
                            {totalDistanceKm > 0 && (
                                <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.5rem' }}>Estimated delivery fee</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span style={{ color: '#374151' }}>Base fee (first 10km)</span><span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {BASE_FEE}</span></div>
                                    {totalDistanceKm > BASE_KM && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span style={{ color: '#374151' }}>Extra distance ({totalDistanceKm - BASE_KM}km × GHS {PER_KM})</span><span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {Math.round((totalDistanceKm - BASE_KM) * PER_KM)}</span></div>}
                                    {hasHeavy && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span style={{ color: '#374151' }}>Weight surcharge (over 5kg)</span><span style={{ color: '#1a2456', fontWeight: 600 }}>GHS {WEIGHT_SURCHARGE}</span></div>}
                                    {deliveryType !== 'single' && totalStops > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}><span style={{ color: '#374151' }}>Stops</span><span style={{ color: '#1a2456', fontWeight: 600 }}>{totalStops} stops, 1 base fee</span></div>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.25rem' }}><span style={{ color: '#1a2456' }}>Estimated Total</span><span style={{ color: '#f97316' }}>GHS {deliveryFee}</span></div>
                                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>Pay on delivery · One base fee covers all stops</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4 — CONFIRM */}
                    {step === 4 && (
                        <div>
                            <h2 style={{ color: '#1a2456', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Review & Confirm</h2>

                            <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                                {/* Delivery type */}
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Booking Type</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem', marginBottom: '0.65rem' }}>
                                    <span style={{ color: '#666' }}>Type</span>
                                    <span style={{ color: '#1a2456', fontWeight: 500 }}>{deliveryType === 'single' ? 'Single' : deliveryType === 'multi_delivery' ? `Multi-Drop (${deliveryStops.length} stops)` : `Multi-Pickup (${pickupStops.length} stops)`}</span>
                                </div>

                                {/* Sender */}
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Sender</div>
                                {[['Name', sender.name], ['Phone', sender.phone], ...(sender.email ? [['Email', sender.email]] : [])].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#666' }}>{k}</span><span style={{ color: '#1a2456', fontWeight: 500 }}>{v}</span>
                                    </div>
                                ))}

                                {/* Stops summary */}
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0.75rem 0 0.5rem' }}>
                                    {deliveryType === 'single' ? 'Delivery' : deliveryType === 'multi_delivery' ? 'Pickup & Deliveries' : 'Pickups & Delivery'}
                                </div>

                                {deliveryType === 'single' && [
                                    ['Pickup', single.pickup_address],
                                    ['Delivery', single.delivery_address],
                                    ['Recipient', single.same_person ? sender.name : single.recipient_name],
                                    ['Recipient Phone', single.same_person ? sender.phone : single.recipient_phone],
                                    ['Pays', single.paying_party === 'booker' ? sender.name : (single.same_person ? sender.name : single.recipient_name)],
                                    ['Date', `${single.pickup_date} at ${single.pickup_time}`],
                                    ['Weight', single.weight_over_5kg ? 'Over 5kg' : 'Under 5kg'],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#666', flexShrink: 0, marginRight: '1rem' }}>{k}</span><span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}

                                {deliveryType === 'multi_delivery' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}><span style={{ color: '#666' }}>Pickup</span><span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right', maxWidth: '200px' }}>{singlePickupAddress}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}><span style={{ color: '#666' }}>Date</span><span style={{ color: '#1a2456', fontWeight: 500 }}>{sharedPickupDate} at {sharedPickupTime}</span></div>
                                        {deliveryStops.map((s, i) => (
                                            <div key={s.id} style={{ margin: '0.5rem 0', padding: '0.65rem', background: 'white', borderRadius: '8px', fontSize: '0.82rem', border: '1px solid #e5e7eb' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                                    <div style={{ fontWeight: 700, color: '#f97316' }}>Stop {i + 1}</div>
                                                    <div style={{ fontWeight: 700, color: '#f97316' }}>GHS {s.fee}</div>
                                                </div>
                                                <div style={{ color: '#374151' }}>{s.contact_name} · {s.contact_phone}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>{s.address}</div>
                                                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                                    Pays: {s.paying_party === 'recipient' ? s.contact_name : sender.name || 'Sender'} · {s.weight_over_5kg ? 'Over 5kg' : 'Under 5kg'}
                                                </div>
                                            </div>
                                        ))}
                                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>Each stop is billed and paid independently.</p>
                                    </>
                                )}

                                {deliveryType === 'multi_pickup' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}><span style={{ color: '#666' }}>Date</span><span style={{ color: '#1a2456', fontWeight: 500 }}>{sharedPickupDate} at {sharedPickupTime}</span></div>
                                        {pickupStops.map((s, i) => (
                                            <div key={s.id} style={{ margin: '0.5rem 0', padding: '0.5rem', background: 'white', borderRadius: '8px', fontSize: '0.82rem' }}>
                                                <div style={{ fontWeight: 700, color: '#1a2456', marginBottom: '0.3rem' }}>Pickup {i + 1}</div>
                                                <div style={{ color: '#374151' }}>{s.contact_name} · {s.contact_phone}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>{s.address}</div>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem', marginTop: '0.5rem' }}><span style={{ color: '#666' }}>Delivery to</span><span style={{ color: '#1a2456', fontWeight: 500, textAlign: 'right', maxWidth: '200px' }}>{singleDeliveryAddress}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem' }}><span style={{ color: '#666' }}>Recipient</span><span style={{ color: '#1a2456', fontWeight: 500 }}>{singleRecipient.name} · {singleRecipient.phone}</span></div>
                                    </>
                                )}

                                {/* Fee */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.32rem 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                    <span style={{ color: '#666' }}>Notifications</span>
                                    <span style={{ color: '#1a2456', fontWeight: 500 }}>{notifPref === 'both' ? 'Email & WhatsApp' : notifPref === 'email' ? 'Email' : 'WhatsApp'}</span>
                                </div>
                                {deliveryType !== 'multi_delivery' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontSize: '1.1rem', fontWeight: 800 }}>
                                        <span style={{ color: '#1a2456' }}>Estimated Fee</span>
                                        <span style={{ color: '#f97316' }}>GHS {deliveryFee}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#15803d' }}>
                                💰 <strong>Pay on delivery</strong> — {deliveryType === 'multi_delivery' ? 'each stop is billed and paid independently on delivery' : `payment collected when your package${deliveryType !== 'single' ? 's are' : ' is'} delivered`}
                            </div>

                            <button onClick={confirmBooking} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#f97316', color: 'white', border: 'none', padding: '1rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                                {loading ? 'Confirming...' : 'Confirm Delivery Booking'}
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        {step > 1 && <button onClick={() => { setStep(step - 1); setError(''); }} style={{ flex: 1, padding: '0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>← Back</button>}
                        {step < 4 && <button onClick={nextStep} style={{ flex: 1, padding: '0.85rem', background: '#1a2456', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' }}>Continue →</button>}
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1.25rem' }}>
                    Need help? Call <a href="tel:+233256089599" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>0256 089 599</a> or <a href="https://wa.me/233256089599" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>WhatsApp us</a>
                </p>
            </div>
        </div>
    );
}