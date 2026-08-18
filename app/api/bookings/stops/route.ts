import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function GET(req: NextRequest) {
    const reference = req.nextUrl.searchParams.get('reference');
    const stop_id = req.nextUrl.searchParams.get('stop_id');

    if (!reference || !stop_id) return NextResponse.json({ error: 'Missing reference or stop_id' }, { status: 400 });

    try {
        // Get booking
        const bookingRes = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}&select=*`,
            { headers }
        );
        const bookings = await bookingRes.json();
        const booking = bookings?.[0];
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        // Get stop
        const stopRes = await fetch(
            `${SUPABASE_URL}/rest/v1/booking_stops?id=eq.${stop_id}&select=*`,
            { headers }
        );
        const stops = await stopRes.json();
        const stop = stops?.[0];
        if (!stop) return NextResponse.json({ error: 'Stop not found' }, { status: 404 });

        return NextResponse.json({ booking, stop });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}