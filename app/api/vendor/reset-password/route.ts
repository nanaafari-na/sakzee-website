import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();
        if (!token || !password) return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
        if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

        // Find and validate token
        const tokenRes = await fetch(
            `${SUPABASE_URL}/rest/v1/password_reset_tokens?token=eq.${encodeURIComponent(token)}&used=eq.false&select=*`,
            { headers }
        );
        const tokens = await tokenRes.json();
        const resetToken = tokens?.[0];

        if (!resetToken) return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });

        if (new Date(resetToken.expires_at) < new Date()) {
            return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
        }

        // Get vendor's Supabase auth user ID
        const userRes = await fetch(
            `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(resetToken.email)}`,
            {
                headers: {
                    'apikey': SERVICE_KEY,
                    'Authorization': `Bearer ${SERVICE_KEY}`,
                },
            }
        );
        const userData = await userRes.json();
        const user = userData?.users?.[0];

        if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

        // Update password via Supabase Admin API
        const updateRes = await fetch(
            `${SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
            {
                method: 'PUT',
                headers: {
                    'apikey': SERVICE_KEY,
                    'Authorization': `Bearer ${SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            }
        );

        if (!updateRes.ok) {
            const err = await updateRes.text();
            throw new Error(`Failed to update password: ${err}`);
        }

        // Mark token as used
        await fetch(
            `${SUPABASE_URL}/rest/v1/password_reset_tokens?token=eq.${encodeURIComponent(token)}`,
            {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ used: true }),
            }
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}