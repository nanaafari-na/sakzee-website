import { NextRequest, NextResponse } from 'next/server';
import { notifyClientBooking } from '@/lib/notifications';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/bookings`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.SUPABASE_SERVICE_KEY!,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify(body),
            }
        );

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: err }, { status: 500 });
        }

        // Send confirmation notifications
        await notifyClientBooking(
            { email: body.email, name: body.name, phone: body.phone },
            { reference: body.reference, service: body.service, date: body.date }
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}