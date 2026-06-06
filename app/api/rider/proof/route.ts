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

        if (!file || !assignment_id) return NextResponse.json({ error: 'Missing file or assignment_id' }, { status: 400 });

        // Upload to Supabase Storage
        const fileName = `proof_${assignment_id}_${Date.now()}.${file.name.split('.').pop()}`;
        const arrayBuffer = await file.arrayBuffer();

        const uploadRes = await fetch(
            `${SUPABASE_URL}/storage/v1/object/proofs/${fileName}`,
            {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': file.type,
                    'x-upsert': 'true',
                },
                body: arrayBuffer,
            }
        );

        if (!uploadRes.ok) {
            const err = await uploadRes.text();
            throw new Error(`Upload failed: ${err}`);
        }

        // Get public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/proofs/${fileName}`;

        // Update assignment with proof URL
        await fetch(
            `${SUPABASE_URL}/rest/v1/delivery_assignments?id=eq.${assignment_id}`,
            {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({ proof_of_delivery_url: publicUrl }),
            }
        );

        return NextResponse.json({ url: publicUrl });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}