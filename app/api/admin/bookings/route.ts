import { NextRequest, NextResponse } from 'next/server';
import { notifyDeliveryStatus, notifyClientOrderStatus } from '@/lib/notifications';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function GET() {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?select=*&order=created_at.desc`,
            { headers }
        );
        const data = await res.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { reference, status, payment_status } = body;

        const updateBody: any = {};
        if (status) updateBody.status = status;
        if (payment_status) updateBody.payment_status = payment_status;
        if (payment_status === 'paid') updateBody.paid_at = new Date().toISOString();

        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}`,
            {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify(updateBody),
            }
        );
        if (!res.ok) throw new Error('Failed to update booking');

        // Get full booking
        const bookingRes = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}&select=*`,
            { headers }
        );
        const bookings = await bookingRes.json();
        const b = bookings?.[0];

        if (b) {
            const pref = b.notification_preference || 'whatsapp';

            // Payment confirmed — notify paying party + rider
            if (payment_status === 'paid') {
                const payingPhone = b.paying_party === 'recipient' ? b.recipient_phone : b.phone;
                const payingName = b.paying_party === 'recipient' ? b.recipient_name : b.name;
                const payingEmail = b.paying_party === 'booker' ? b.email : null;

                await notifyClientOrderStatus(
                    { phone: payingPhone, email: payingEmail, name: payingName, notification_preference: pref },
                    { reference: b.reference, status: 'Payment Received', service: 'Delivery', delivery_fee: b.delivery_fee }
                );

                // Notify rider
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
                        await notifyClientOrderStatus(
                            { phone: rider.phone, name: rider.name, notification_preference: 'whatsapp' },
                            { reference: b.reference, status: 'Payment Confirmed', service: 'Delivery', delivery_fee: b.delivery_fee }
                        );
                    }
                }

                // Status update
            } else if (status) {
                if (b.booking_type === 'delivery' && b.recipient_phone) {
                    await notifyDeliveryStatus({
                        reference: b.reference,
                        booker_name: b.name,
                        booker_phone: b.phone,
                        booker_email: b.email,
                        recipient_name: b.recipient_name || b.name,
                        recipient_phone: b.recipient_phone || b.phone,
                        status,
                        delivery_fee: b.delivery_fee || 0,
                        paying_party: b.paying_party || 'booker',
                        notification_preference: pref,
                        same_person: b.recipient_phone === b.phone,
                    });
                } else {
                    await notifyClientOrderStatus(
                        { phone: b.phone, email: b.email, name: b.name, notification_preference: pref },
                        { reference: b.reference, status, service: b.service, delivery_fee: b.delivery_fee }
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}