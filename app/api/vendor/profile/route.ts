import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function GET(req: NextRequest) {
    const vendor_id = req.nextUrl.searchParams.get('vendor_id');
    if (!vendor_id) return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });

    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/vendors?id=eq.${vendor_id}&select=business_name,contact_name,phone,address,notification_preference`,
        { headers }
    );
    const data = await res.json();
    return NextResponse.json(data?.[0] || {});
}

export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { vendor_id, business_name, contact_name, phone, address, notification_preference } = body;
    if (!vendor_id) return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });

    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/vendors?id=eq.${vendor_id}`,
        {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ business_name, contact_name, phone, address, notification_preference }),
        }
    );

    if (!res.ok) return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    return NextResponse.json({ success: true });
}