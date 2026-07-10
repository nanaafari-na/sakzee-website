import { NextRequest, NextResponse } from 'next/server';
import { notifyVendorApproved, notifyVendorSuspended } from '@/lib/notifications';

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
            `${SUPABASE_URL}/rest/v1/vendors?select=*&order=created_at.desc`,
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
        const { status, suspension_reason } = body;

        // Get vendor details first (including notification_preference)
        const vendorRes = await fetch(
            `${SUPABASE_URL}/rest/v1/vendors?id=eq.${id}&select=*`,
            { headers }
        );
        const vendors = await vendorRes.json();
        const vendor = vendors?.[0];

        // Update vendor status
        const res = await fetch(`${SUPABASE_URL}/rest/v1/vendors?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());

        // Send notification respecting preference
        if (vendor) {
            const pref = vendor.notification_preference || 'both';
            if (status === 'active') {
                await notifyVendorApproved({
                    business_name: vendor.business_name,
                    contact_name: vendor.contact_name,
                    phone: vendor.phone,
                    notification_preference: pref,
                });
            } else if (status === 'suspended') {
                await notifyVendorSuspended({

                    business_name: vendor.business_name,
                    contact_name: vendor.contact_name,
                    phone: vendor.phone,
                    suspension_reason: suspension_reason || 'Policy violation',
                    notification_preference: pref,
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}