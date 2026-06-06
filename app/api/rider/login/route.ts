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
        const { phone, pin } = await req.json();
        if (!phone || !pin) return NextResponse.json({ error: 'Phone and PIN required' }, { status: 400 });

        // Normalize phone
        let normalized = phone.replace(/\s/g, '');
        if (normalized.startsWith('0')) normalized = '233' + normalized.slice(1);
        if (normalized.startsWith('+')) normalized = normalized.slice(1);

        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/riders?phone=eq.${normalized}&select=*`,
            { headers }
        );
        const riders = await res.json();
        const rider = riders?.[0];

        if (!rider) return NextResponse.json({ error: 'Phone number not found' }, { status: 401 });
        if (rider.pin !== pin) return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
        if (rider.status === 'inactive') return NextResponse.json({ error: 'Account inactive. Contact admin.' }, { status: 403 });

        return NextResponse.json({ rider: { id: rider.id, name: rider.name, phone: rider.phone } });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}