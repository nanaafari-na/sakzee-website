import { NextRequest, NextResponse } from 'next/server';
import { notifyClientOrderStatus } from '@/lib/notifications';

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

        // Fetch booking details for each assignment
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
        const { status } = await req.json();

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

        // Update booking status
        if (assignment?.booking_id) {
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

                // Notify client
                const bookingRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(assignment.booking_id)}&select=*`,
                    { headers }
                );
                const bookings = await bookingRes.json();
                const booking = bookings?.[0];
                if (booking) {
                    await notifyClientOrderStatus(
                        {
                            email: booking.email,
                            name: booking.name,
                            phone: booking.phone,
                            notification_preference: booking.notification_preference || 'both',
                        },
                        {
                            reference: booking.reference,
                            status: bookingStatus,
                            service: 'Delivery',
                        }
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}