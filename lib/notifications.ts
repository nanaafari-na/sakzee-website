import { Resend } from 'resend';
import twilio from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const FROM_EMAIL = 'Sakzee <onboarding@resend.dev>';
const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

// ─── Send Email ────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
    try {
        await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    } catch (e) {
        console.error('Email send error:', e);
    }
}

// ─── Send WhatsApp ─────────────────────────────────────────────
async function sendWhatsApp(to: string, message: string) {
    try {
        // Format Ghana numbers: 024... → whatsapp:+23324...
        let formatted = to.replace(/\s/g, '');
        if (formatted.startsWith('0')) formatted = '+233' + formatted.slice(1);
        if (!formatted.startsWith('+')) formatted = '+' + formatted;
        await twilioClient.messages.create({
            from: FROM_WHATSAPP,
            to: `whatsapp:${formatted}`,
            body: message,
        });
    } catch (e) {
        console.error('WhatsApp send error:', e);
    }
}

// ─── Email templates ───────────────────────────────────────────
function baseTemplate(content: string) {
    return `
    <div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:0 auto;background:#f8f9ff;padding:2rem;">
      <div style="background:#1a2456;padding:1.25rem 2rem;border-radius:10px 10px 0 0;text-align:center;">
        <span style="color:white;font-size:1.5rem;font-weight:800;">sak<span style="color:#f97316;">zee</span></span>
        <p style="color:rgba(255,255,255,0.6);font-size:0.8rem;margin:0.25rem 0 0;">Moving Dreams, Delivering Growth</p>
      </div>
      <div style="background:white;padding:2rem;border-radius:0 0 10px 10px;border:1px solid #e5e7eb;">
        ${content}
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:1.5rem 0;"/>
        <p style="color:#9ca3af;font-size:0.78rem;text-align:center;">
          Sakzee Company Limited · Ubuntu Court Estate, Oyarifa, Accra<br/>
          📞 0256 089 599 · ✉️ info@sakzee.com
        </p>
      </div>
    </div>`;
}

// ─── NOTIFICATION FUNCTIONS ────────────────────────────────────

// 1. Vendor approved
export async function notifyVendorApproved(vendor: { email: string; business_name: string; contact_name: string; phone: string }) {
    const subject = '✅ Your Sakzee vendor account has been approved!';
    const html = baseTemplate(`
    <h2 style="color:#1a2456;margin:0 0 0.75rem;">Welcome to Sakzee, ${vendor.business_name}! 🎉</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${vendor.contact_name}, your vendor account has been <strong style="color:#15803d;">approved</strong>. You can now log in and start storing inventory and creating orders.</p>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="https://sakzee-website.vercel.app/vendor/login" style="background:#1a2456;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">
        Log In to Your Dashboard →
      </a>
    </div>
    <p style="color:#6b7280;font-size:0.875rem;line-height:1.7;">If you have any questions, reply to this email or WhatsApp us on <strong>0256 089 599</strong>.</p>
  `);
    const wa = `✅ *Sakzee Vendor Approved!*\n\nHi ${vendor.contact_name}, your vendor account for *${vendor.business_name}* has been approved! 🎉\n\nLog in here: https://sakzee-website.vercel.app/vendor/login\n\nQuestions? Call or WhatsApp: 0256 089 599`;

    await Promise.all([
        sendEmail(vendor.email, subject, html),
        sendWhatsApp(vendor.phone, wa),
    ]);
}

// 2. Vendor suspended
export async function notifyVendorSuspended(vendor: { email: string; business_name: string; contact_name: string; phone: string; suspension_reason: string }) {
    const subject = '⚠️ Your Sakzee vendor account has been suspended';
    const html = baseTemplate(`
    <h2 style="color:#dc2626;margin:0 0 0.75rem;">Account Suspended</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${vendor.contact_name}, your vendor account for <strong>${vendor.business_name}</strong> has been suspended.</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:1rem;margin:1rem 0;">
      <strong style="color:#dc2626;">Reason:</strong>
      <p style="color:#374151;margin:0.5rem 0 0;">${vendor.suspension_reason}</p>
    </div>
    <p style="color:#374151;line-height:1.7;">To resolve this, please contact us directly:</p>
    <p style="color:#374151;"><strong>📞 0256 089 599</strong> | <strong>✉️ info@sakzee.com</strong></p>
  `);
    const wa = `⚠️ *Sakzee Account Suspended*\n\nHi ${vendor.contact_name}, your vendor account for *${vendor.business_name}* has been suspended.\n\n*Reason:* ${vendor.suspension_reason}\n\nContact us to resolve: 0256 089 599`;

    await Promise.all([
        sendEmail(vendor.email, subject, html),
        sendWhatsApp(vendor.phone, wa),
    ]);
}

