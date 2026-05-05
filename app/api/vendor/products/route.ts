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
            `${SUPABASE_URL}/rest/v1/products?vendor_id=eq.${vendor_id}&select=*&order=created_at.desc`,
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
        const body = await req.json();

        // New products always start as pending_checkin — Sakzee warehouse must confirm receipt
        const productData = {
            ...body,
            quantity: 0, // quantity is 0 until warehouse confirms check-in
            checkin_status: 'pending_checkin',
            checked_in_quantity: 0,
        };

        const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(productData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        return NextResponse.json(data[0]);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const body = await req.json();
        const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        return NextResponse.json(data[0]);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
            method: 'DELETE',
            headers,
        });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}