import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function GET(req: NextRequest) {
    try {
        const vendor_id = req.nextUrl.searchParams.get('vendor_id');
        if (!vendor_id) return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });

        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/storage_invoices?vendor_id=eq.${vendor_id}&select=*&order=month.desc`,
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
        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const body = await req.json();
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/storage_invoices?id=eq.${id}`,
            {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify(body),
            }
        );

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}