// 3. Inventory checked in
export async function notifyInventoryCheckedIn(vendor: { email: string; business_name: string; contact_name: string; phone: string }, product: { name: string; quantity: number; space_type: string }) {
    const subject = `📦 Inventory received: ${product.name}`;
    const html = baseTemplate(`
    <h2 style="color:#1a2456;margin:0 0 0.75rem;">Inventory Checked In ✅</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${vendor.contact_name}, great news! Your inventory has been received and verified by the Sakzee warehouse team.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:1.25rem;margin:1rem 0;">
      <table style="width:100%;font-size:0.875rem;">
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Product</td><td style="color:#1a2456;font-weight:600;text-align:right;">${product.name}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Quantity confirmed</td><td style="color:#15803d;font-weight:700;text-align:right;">${product.quantity} units</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Space type</td><td style="color:#1a2456;font-weight:600;text-align:right;">${product.space_type === 'pallet' ? 'Pallet' : 'Shelf'}</td></tr>
      </table>
    </div>
    <p style="color:#374151;line-height:1.7;">This product is now available to include in your delivery orders.</p>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="https://sakzee-website.vercel.app/vendor/orders/new" style="background:#f97316;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">
        Create a Delivery Order →
      </a>
    </div>
  `);
    const wa = `📦 *Inventory Received - Sakzee*\n\nHi ${vendor.contact_name}!\n\nYour inventory has been checked in:\n• *Product:* ${product.name}\n• *Quantity:* ${product.quantity} units\n• *Space:* ${product.space_type === 'pallet' ? 'Pallet' : 'Shelf'}\n\nReady to create orders: https://sakzee-website.vercel.app/vendor/orders/new`;

    await Promise.all([
        sendEmail(vendor.email, subject, html),
        sendWhatsApp(vendor.phone, wa),
    ]);
}

// 4. Order status update (vendor orders)
export async function notifyVendorOrderStatus(vendor: { email: string; contact_name: string; phone: string }, order: { reference: string; status: string; delivery_address: string; recipient_name: string }) {
    const statusMessages: Record<string, { emoji: string; title: string; msg: string }> = {
        Processing: { emoji: '⚙️', title: 'Order Being Processed', msg: 'Your order is being picked and packed by the Sakzee warehouse team.' },
        Packed: { emoji: '📦', title: 'Order Packed', msg: 'Your order has been packed and is ready for dispatch.' },
        Shipped: { emoji: '🚚', title: 'Order Out for Delivery', msg: 'Your order is now out for delivery to the recipient.' },
        Delivered: { emoji: '✅', title: 'Order Delivered!', msg: 'Your order has been successfully delivered to the recipient.' },
    };
    const s = statusMessages[order.status];
    if (!s) return;

    const subject = `${s.emoji} Order ${order.reference} — ${s.title}`;
    const html = baseTemplate(`
    <h2 style="color:#1a2456;margin:0 0 0.75rem;">${s.emoji} ${s.title}</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${vendor.contact_name}, ${s.msg}</p>
    <div style="background:#f8f9ff;border:1px solid #e5e7eb;border-radius:10px;padding:1.25rem;margin:1rem 0;">
      <table style="width:100%;font-size:0.875rem;">
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Reference</td><td style="color:#1a2456;font-weight:700;text-align:right;font-family:monospace;">${order.reference}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Status</td><td style="color:#f97316;font-weight:700;text-align:right;">${order.status}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Recipient</td><td style="color:#1a2456;font-weight:600;text-align:right;">${order.recipient_name}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Address</td><td style="color:#1a2456;font-weight:600;text-align:right;">${order.delivery_address}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="https://sakzee-website.vercel.app/vendor/orders" style="background:#1a2456;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">
        View All Orders →
      </a>
    </div>
  `);
    const wa = `${s.emoji} *${s.title} - Sakzee*\n\nHi ${vendor.contact_name}!\n\n${s.msg}\n\n• *Reference:* ${order.reference}\n• *Status:* ${order.status}\n• *Recipient:* ${order.recipient_name}\n• *Address:* ${order.delivery_address}\n\nView orders: https://sakzee-website.vercel.app/vendor/orders`;

    await Promise.all([
        sendEmail(vendor.email, subject, html),
        sendWhatsApp(vendor.phone, wa),
    ]);
}

