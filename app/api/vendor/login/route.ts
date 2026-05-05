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
        const { email, password } = await req.json();

        // 1. Authenticate with Supabase
        const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { 'apikey': SERVICE_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const authData = await authRes.json();
        if (!authRes.ok) throw new Error('Invalid email or password');

        // 2. Get vendor profile
        const vendorRes = await fetch(
            `${SUPABASE_URL}/rest/v1/vendors?email=eq.${encodeURIComponent(email)}&select=*`,
            { headers }
        );
        const vendors = await vendorRes.json();
        if (!vendors || vendors.length === 0) throw new Error('Vendor account not found');

        const vendor = vendors[0];

        // 3. Check vendor status — block if pending or suspended
        if (vendor.status === 'pending') {
            throw new Error('Your account is pending approval by the Sakzee team. You will be notified once approved.');
        }

        if (vendor.status === 'suspended') {
            throw new Error(`Your account has been suspended. Reason: ${vendor.suspension_reason || 'Please contact Sakzee support at info@sakzee.com'}`);
        }

        if (vendor.status !== 'active') {
            throw new Error('Your account is not active. Please contact Sakzee support at info@sakzee.com');
        }

        return NextResponse.json({ token: authData.access_token, vendor });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 401 });
    }
}