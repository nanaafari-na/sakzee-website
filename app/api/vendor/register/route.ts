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
        const { email, password, business_name, contact_name, phone, address } = await req.json();

        // 1. Create Supabase Auth user
        const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, password, email_confirm: true }),
        });
        const authData = await authRes.json();
        if (!authRes.ok) throw new Error(authData.msg || authData.message || 'Failed to create account');

        // 2. Save vendor profile — status is PENDING until Sakzee admin approves
        await fetch(`${SUPABASE_URL}/rest/v1/vendors`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
                email,
                business_name,
                contact_name,
                phone,
                address,
                status: 'pending',
            }),
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}