// 5. Client booking confirmation
export async function notifyClientBooking(client: { email: string; name: string; phone: string }, booking: { reference: string; service: string; date: string }) {
    const subject = `🎉 Booking Confirmed — ${booking.reference}`;
    const html = baseTemplate(`
    <h2 style="color:#1a2456;margin:0 0 0.75rem;">Booking Confirmed! 🎉</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${client.name}, your booking has been received and our team will be in touch within 24 hours.</p>
    <div style="background:#f8f9ff;border:1px solid #e5e7eb;border-radius:10px;padding:1.25rem;margin:1rem 0;">
      <table style="width:100%;font-size:0.875rem;">
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Reference</td><td style="color:#1a2456;font-weight:700;text-align:right;font-family:monospace;">${booking.reference}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Service</td><td style="color:#1a2456;font-weight:600;text-align:right;">${booking.service}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Start Date</td><td style="color:#1a2456;font-weight:600;text-align:right;">${booking.date}</td></tr>
      </table>
    </div>
    <p style="color:#374151;line-height:1.7;">Save your reference number to track your order at any time.</p>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="https://sakzee-website.vercel.app/track" style="background:#f97316;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">
        Track Your Order →
      </a>
    </div>
    <p style="color:#6b7280;font-size:0.875rem;">Questions? Call <strong>0256 089 599</strong> or WhatsApp us.</p>
  `);
    const wa = `🎉 *Booking Confirmed - Sakzee*\n\nHi ${client.name}!\n\nYour booking is confirmed:\n• *Reference:* ${booking.reference}\n• *Service:* ${booking.service}\n• *Start Date:* ${booking.date}\n\nTrack your order: https://sakzee-website.vercel.app/track\n\nQuestions? Call: 0256 089 599`;

    await Promise.all([
        sendEmail(client.email, subject, html),
        sendWhatsApp(client.phone, wa),
    ]);
}

// 6. Client order status update
export async function notifyClientOrderStatus(client: { email: string; name: string; phone: string }, booking: { reference: string; status: string; service: string }) {
    const statusMessages: Record<string, { emoji: string; title: string; msg: string }> = {
        Processing: { emoji: '⚙️', title: 'We are processing your order', msg: 'Your order is currently being processed by the Sakzee team.' },
        Packed: { emoji: '📦', title: 'Your order is packed', msg: 'Your order has been packed and is ready for the next step.' },
        Shipped: { emoji: '🚚', title: 'Your order is on the way!', msg: 'Great news! Your order is out for delivery.' },
        Delivered: { emoji: '✅', title: 'Your order has been delivered!', msg: 'Your order has been successfully delivered. Thank you for choosing Sakzee!' },
    };
    const s = statusMessages[booking.status];
    if (!s) return;

    const subject = `${s.emoji} ${s.title} — ${booking.reference}`;
    const html = baseTemplate(`
    <h2 style="color:#1a2456;margin:0 0 0.75rem;">${s.emoji} ${s.title}</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${client.name}, ${s.msg}</p>
    <div style="background:#f8f9ff;border:1px solid #e5e7eb;border-radius:10px;padding:1.25rem;margin:1rem 0;">
      <table style="width:100%;font-size:0.875rem;">
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Reference</td><td style="color:#1a2456;font-weight:700;text-align:right;font-family:monospace;">${booking.reference}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Service</td><td style="color:#1a2456;font-weight:600;text-align:right;">${booking.service}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Status</td><td style="color:#f97316;font-weight:700;text-align:right;">${booking.status}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="https://sakzee-website.vercel.app/track" style="background:#f97316;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">
        Track Your Order →
      </a>
    </div>
  `);
    const wa = `${s.emoji} *${s.title} - Sakzee*\n\nHi ${client.name}!\n\n${s.msg}\n\n• *Reference:* ${booking.reference}\n• *Service:* ${booking.service}\n• *Status:* ${booking.status}\n\nTrack: https://sakzee-website.vercel.app/track\n\nQuestions? Call: 0256 089 599`;

    await Promise.all([
        sendEmail(client.email, subject, html),
        sendWhatsApp(client.phone, wa),
    ]);
}