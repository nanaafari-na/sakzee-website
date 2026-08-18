import { NextRequest, NextResponse } from 'next/server';
import { notifyClientOrderStatus, notifyRiderCashPending } from '@/lib/notifications';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function PATCH(req: NextRequest) {
    try {
        const { stop_id, reference, payment_status, payment_method } = await req.json();
        if (!stop_id || !reference) return NextResponse.json({ error: 'Missing stop_id or reference' }, { status: 400 });

        const updateBody: any = { payment_status, payment_method };
        if (payment_status === 'paid') updateBody.paid_at = new Date().toISOString();

        // Update stop payment status
        await fetch(`${SUPABASE_URL}/rest/v1/booking_stops?id=eq.${stop_id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify(updateBody),
        });

        // Get full stop and booking details
        const stopRes = await fetch(`${SUPABASE_URL}/rest/v1/booking_stops?id=eq.${stop_id}&select=*`, { headers });
        const stops = await stopRes.json();
        const stop = stops?.[0];

        const bookingRes = await fetch(`${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}&select=*`, { headers });
        const bookings = await bookingRes.json();
        const booking = bookings?.[0];

        if (stop && booking) {
            const pref = booking.notification_preference || 'whatsapp';

            if (payment_status === 'cash_pending') {
                // Notify rider to confirm cash for this stop
                const assignmentRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/delivery_assignments?booking_id=eq.${encodeURIComponent(reference)}&select=*&limit=1`,
                    { headers }
                );
                const assignments = await assignmentRes.json();
                const assignment = assignments?.[0];

                if (assignment?.rider_id) {
                    const riderRes = await fetch(
                        `${SUPABASE_URL}/rest/v1/riders?id=eq.${assignment.rider_id}&select=phone,name`,
                        { headers }
                    );
                    const riders = await riderRes.json();
                    const rider = riders?.[0];
                    if (rider?.phone) {
                        await notifyRiderCashPending(
                            { phone: rider.phone, name: rider.name },
                            { reference: `${reference} Stop ${stop.stop_order}`, delivery_fee: stop.delivery_fee }
                        );
                    }
                }

            } else if (payment_status === 'paid') {
                // Notify paying party payment received
                const payingPhone = stop.paying_party === 'recipient' ? stop.contact_phone : booking.phone;
                const payingName = stop.paying_party === 'recipient' ? stop.contact_name : booking.name;

                await notifyClientOrderStatus(
                    { phone: payingPhone, name: payingName, notification_preference: pref },
                    { reference: `${reference} Stop ${stop.stop_order}`, status: 'Payment Received', service: `Stop ${stop.stop_order} payment confirmed`, delivery_fee: stop.delivery_fee }
                );

                // Check if all stops are now paid — update main booking
                const allStopsRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/booking_stops?booking_id=eq.${encodeURIComponent(reference)}&stop_type=eq.delivery&select=payment_status`,
                    { headers }
                );
                const allStops = await allStopsRes.json();
                const allPaid = allStops.every((s: any) => s.payment_status === 'paid');

                if (allPaid) {
                    await fetch(
                        `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}`,
                        {
                            method: 'PATCH',
                            headers: { ...headers, 'Prefer': 'return=minimal' },
                            body: JSON.stringify({ payment_status: 'paid', paid_at: new Date().toISOString() }),
                        }
                    );
                    // Notify booker all stops paid
                    await notifyClientOrderStatus(
                        { phone: booking.phone, email: booking.email, name: booking.name, notification_preference: pref },
                        { reference, status: 'All Payments Complete', service: 'All delivery stops have been paid. Thank you!' }
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}