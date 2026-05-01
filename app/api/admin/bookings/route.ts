import { NextRequest, NextResponse } from 'next/server';

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
    } catch {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
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
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}
