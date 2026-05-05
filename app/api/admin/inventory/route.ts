import { NextRequest, NextResponse } from 'next/server';
import { notifyInventoryCheckedIn } from '@/lib/notifications';

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
            `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`,
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

        // Get product + vendor details before updating
        const productRes = await fetch(
            `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`,
            { headers }
        );
        const products = await productRes.json();
        const product = products?.[0];

        // Update product
        const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());

        // If this is a check-in confirmation, notify the vendor
        if (body.checkin_status === 'checked_in' && product) {
            const vendorRes = await fetch(
                `${SUPABASE_URL}/rest/v1/vendors?id=eq.${product.vendor_id}&select=*`,
                { headers }
            );
            const vendors = await vendorRes.json();
            const vendor = vendors?.[0];

            if (vendor) {
                await notifyInventoryCheckedIn(
                    {
                        email: vendor.email,
                        business_name: vendor.business_name,
                        contact_name: vendor.contact_name,
                        phone: vendor.phone,
                    },
                    {
                        name: product.name,
                        quantity: body.checked_in_quantity || body.quantity,
                        space_type: product.space_type,
                    }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}