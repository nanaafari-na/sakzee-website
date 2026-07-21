import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const assignment_id = formData.get('assignment_id') as string;
        const stop_id = formData.get('stop_id') as string | null;

        if (!file || !assignment_id) return NextResponse.json({ error: 'Missing file or assignment_id' }, { status: 400 });

        // Upload to Supabase Storage
        const suffix = stop_id ? `_stop${stop_id}` : '';
        const fileName = `proof_${assignment_id}${suffix}_${Date.now()}.${file.name.split('.').pop()}`;
        const arrayBuffer = await file.arrayBuffer();

        const uploadRes = await fetch(
            `${SUPABASE_URL}/storage/v1/object/proofs/${fileName}`,
            {
                method: 'POST',
                headers: { ...headers, 'Content-Type': file.type, 'x-upsert': 'true' },
                body: arrayBuffer,
            }
        );

        if (!uploadRes.ok) throw new Error(`Upload failed: ${await uploadRes.text()}`);

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/proofs/${fileName}`;

        if (stop_id) {
            // Save proof to booking_stops
            await fetch(`${SUPABASE_URL}/rest/v1/booking_stops?id=eq.${stop_id}`, {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({ proof_of_delivery_url: publicUrl }),
            });
        } else {
            // Save proof to delivery_assignments
            await fetch(`${SUPABASE_URL}/rest/v1/delivery_assignments?id=eq.${assignment_id}`, {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({ proof_of_delivery_url: publicUrl }),
            });
        }

        return NextResponse.json({ url: publicUrl });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}