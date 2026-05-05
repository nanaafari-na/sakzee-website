import { NextRequest, NextResponse } from 'next/server';
import { notifyVendorOrderStatus } from '@/lib/notifications';

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
            `${SUPABASE_URL}/rest/v1/orders?vendor_id=eq.${vendor_id}&select=*&order=created_at.desc`,
            { headers }
        );
        return NextResponse.json(await res.json());
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, ...orderData } = body;

        // Save order
        const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(orderData),
        });
        const orders = await orderRes.json();
        if (!orderRes.ok) throw new Error(JSON.stringify(orders));
        const order = orders[0];

        // Save order items and reduce stock
        if (items && items.length > 0) {
            const orderItems = items.map((item: any) => ({
                order_id: order.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
            }));

            await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
                method: 'POST',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify(orderItems),
            });

            for (const item of items) {
                const prodRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/products?id=eq.${item.product_id}&select=quantity`,
                    { headers }
                );
                const prods = await prodRes.json();
                if (prods?.[0]) {
                    const newQty = Math.max(0, prods[0].quantity - item.quantity);
                    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${item.product_id}`, {
                        method: 'PATCH',
                        headers: { ...headers, 'Prefer': 'return=minimal' },
                        body: JSON.stringify({ quantity: newQty }),
                    });
                }
            }
        }

        return NextResponse.json({ success: true, order });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const body = await req.json();
        const { status } = body;

        // Get order + vendor details
        const orderRes = await fetch(
            `${SUPABASE_URL}/rest/v1/orders?id=eq.${id}&select=*`,
            { headers }
        );
        const orders = await orderRes.json();
        const order = orders?.[0];

        // Update order status
        await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify(body),
        });

        // Notify vendor of status change
        if (order && status) {
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