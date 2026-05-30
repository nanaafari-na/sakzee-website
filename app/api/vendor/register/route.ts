import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(req: NextRequest) {
    try {
        const {
            email, password, business_name, contact_name,
            phone, address, notification_preference,
        } = await req.json();

        if (!SUPABASE_URL || !SERVICE_KEY) {
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        // 1. Create Supabase Auth user
        const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, email_confirm: true }),
        });

        const authData = await authRes.json();
        if (!authRes.ok) {
            const errMsg = authData.msg || authData.message || authData.error_description || authData.error || JSON.stringify(authData);
            return NextResponse.json({ error: errMsg }, { status: 400 });
        }

        // 2. Save vendor profile with notification preference
        const vendorRes = await fetch(`${SUPABASE_URL}/rest/v1/vendors`, {
            method: 'POST',
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                email,
                business_name,
                contact_name,
                phone,
                address: address || '',
                status: 'pending',
                notification_preference: notification_preference || 'both',
            }),
        });

        if (!vendorRes.ok) {
            const vendorErr = await vendorRes.text();
            return NextResponse.json({ error: `Profile save failed: ${vendorErr}` }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Unknown error occurred' }, { status: 500 });
    }
}