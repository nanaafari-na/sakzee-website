import { NextRequest, NextResponse } from 'next/server';

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
            console.error('Supabase error:', err);
            return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
