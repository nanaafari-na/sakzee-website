import { NextRequest, NextResponse } from 'next/server';
import { notifyClientOrderStatus } from '@/lib/notifications';

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
            `${SUPABASE_URL}/rest/v1/bookings?select=*&order=paid_at.desc`,
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
        const { reference, status } = await req.json();

        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}`,
            {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ status }),
            }
        );
        if (!res.ok) throw new Error('Failed to update');

        // Get booking to notify client
        const bookingRes = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}&select=*`,
            { headers }
        );
        const bookings = await bookingRes.json();
        if (bookings?.[0]) {
            const b = bookings[0];
            await notifyClientOrderStatus(
                { email: b.email, name: b.name, phone: b.phone },
                {
                    reference: b.reference,
                    status,
                    service: b.booking_type === 'delivery'
                        ? `Delivery — ${b.pickup_address} → ${b.delivery_address || b.notes}`
                        : b.service,
                }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}