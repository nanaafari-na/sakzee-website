import { NextRequest, NextResponse } from 'next/server';
import { notifyVendorOrderStatus } from '@/lib/notifications';

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
            `${SUPABASE_URL}/rest/v1/orders?select=*,vendors(business_name,contact_name,email,phone,notification_preference)&order=created_at.desc`,
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

        const { status } = await req.json();

        // Get order + vendor details before updating
        const orderRes = await fetch(
            `${SUPABASE_URL}/rest/v1/orders?id=eq.${id}&select=*`,
            { headers }
        );
        const orders = await orderRes.json();
        const order = orders?.[0];

        // Update order status
        const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error(await res.text());

        // Notify vendor with their preference
        if (order) {
            const vendorRes = await fetch(
                `${SUPABASE_URL}/rest/v1/vendors?id=eq.${order.vendor_id}&select=*`,
                { headers }
            );
            const vendors = await vendorRes.json();
            const vendor = vendors?.[0];

            if (vendor) {
                await notifyVendorOrderStatus(
                    {
                        email: vendor.email,
                        contact_name: vendor.contact_name,
                        phone: vendor.phone,
                        notification_preference: vendor.notification_preference || 'both',
                    },
                    {
                        reference: order.reference,
                        status,
                        delivery_address: order.delivery_address,
                        recipient_name: order.recipient_name,
                    }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}