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
    if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

    try {
        // Get booking
        const bookingRes = await fetch(
            `${SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}&select=*`,
            { headers }
        );
        const bookings = await bookingRes.json();
        const booking = bookings?.[0];
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        // Get assignment
        const assignmentRes = await fetch(
            `${SUPABASE_URL}/rest/v1/delivery_assignments?booking_id=eq.${encodeURIComponent(reference)}&select=*&order=assigned_at.desc&limit=1`,
            { headers }
        );
        const assignments = await assignmentRes.json();
        const assignment = assignments?.[0] || null;

        // Get rider if assigned
        let rider = null;
        if (assignment?.rider_id) {
            const riderRes = await fetch(
                `${SUPABASE_URL}/rest/v1/riders?id=eq.${assignment.rider_id}&select=id,name,phone,vehicle_type,license_plate,current_lat,current_lng,last_location_update`,
                { headers }
            );
            const riders = await riderRes.json();
            rider = riders?.[0] || null;
        }

        return NextResponse.json({ booking, assignment, rider });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}