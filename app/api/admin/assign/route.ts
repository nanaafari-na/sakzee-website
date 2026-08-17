import { NextRequest, NextResponse } from 'next/server';
import { notifyClientOrderStatus, notifyRiderAssigned } from '@/lib/notifications';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function POST(req: NextRequest) {
    try {
        const { booking_id, rider_id } = await req.json();
        if (!booking_id || !rider_id) return NextResponse.json({ error: 'Missing booking_id or rider_id' }, { status: 400 });

        // Check if already assigned
        const existingRes = await fetch(
            `${SUPABASE_URL}/rest/v1/delivery_assignments?booking_id=eq.${encodeURIComponent(booking_id)}&status=neq.delivered`,
            { headers }
        );
        const existing = await existingRes.json();
        if (existing?.length > 0) {
            // Update existing assignment
            await fetch(
                `${SUPABASE_URL}/rest/v1/delivery_assignments?id=eq.${existing[0].id}`,
                {
                    method: 'PATCH',
                    headers: { ...headers, 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ rider_id, assigned_at: new Date().toISOString() }),
                }
            );
        } else {
            // Create new assignment
            await fetch(`${SUPABASE_URL}/rest/v1/delivery_assignments`, {
                method: 'POST',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ booking_id, rider_id, status: 'assigned', assigned_at: new Date().toISOString() }),
            });
        }

        // Update booking status to Processing
        await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(booking_id)}`,
            {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ status: 'Processing' }),
            }
        );

        // Get booking details to notify client
        const bookingRes = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(booking_id)}&select=*`,
            { headers }
        );
        const bookings = await bookingRes.json();
        const booking = bookings?.[0];

        // Get rider details
        const riderRes = await fetch(
            `${SUPABASE_URL}/rest/v1/riders?id=eq.${rider_id}&select=name,phone`,
            { headers }
        );
        const riders = await riderRes.json();
        const rider = riders?.[0];

        // Notify client
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
                    status: 'Processing',
                    service: `Delivery — Rider: ${rider?.name || 'Assigned'}`,
                }
            );
        }

        // Notify rider via SMS
        if (rider?.phone && booking) {
            await notifyRiderAssigned(
                { phone: rider.phone, name: rider.name },
                {
                    reference: booking.reference,
                    delivery_type: booking.delivery_type || 'single',
                    total_stops: booking.total_stops || 1,
                    pickup_address: booking.pickup_address,
                    delivery_address: booking.delivery_address,
                    date: booking.date,
                    pickup_time: booking.pickup_time,
                }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}