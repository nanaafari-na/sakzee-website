import { Resend } from 'resend';
import twilio from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM_EMAIL = 'Sakzee <notifications@sakzee.com>';
const FROM_WHATSAPP = 'whatsapp:+233256089599';

// Twilio Content Template SIDs
const TEMPLATES = {
  vendor_approved: 'HX9bdad5f482e034cbcb1de7422136d759',
  vendor_suspended: 'HX10c07067a28c77f772a425bccdf73c1f',
  inventory_checked_in: 'HXb394bf3d53082e7001d2e0d3baa57c48',
  order_status_update: 'HXf0fbfbf5a51e9ec7fce0f15eda3320a8',
  booking_confirmation: 'HX870d45087f6b06d057584c8414d9eb68',
  order_status_client: 'HX15f2a97da69c47bdbf3a8054414a0717',
};

// ─── Send Email ────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (e) {
    console.error('Email send error:', e);
  }
}

// ─── Send WhatsApp via Twilio Content Template ─────────────────
async function sendWhatsApp(
  to: string,
  templateSid: string,
  variables: Record<string, string>
) {
  try {
    let formatted = to.replace(/\s/g, '');
    if (formatted.startsWith('0')) formatted = '+233' + formatted.slice(1);
    if (!formatted.startsWith('+')) formatted = '+' + formatted;

    await twilioClient.messages.create({
      from: FROM_WHATSAPP,
      to: `whatsapp:${formatted}`,
      contentSid: templateSid,
      contentVariables: JSON.stringify(variables),
    });
  } catch (e) {
    console.error('WhatsApp send error:', e);
  }
}

// ─── Dispatch based on preference ─────────────────────────────
type Pref = 'email' | 'whatsapp' | 'both';

async function notify(
  pref: Pref = 'both',
  email: () => Promise<void>,
  whatsapp: () => Promise<void>
) {
  if (pref === 'email') return email();
  if (pref === 'whatsapp') return whatsapp();
  return Promise.all([email(), whatsapp()]);
}

// ─── Email base template ───────────────────────────────────────
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

// ══════════════════════════════════════════════════════════════
// NOTIFICATION FUNCTIONS
// ══════════════════════════════════════════════════════════════

// 1. Vendor approved
export async function notifyVendorApproved(vendor: {
  email: string; business_name: string; contact_name: string;
  phone: string; notification_preference?: Pref;
}) {
  const pref = vendor.notification_preference || 'both';

  const html = baseTemplate(`
    <h2 style="color:#1a2456;margin:0 0 0.75rem;">Welcome to Sakzee, ${vendor.business_name}! 🎉</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${vendor.contact_name}, your vendor account has been <strong style="color:#15803d;">approved</strong>. You can now log in and start storing inventory and creating orders.</p>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="https://sakzee.com/vendor/login" style="background:#1a2456;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Log In to Your Dashboard →</a>
    </div>
    <p style="color:#6b7280;font-size:0.875rem;">Questions? Call or WhatsApp us on <strong>0256 089 599</strong>.</p>
  `);

  await notify(pref,
    () => sendEmail(vendor.email, '✅ Your Sakzee vendor account has been approved!', html),
    () => sendWhatsApp(vendor.phone, TEMPLATES.vendor_approved, {
      '1': vendor.business_name,
    })

  );
}

// 2. Vendor suspended
export async function notifyVendorSuspended(vendor: {
  email: string; business_name: string; contact_name: string;
  phone: string; suspension_reason: string; notification_preference?: Pref;
}) {
  const pref = vendor.notification_preference || 'both';

  const html = baseTemplate(`
    <h2 style="color:#dc2626;margin:0 0 0.75rem;">Account Suspended</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${vendor.contact_name}, your vendor account for <strong>${vendor.business_name}</strong> has been suspended.</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:1rem;margin:1rem 0;">
      <strong style="color:#dc2626;">Reason:</strong>
      <p style="color:#374151;margin:0.5rem 0 0;">${vendor.suspension_reason}</p>
    </div>
    <p style="color:#374151;">To resolve this: <strong>📞 0256 089 599</strong> | <strong>✉️ info@sakzee.com</strong></p>
  `);

  await notify(pref,
    () => sendEmail(vendor.email, '⚠️ Your Sakzee vendor account has been suspended', html),
    () => sendWhatsApp(vendor.phone, TEMPLATES.vendor_suspended, {
      '1': vendor.business_name,
      '2': vendor.suspension_reason,
    })
  );
}

// 3. Inventory checked in
export async function notifyInventoryCheckedIn(
  vendor: { email: string; business_name: string; contact_name: string; phone: string; notification_preference?: Pref },
  product: { name: string; quantity: number; space_type: string }
) {
  const pref = vendor.notification_preference || 'both';

  const html = baseTemplate(`
    <h2 style="color:#1a2456;margin:0 0 0.75rem;">Inventory Checked In ✅</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${vendor.contact_name}, your inventory has been received and verified by our warehouse team.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:1.25rem;margin:1rem 0;">
      <table style="width:100%;font-size:0.875rem;">
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Product</td><td style="color:#1a2456;font-weight:600;text-align:right;">${product.name}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Quantity confirmed</td><td style="color:#15803d;font-weight:700;text-align:right;">${product.quantity} units</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Space type</td><td style="color:#1a2456;font-weight:600;text-align:right;">${product.space_type === 'pallet' ? 'Pallet' : 'Shelf'}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="https://sakzee.com/vendor/orders/new" style="background:#f97316;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;">Create a Delivery Order →</a>
    </div>
  `);

  await notify(pref,
    () => sendEmail(vendor.email, `📦 Inventory received: ${product.name}`, html),
    () => sendWhatsApp(vendor.phone, TEMPLATES.inventory_checked_in, {
      '1': vendor.contact_name,
      '2': product.name,
      '3': String(product.quantity),
    })

  );
}

