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
            return { ...a, booking: bookings?.[0] || null };
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
        const { status, failure_reason, failure_notes } = await req.json();

        const updateBody: any = { status };
        if (status === 'picked_up') updateBody.picked_up_at = new Date().toISOString();
        if (status === 'delivered') updateBody.delivered_at = new Date().toISOString();

        // Update assignment
        const res = await fetch(`${SUPABASE_URL}/rest/v1/delivery_assignments?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(updateBody),
        });
        const assignments = await res.json();
        const assignment = assignments?.[0];

        if (assignment?.booking_id) {
            // Get booking
            const bookingRes = await fetch(
                `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}&select=*`,
                { headers }
            );
            const bookings = await bookingRes.json();
            const b = bookings?.[0];

            if (b) {
                const pref = b.notification_preference || 'whatsapp';

                if (status === 'failed') {
                    // Calculate return fee: max(25, delivery_fee / 2)
                    const returnFee = Math.max(25, Math.round((b.delivery_fee || 0) / 2));
                    const totalDue = (b.delivery_fee || 0) + returnFee;

                    // Update booking with failed status, reason, and return fee
                    await fetch(
                        `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}`,
                        {
                            method: 'PATCH',
                            headers: { ...headers, 'Prefer': 'return=minimal' },
                            body: JSON.stringify({
                                status: 'Failed',
                                failure_reason: failure_reason || 'Unknown',
                                failure_notes: failure_notes || '',
                                return_fee: returnFee,
                            }),
                        }
                    );

                    // Notify booker — they pay original fee + return fee
                    await notifyClientOrderStatus(
                        { phone: b.phone, email: b.email, name: b.name, notification_preference: pref },
                        {
                            reference: b.reference,
                            status: 'Failed',
                            service: `Delivery failed: ${failure_reason}. Return fee: GHS ${returnFee}. Total due: GHS ${totalDue}`,
                            delivery_fee: totalDue,
                        }
                    );

                    // Notify recipient
                    if (b.recipient_phone && b.recipient_phone !== b.phone) {
                        await notifyClientOrderStatus(
                            { phone: b.recipient_phone, name: b.recipient_name || 'Recipient', notification_preference: pref },
                            {
                                reference: b.reference,
                                status: 'Failed',
                                service: `Delivery could not be completed: ${failure_reason}. Please contact sender.`,
                            }
                        );
                    }

                } else {
                    // Standard status update
                    const bookingStatus = status === 'picked_up' ? 'Shipped' : status === 'delivered' ? 'Delivered' : null;

                    if (bookingStatus) {
                        await fetch(
                            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}`,
                            {
                                method: 'PATCH',
                                headers: { ...headers, 'Prefer': 'return=minimal' },
                                body: JSON.stringify({ status: bookingStatus }),
                            }
                        );

                        if (b.booking_type === 'delivery' && b.recipient_phone) {
                            await notifyDeliveryStatus({
                                reference: b.reference,
                                booker_name: b.name,
                                booker_phone: b.phone,
                                booker_email: b.email,
                                recipient_name: b.recipient_name || b.name,
                                recipient_phone: b.recipient_phone || b.phone,
                                status: bookingStatus,
                                delivery_fee: b.delivery_fee || 0,
                                paying_party: b.paying_party || 'booker',
                                notification_preference: pref,
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