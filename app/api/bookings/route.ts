import { NextRequest, NextResponse } from 'next/server';
import { notifyDeliveryBooked, notifyClientBooking } from '@/lib/notifications';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
                reference: body.reference,
                name: body.name,
                phone: body.phone,
                email: body.email || null,
                business: body.business || '',
                service: body.service,
                date: body.date,
                notes: body.notes || '',
                pickup_address: body.pickup_address || null,
                delivery_address: body.delivery_address || null,
                package_description: body.package_description || null,
                pickup_time: body.pickup_time || null,
                booking_type: body.booking_type || 'consultation',
                delivery_fee: body.delivery_fee || 0,
                distance_km: body.distance_km || 0,
                region: body.region || null,
                notification_preference: body.notification_preference || 'both',
                payment_status: body.payment_status || 'pending',
                status: body.status || 'Received',
                recipient_name: body.recipient_name || null,
                recipient_phone: body.recipient_phone || null,
                paying_party: body.paying_party || 'booker',
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: err }, { status: 500 });
        }

        // Send notifications
        if (body.booking_type === 'delivery') {
            await notifyDeliveryBooked({
                reference: body.reference,
                booker_name: body.name,
                booker_phone: body.phone,
                recipient_name: body.recipient_name || body.name,
                recipient_phone: body.recipient_phone || body.phone,
                pickup_address: body.pickup_address,
                delivery_address: body.delivery_address,
                pickup_date: body.date,
                pickup_time: body.pickup_time,
                delivery_fee: body.delivery_fee || 0,
                paying_party: body.paying_party || 'booker',
                notification_preference: body.notification_preference || 'both',
                same_person: body.same_person || false,
            });
        } else {
            await notifyClientBooking(
                { phone: body.phone, name: body.name, notification_preference: body.notification_preference || 'both' },
                { reference: body.reference, service: body.service, date: body.date }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}