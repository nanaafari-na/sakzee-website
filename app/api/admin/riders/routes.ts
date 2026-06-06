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
            `${SUPABASE_URL}/rest/v1/riders?select=*&order=created_at.desc`,
            { headers }
        );
        const data = await res.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, phone, pin, email, vehicle_type, license_plate } = await req.json();
        if (!name || !phone || !pin) return NextResponse.json({ error: 'Name, phone and PIN required' }, { status: 400 });

        // Normalize phone
        let normalized = phone.replace(/\s/g, '');
        if (normalized.startsWith('0')) normalized = '233' + normalized.slice(1);
        if (normalized.startsWith('+')) normalized = normalized.slice(1);

        const res = await fetch(`${SUPABASE_URL}/rest/v1/riders`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify({ name, phone: normalized, pin, email: email || null, vehicle_type: vehicle_type || 'motorcycle', license_plate: license_plate || null, status: 'active' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create rider');
        return NextResponse.json(data[0]);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    try {
        const body = await req.json();
        const res = await fetch(`${SUPABASE_URL}/rest/v1/riders?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to update');
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}