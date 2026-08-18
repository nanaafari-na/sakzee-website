import { NextRequest, NextResponse } from 'next/server';
import { notifyDeliveryStatus, notifyClientOrderStatus } from '@/lib/notifications';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function GET(req: NextRequest) {
    const rider_id = req.nextUrl.searchParams.get('rider_id');
    if (!rider_id) return NextResponse.json({ error: 'Missing rider_id' }, { status: 400 });

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/delivery_assignments?rider_id=eq.${rider_id}&order=assigned_at.desc`,
            { headers }
        );
        const assignments = await res.json();

        const enriched = await Promise.all(assignments.map(async (a: any) => {
            const bookingRes = await fetch(
                `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(a.booking_id)}&select=*`,
                { headers }
            );
            const bookings = await bookingRes.json();
            const booking = bookings?.[0] || null;

            // For multi-delivery, fetch delivery stops
            // For multi-pickup, fetch pickup stops
            let stops: any[] = [];
            if (booking?.delivery_type === 'multi_delivery') {
                const stopsRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/booking_stops?booking_id=eq.${encodeURIComponent(a.booking_id)}&stop_type=eq.delivery&order=stop_order.asc`,
                    { headers }
                );
                stops = await stopsRes.json();
            } else if (booking?.delivery_type === 'multi_pickup') {
                const stopsRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/booking_stops?booking_id=eq.${encodeURIComponent(a.booking_id)}&stop_type=eq.pickup&order=stop_order.asc`,
                    { headers }
                );
                stops = await stopsRes.json();
            }

            return { ...a, booking, stops };
        }));

        return NextResponse.json(enriched);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
        const body = await req.json();
        const { status, failure_reason, failure_notes, stop_id } = body;

        // ── Handle individual stop update (multi-delivery) ──────────────
        if (stop_id) {
            const stopUpdate: any = { status };
            if (status === 'delivered') stopUpdate.delivered_at = new Date().toISOString();
            if (status === 'failed') {
                stopUpdate.failure_reason = failure_reason || 'Unknown';
                stopUpdate.failure_notes = failure_notes || '';
            }

            await fetch(`${SUPABASE_URL}/rest/v1/booking_stops?id=eq.${stop_id}`, {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify(stopUpdate),
            });

            // Get assignment to find booking
            const assignRes = await fetch(`${SUPABASE_URL}/rest/v1/delivery_assignments?id=eq.${id}&select=*`, { headers });
            const assigns = await assignRes.json();
            const assignment = assigns?.[0];

            if (assignment?.booking_id) {
                // Get full booking
                const bRes = await fetch(`${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}&select=*`, { headers });
                const bookings = await bRes.json();
                const b = bookings?.[0];

                // Get this specific stop
                const stopRes = await fetch(`${SUPABASE_URL}/rest/v1/booking_stops?id=eq.${stop_id}&select=*`, { headers });
                const stops = await stopRes.json();
                const stop = stops?.[0];

                if (b && stop) {
                    const pref = b.notification_preference || 'whatsapp';

                    if (status === 'delivered') {
                        const isPickup = b.delivery_type === 'multi_pickup';
                        const stopStatusLabel = isPickup ? 'Collected' : 'Delivered';

                        // Notify contact for this stop
                        await notifyClientOrderStatus(
                            { phone: stop.contact_phone, name: stop.contact_name, notification_preference: pref },
                            {
                                reference: b.reference,
                                status: stopStatusLabel,
                                service: isPickup
                                    ? `Stop ${stop.stop_order} collected by rider`
                                    : `Stop ${stop.stop_order} delivered`,
                                delivery_fee: isPickup ? undefined : stop.delivery_fee,
                            }
                        );

                        // Send per-stop payment link for delivery stops
                        if (!isPickup && stop.delivery_fee > 0) {
                            const payingPhone = stop.paying_party === 'recipient' ? stop.contact_phone : b.phone;
                            const payingName = stop.paying_party === 'recipient' ? stop.contact_name : b.name;
                            const payLink = `sakzee.com/pay/${b.reference}/stop/${stop.id}`;
                            await notifyClientOrderStatus(
                                { phone: payingPhone, name: payingName, notification_preference: pref },
                                {
                                    reference: b.reference,
                                    status: 'Payment Due',
                                    service: `Stop ${stop.stop_order} delivered. Pay GHS ${stop.delivery_fee}: ${payLink}`,
                                    delivery_fee: stop.delivery_fee,
                                }
                            );
                        }

                        // Check if ALL stops are now done — update main booking
                        const stopType = b.delivery_type === 'multi_pickup' ? 'pickup' : 'delivery';
                        const allStopsRes = await fetch(
                            `${SUPABASE_URL}/rest/v1/booking_stops?booking_id=eq.${encodeURIComponent(assignment.booking_id)}&stop_type=eq.${stopType}&select=status`,
                            { headers }
                        );
                        const allStops = await allStopsRes.json();
                        const allDone = allStops.every((s: any) => s.status === 'delivered' || s.status === 'failed');
                        const allDelivered = allStops.every((s: any) => s.status === 'delivered');

                        if (allDone) {
                            // For multi_pickup: all pickups collected → now status = Shipped (on the way to delivery)
                            // For multi_delivery: all delivered → Delivered or Partially Delivered
                            const finalStatus = b.delivery_type === 'multi_pickup'
                                ? (allDelivered ? 'Shipped' : 'Partially Collected')
                                : (allDelivered ? 'Delivered' : 'Partially Delivered');

                            await fetch(`${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}`, {
                                method: 'PATCH',
                                headers: { ...headers, 'Prefer': 'return=minimal' },
                                body: JSON.stringify({ status: finalStatus }),
                            });

                            if (b.delivery_type !== 'multi_pickup') {
                                await fetch(`${SUPABASE_URL}/rest/v1/delivery_assignments?id=eq.${id}`, {
                                    method: 'PATCH',
                                    headers: { ...headers, 'Prefer': 'return=minimal' },
                                    body: JSON.stringify({ status: 'delivered', delivered_at: new Date().toISOString() }),
                                });
                            }

                            // Notify booker
                            await notifyClientOrderStatus(
                                { phone: b.phone, email: b.email, name: b.name, notification_preference: pref },
                                {
                                    reference: b.reference,
                                    status: b.delivery_type === 'multi_pickup'
                                        ? (allDelivered ? 'All pickups collected — on the way!' : 'Some pickups collected')
                                        : (allDelivered ? 'All Delivered' : 'Partially Delivered'),
                                    service: b.delivery_type === 'multi_pickup' ? 'Multi-Pickup' : 'Multi-Drop Delivery',
                                }
                            );
                        }

                    } else if (status === 'failed') {
                        const returnFee = Math.max(25, Math.round((stop.delivery_fee || 0) / 2));
                        await fetch(`${SUPABASE_URL}/rest/v1/booking_stops?id=eq.${stop_id}`, {
                            method: 'PATCH',
                            headers: { ...headers, 'Prefer': 'return=minimal' },
                            body: JSON.stringify({ delivery_fee: returnFee }),
                        });
                        // Notify booker of failed stop
                        await notifyClientOrderStatus(
                            { phone: b.phone, email: b.email, name: b.name, notification_preference: pref },
                            { reference: b.reference, status: 'Stop Failed', service: `Stop ${stop.stop_order} failed: ${failure_reason}. Return fee: GHS ${returnFee}`, delivery_fee: returnFee }
                        );
                        // Notify recipient
                        if (stop.contact_phone && stop.contact_phone !== b.phone) {
                            await notifyClientOrderStatus(
                                { phone: stop.contact_phone, name: stop.contact_name, notification_preference: pref },
                                { reference: b.reference, status: 'Delivery Failed', service: `Could not deliver: ${failure_reason}. Contact sender.` }
                            );
                        }
                    }
                }
            }

            return NextResponse.json({ success: true });
        }

        // ── Handle standard single assignment update ────────────────────
        const updateBody: any = { status };
        if (status === 'picked_up') updateBody.picked_up_at = new Date().toISOString();
        if (status === 'delivered') updateBody.delivered_at = new Date().toISOString();

        const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_assignments?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(updateBody),
        });
        const assignments = await res.json();
        const assignment = assignments?.[0];

        if (assignment?.booking_id) {
            const bookingRes = await fetch(
                `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}&select=*`,
                { headers }
            );
            const bookings = await bookingRes.json();
            const b = bookings?.[0];

            if (b) {
                const pref = b.notification_preference || 'whatsapp';

                if (status === 'failed') {
                    const returnFee = Math.max(25, Math.round((b.delivery_fee || 0) / 2));
                    await fetch(`${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}`, {
                        method: 'PATCH',
                        headers: { ...headers, 'Prefer': 'return=minimal' },
                        body: JSON.stringify({ status: 'Failed', failure_reason: failure_reason || 'Unknown', failure_notes: failure_notes || '', return_fee: returnFee, delivery_fee: returnFee }),
                    });
                    await notifyClientOrderStatus(
                        { phone: b.phone, email: b.email, name: b.name, notification_preference: pref },
                        { reference: b.reference, status: 'Failed', service: `Delivery failed: ${failure_reason}. Return fee applies.`, delivery_fee: returnFee }
                    );
                    if (b.recipient_phone && b.recipient_phone !== b.phone) {
                        await notifyClientOrderStatus(
                            { phone: b.recipient_phone, name: b.recipient_name || 'Recipient', notification_preference: pref },
                            { reference: b.reference, status: 'Failed', service: `Delivery could not be completed: ${failure_reason}. Please contact sender.` }
                        );
                    }
                } else {
                    const bookingStatus = status === 'picked_up' ? 'Shipped' : status === 'delivered' ? 'Delivered' : null;
                    if (bookingStatus) {
                        await fetch(`${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}`, {
                            method: 'PATCH',
                            headers: { ...headers, 'Prefer': 'return=minimal' },
                            body: JSON.stringify({ status: bookingStatus }),
                        });
                        if (b.booking_type === 'delivery' && b.recipient_phone) {
                            await notifyDeliveryStatus({
                                reference: b.reference,
                                booker_name: b.name, booker_phone: b.phone, booker_email: b.email,
                                recipient_name: b.recipient_name || b.name, recipient_phone: b.recipient_phone || b.phone,
                                status: bookingStatus, delivery_fee: b.delivery_fee || 0,
                                paying_party: b.paying_party || 'booker', notification_preference: pref,
                                same_person: b.recipient_phone === b.phone,
                            });
                        } else {
                            await notifyClientOrderStatus(
                                { phone: b.phone, email: b.email, name: b.name, notification_preference: pref },
                                { reference: b.reference, status: bookingStatus, service: 'Delivery', delivery_fee: b.delivery_fee }
                            );
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}