// 4. Vendor order status
export async function notifyVendorOrderStatus(
  vendor: { email: string; contact_name: string; phone: string; notification_preference?: Pref },
  order: { reference: string; status: string; delivery_address: string; recipient_name: string }
) {
  const pref = vendor.notification_preference || 'both';
  const statusMessages: Record<string, { emoji: string; title: string; msg: string }> = {
    Processing: { emoji: '⚙️', title: 'Order Being Processed', msg: 'Your order is being picked and packed by the Sakzee warehouse team.' },
    Packed: { emoji: '📦', title: 'Order Packed', msg: 'Your order has been packed and is ready for dispatch.' },
    Shipped: { emoji: '🚚', title: 'Order Out for Delivery', msg: 'Your order is now out for delivery to the recipient.' },
    Delivered: { emoji: '✅', title: 'Order Delivered!', msg: 'Your order has been successfully delivered.' },
  };
  const s = statusMessages[order.status];
  if (!s) return;

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
      <a href="https://sakzee.com/vendor/orders" style="background:#1a2456;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;">View All Orders →</a>
    </div>
  `);

  await notify(pref,
    () => sendEmail(vendor.email, `${s.emoji} Order ${order.reference} — ${s.title}`, html),
    () => sendWhatsApp(vendor.phone, TEMPLATES.order_status_update, {
      '1': vendor.contact_name,
      '2': order.reference,
      '3': order.status,
      '4': order.recipient_name,
    })
  );
}

// 5. Client booking confirmation
export async function notifyClientBooking(
  client: { email: string; name: string; phone: string; notification_preference?: Pref },
  booking: { reference: string; service: string; date: string }
) {
  const pref = client.notification_preference || 'both';

  const html = baseTemplate(`
    <h2 style="color:#1a2456;margin:0 0 0.75rem;">Booking Confirmed! 🎉</h2>
    <p style="color:#374151;line-height:1.7;">Hi ${client.name}, your booking has been confirmed.</p>
    <div style="background:#f8f9ff;border:1px solid #e5e7eb;border-radius:10px;padding:1.25rem;margin:1rem 0;">
      <table style="width:100%;font-size:0.875rem;">
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Reference</td><td style="color:#1a2456;font-weight:700;text-align:right;font-family:monospace;">${booking.reference}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Service</td><td style="color:#1a2456;font-weight:600;text-align:right;">${booking.service}</td></tr>
        <tr><td style="color:#6b7280;padding:0.3rem 0;">Date</td><td style="color:#1a2456;font-weight:600;text-align:right;">${booking.date}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:1.5rem 0;">
      <a href="https://sakzee.com/track" style="background:#f97316;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;">Track Your Delivery →</a>
    </div>
    <p style="color:#6b7280;font-size:0.875rem;">Questions? Call <strong>0256 089 599</strong></p>
  `);

  // Split date and time for template variables
  const [date, ...timeParts] = booking.date.split(' at ');
  const time = timeParts.join(' at ') || '';

  await notify(pref,
    () => sendEmail(client.email, `🎉 Booking Confirmed — ${booking.reference}`, html),
    () => sendWhatsApp(client.phone, TEMPLATES.booking_confirmation, {
      '1': client.name,
      '2': booking.reference,
      '3': date,
      '4': time,
    })
  );
}

// 6. Client order status
export async function notifyClientOrderStatus(
  client: { email: string; name: string; phone: string; notification_preference?: Pref },
  booking: { reference: string; status: string; service: string }
) {
  const pref = client.notification_preference || 'both';
  const statusMessages: Record<string, { emoji: string; title: string; msg: string }> = {
    Processing: { emoji: '⚙️', title: 'Your delivery is being processed', msg: 'We are preparing your delivery.' },
    Packed: { emoji: '📦', title: 'Your delivery is packed', msg: 'Your package has been packed and is ready for pickup.' },
    Shipped: { emoji: '🚚', title: 'Your delivery is on the way!', msg: 'Your package is out for delivery.' },
    Delivered: { emoji: '✅', title: 'Delivery complete!', msg: 'Your package has been successfully delivered. Thank you for choosing Sakzee!' },
  };
  const s = statusMessages[booking.status];
  if (!s) return;

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
      <a href="https://sakzee.com/track" style="background:#f97316;color:white;padding:0.85rem 2rem;border-radius:8px;text-decoration:none;font-weight:700;">Track Your Delivery →</a>
    </div>
  `);

  await notify(pref,
    () => sendEmail(client.email, `${s.emoji} ${s.title} — ${booking.reference}`, html),
    () => sendWhatsApp(client.phone, TEMPLATES.order_status_client, {
      '1': client.name,
      '2': booking.reference,
      '3': booking.status,
    })
  );
}