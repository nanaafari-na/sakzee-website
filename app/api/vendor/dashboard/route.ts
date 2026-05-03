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

        const [productsRes, ordersRes, invoicesRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/products?vendor_id=eq.${vendor_id}&select=id,quantity`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/orders?vendor_id=eq.${vendor_id}&select=*&order=created_at.desc&limit=5`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/storage_invoices?vendor_id=eq.${vendor_id}&select=*&order=created_at.desc&limit=3`, { headers }),
        ]);

        const [products, orders, invoices] = await Promise.all([
            productsRes.json(),
            ordersRes.json(),
            invoicesRes.json(),
        ]);

        const pending_orders = (orders || []).filter((o: any) => o.status === 'Pending').length;
        const unpaid_invoices = (invoices || []).filter((i: any) => i.status === 'unpaid');
        const storage_due = unpaid_invoices.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);

        return NextResponse.json({
            stats: {
                total_products: (products || []).length,
                total_orders: (orders || []).length,
                pending_orders,
                storage_due,
            },
            recent_orders: (orders || []).slice(0, 5),
            invoices: (invoices || []).slice(0, 3),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}