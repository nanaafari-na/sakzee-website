import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const ref = req.nextUrl.searchParams.get('ref');
    if (!ref) return NextResponse.json({ error: 'No reference provided' }, { status: 400 });

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/bookings?reference=eq.${encodeURIComponent(ref)}&select=*`,
            {
                headers: {
                    'apikey': process.env.SUPABASE_SERVICE_KEY!,
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
                },
            }
        );

        const data = await res.json();
        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(data[0]);
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
