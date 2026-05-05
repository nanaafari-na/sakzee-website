import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function GET() {
    try {
        // Fetch all data in parallel
        const [bookingsRes, ordersRes, vendorsRes, productsRes, invoicesRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/bookings?select=*`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/orders?select=*`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/vendors?select=*`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/storage_invoices?select=*`, { headers }),
        ]);

        const [bookings, orders, vendors, products, invoices] = await Promise.all([
            bookingsRes.json(),
            ordersRes.json(),
            vendorsRes.json(),
            productsRes.json(),
            invoicesRes.json(),
        ]);

        // ── Booking stats ──
        const totalBookingRevenue = (bookings || []).length * 0; // placeholder — no price stored on bookings yet
        const bookingsByStatus = BOOKING_STATUSES.reduce((acc: Record<string, number>, s) => {
            acc[s] = (bookings || []).filter((b: any) => b.status === s).length;
            return acc;
        }, {});
        const bookingsByService = (bookings || []).reduce((acc: Record<string, number>, b: any) => {
            const svc = b.service || 'Unknown';
            acc[svc] = (acc[svc] || 0) + 1;
            return acc;
        }, {});

        // ── Order stats ──
        const totalDeliveryRevenue = (orders || []).reduce((sum: number, o: any) => sum + (o.delivery_fee || 0), 0);
        const ordersByStatus = ORDER_STATUSES.reduce((acc: Record<string, number>, s) => {
            acc[s] = (orders || []).filter((o: any) => o.status === s).length;
            return acc;
        }, {});
        const ordersByRegion = (orders || []).reduce((acc: Record<string, number>, o: any) => {
            const r = o.region || 'Unknown';
            acc[r] = (acc[r] || 0) + 1;
            return acc;
        }, {});

        // ── Vendor stats ──
        const vendorsByStatus = {
            active: (vendors || []).filter((v: any) => v.status === 'active').length,
            pending: (vendors || []).filter((v: any) => v.status === 'pending').length,
            suspended: (vendors || []).filter((v: any) => v.status === 'suspended').length,
        };

        // ── Inventory stats ──
        const totalProducts = (products || []).length;
        const checkedIn = (products || []).filter((p: any) => p.checkin_status === 'checked_in').length;
        const pendingCheckin = (products || []).filter((p: any) => p.checkin_status === 'pending_checkin').length;
        const lowStock = (products || []).filter((p: any) => p.checkin_status === 'checked_in' && p.quantity > 0 && p.quantity <= p.low_stock_threshold).length;
        const outOfStock = (products || []).filter((p: any) => p.checkin_status === 'checked_in' && p.quantity === 0).length;
        const shelfCount = (products || []).filter((p: any) => p.space_type === 'shelf' && p.checkin_status === 'checked_in').length;
        const palletCount = (products || []).filter((p: any) => p.space_type === 'pallet' && p.checkin_status === 'checked_in').length;

        // ── Storage revenue ──
        const totalStorageRevenue = (invoices || []).filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
        const totalStorageOutstanding = (invoices || []).filter((i: any) => i.status === 'unpaid').reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
        const invoicesByStatus = {
            paid: (invoices || []).filter((i: any) => i.status === 'paid').length,
            unpaid: (invoices || []).filter((i: any) => i.status === 'unpaid').length,
        };

        // ── Monthly trends (last 6 months) ──
        const months: string[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }

        const monthlyBookings = months.map(m => ({
            month: m,
            count: (bookings || []).filter((b: any) => b.paid_at?.startsWith(m)).length,
        }));

        const monthlyOrders = months.map(m => ({
            month: m,
            count: (orders || []).filter((o: any) => o.created_at?.startsWith(m)).length,
            revenue: (orders || []).filter((o: any) => o.created_at?.startsWith(m)).reduce((sum: number, o: any) => sum + (o.delivery_fee || 0), 0),
        }));

        const monthlyStorageRevenue = months.map(m => ({
            month: m,
            revenue: (invoices || []).filter((i: any) => i.month === m && i.status === 'paid').reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0),
        }));

        // ── Top vendors by order count ──
        const vendorOrderCounts = (orders || []).reduce((acc: Record<string, number>, o: any) => {
            acc[o.vendor_id] = (acc[o.vendor_id] || 0) + 1;
            return acc;
        }, {});

        const topVendors = Object.entries(vendorOrderCounts)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([vendor_id, count]) => {
                const vendor = (vendors || []).find((v: any) => v.id === vendor_id);
                return { business_name: vendor?.business_name || 'Unknown', count };
            });

        return NextResponse.json({
            summary: {
                total_bookings: (bookings || []).length,
                total_vendor_orders: (orders || []).length,
                total_vendors: (vendors || []).length,
                total_delivery_revenue: totalDeliveryRevenue,
                total_storage_revenue: totalStorageRevenue,
                total_storage_outstanding: totalStorageOutstanding,
                total_revenue: totalDeliveryRevenue + totalStorageRevenue,
            },
            bookings: { by_status: bookingsByStatus, by_service: bookingsByService },
            orders: { by_status: ordersByStatus, by_region: ordersByRegion },
            vendors: vendorsByStatus,
            inventory: { total: totalProducts, checked_in: checkedIn, pending_checkin: pendingCheckin, low_stock: lowStock, out_of_stock: outOfStock, shelf_spaces: shelfCount, pallet_spaces: palletCount },
            storage: { revenue: totalStorageRevenue, outstanding: totalStorageOutstanding, invoices: invoicesByStatus },
            trends: { monthly_bookings: monthlyBookings, monthly_orders: monthlyOrders, monthly_storage: monthlyStorageRevenue },
            top_vendors: topVendors,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

const BOOKING_STATUSES = ['Received', 'Processing', 'Packed', 'Shipped', 'Delivered'];
const ORDER_STATUSES = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered'];