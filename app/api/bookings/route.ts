import { NextRequest, NextResponse } from 'next/server';
import { notifyClientBooking } from '@/lib/notifications';

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
                email: body.email,
                phone: body.phone,
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
                status: body.status || 'Received',
                paid_at: body.paid_at || new Date().toISOString(),
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: err }, { status: 500 });
        }

        // Send notification
        if (body.booking_type === 'delivery') {
            await notifyClientBooking(
                { email: body.email, name: body.name, phone: body.phone },
                {
                    reference: body.reference,
                    service: `Delivery — ${body.pickup_address} → ${body.delivery_address || body.region}`,
                    date: `${body.date} at ${body.pickup_time}`,
                }
            );
        } else {
            await notifyClientBooking(
                { email: body.email, name: body.name, phone: body.phone },
                { reference: body.reference, service: body.service, date: body.date }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}