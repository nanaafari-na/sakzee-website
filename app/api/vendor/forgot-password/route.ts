import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        // Check vendor exists
        const vendorRes = await fetch(
            `${SUPABASE_URL}/rest/v1/vendors?email=eq.${encodeURIComponent(email)}&select=id,email,contact_name,business_name,status`,
            { headers }
        );
        const vendors = await vendorRes.json();
        const vendor = vendors?.[0];

        // Always return success to prevent email enumeration
        if (!vendor) return NextResponse.json({ success: true });

        if (vendor.status !== 'active') {
            return NextResponse.json({ error: 'Account is not active. Please contact support.' }, { status: 400 });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

        // Invalidate existing tokens for this email
        await fetch(
            `${SUPABASE_URL}/rest/v1/password_reset_tokens?email=eq.${encodeURIComponent(email)}&used=eq.false`,
            {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ used: true }),
            }
        );

        // Store new token
        await fetch(`${SUPABASE_URL}/rest/v1/password_reset_tokens`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ email, token, expires_at: expiresAt, used: false }),
        });

        // Send email
        const resetLink = `https://sakzee.com/vendor/reset-password/${token}`;
        await resend.emails.send({
            from: 'Sakzee <notifications@sakzee.com>',
            to: email,
            subject: 'Reset your Sakzee password',
            html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;background:#f8f9ff;padding:2rem;">
          <div style="background:#1a2456;padding:1.25rem 2rem;border-radius:10px 10px 0 0;text-align:center;">
            <span style="color:white;font-size:1.5rem;font-weight:800;">sak<span style="color:#f97316;">zee</span></span>
          </div>
          <div style="background:white;padding:2rem;border-radius:0 0 10px 10px;border:1px solid #e5e7eb;">
            <h2 style="color:#1a2456;margin:0 0 0.75rem;">Password Reset Request</h2>
            <p style="color:#374151;">Hi ${vendor.contact_name},</p>
            <p style="color:#374151;">We received a request to reset the password for your Sakzee vendor account (<strong>${vendor.business_name}</strong>).</p>
            <p style="color:#374151;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
            <div style="text-align:center;margin:1.5rem 0;">
              <a href="${resetLink}" style="background:#f97316;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:1rem;display:inline-block;">Reset My Password</a>
            </div>
            <p style="color:#6b7280;font-size:0.85rem;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
            <p style="color:#9ca3af;font-size:0.78rem;margin-top:1.5rem;">Or copy this link: ${resetLink}</p>
            <hr style="border:none;border-top:1px solid #f3f4f6;margin:1.5rem 0;"/>
            <p style="color:#9ca3af;font-size:0.75rem;text-align:center;">Sakzee Company Limited · Ubuntu Court Estate, Oyarifa, Accra · 0256 089 599</p>
          </div>
        </div>
      `,
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}