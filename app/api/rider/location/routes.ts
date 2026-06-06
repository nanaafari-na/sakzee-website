import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function POST(req: NextRequest) {
    try {
        const { rider_id, lat, lng } = await req.json();
        if (!rider_id || !lat || !lng) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        await fetch(`${SUPABASE_URL}/rest/v1/riders?id=eq.${rider_id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
                current_lat: lat,
                current_lng: lng,
                last_location_update: new Date().toISOString(),
            }),
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}