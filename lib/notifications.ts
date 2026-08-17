import twilio from 'twilio';
import { Resend } from 'resend';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_WHATSAPP = 'whatsapp:+233256089605';
const FROM_EMAIL = 'Sakzee <notifications@sakzee.com>';

const TEMPLATES = {
  vendor_approved: 'HX5aba3e20c6f230cceaa528001583b039',
  vendor_suspended: 'HX10c07067a28c77f772a425bccdf73c1f',
  inventory_checked_in: 'HXb394bf3d53082e7001d2e0d3baa57c48',
  order_status_update: 'HXf0fbfbf5a51e9ec7fce0f15eda3320a8',
  booking_confirmation: 'HX870d45087f6b06d057584c8414d9eb68',
  order_status_client: 'HX15f2a97da69c47bdbf3a8054414a0717',
};

type Pref = 'email' | 'whatsapp' | 'both';

function formatGhana(phone: string): string {
  let n = phone.replace(/\s/g, '');
  if (n.startsWith('0')) n = '+233' + n.slice(1);
  if (!n.startsWith('+')) n = '+' + n;
  return n;
}

async function sendWhatsApp(to: string, templateSid: string, variables: Record<string, string>) {
  try {
    await twilioClient.messages.create({
      from: FROM_WHATSAPP,
      to: `whatsapp:${formatGhana(to)}`,
      contentSid: templateSid,
      contentVariables: JSON.stringify(variables),
    });
  } catch (e) { console.error('WhatsApp error:', e); }
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!to) return;
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (e) { console.error('Email error:', e); }
}

function emailTemplate(content: string) {
  return `<div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:0 auto;background:#f8f9ff;padding:2rem;">
    <div style="background:#1a2456;padding:1.25rem 2rem;border-radius:10px 10px 0 0;text-align:center;">
      <span style="color:white;font-size:1.5rem;font-weight:800;">sak<span style="color:#f97316;">zee</span></span>
      <p style="color:rgba(255,255,255,0.6);font-size:0.8rem;margin:0.25rem 0 0;">Moving Dreams, Delivering Growth</p>
    </div>
    <div style="background:white;padding:2rem;border-radius:0 0 10px 10px;border:1px solid #e5e7eb;">
      ${content}
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:1.5rem 0;"/>
      <p style="color:#9ca3af;font-size:0.78rem;text-align:center;">Sakzee Company Limited · Ubuntu Court Estate, Oyarifa, Accra<br/>📞 0256 089 599 · ✉️ info@sakzee.com</p>
    </div>
  </div>`;
}

async function notify(
  phone: string, email: string | null, pref: Pref = 'whatsapp',
  waTpl: string, waVars: Record<string, string>,
  emailSubject: string, emailHtml: string
) {
  const wa = () => sendWhatsApp(phone, waTpl, waVars);
  const em = () => email ? sendEmail(email, emailSubject, emailHtml) : Promise.resolve();
  if (pref === 'whatsapp') return wa();
  if (pref === 'email') return em();
  return Promise.all([wa(), em()]);
}

// ══════════════════════════════════════════════════════════════
// VENDOR NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

export async function notifyVendorApproved(vendor: {
  phone: string; email?: string; business_name: string; contact_name: string;
  notification_preference?: Pref;
}) {
  const pref = vendor.notification_preference || 'whatsapp';
  const smsText = `Sakzee: Hi ${vendor.contact_name}, great news! Your vendor account for ${vendor.business_name} has been approved. Log in at sakzee.com/vendor/login to manage your inventory and orders. Questions? Call 0256 089 599.`;
  const html = emailTemplate(`
    <h2 style="color:#1a2456;">Welcome to Sakzee, ${vendor.business_name}! 🎉</h2>
    <p style="color:#374151;">Hi ${vendor.contact_name},</p>
    <p style="color:#374151;">Your vendor account has been <strong style="color:#15803d;">approved and activated</strong>. You can now log in and start using the Sakzee platform.</p>
    <div style="background:#f8f9ff;border-radius:10px;padding:1rem;margin:1rem 0;">
      <p style="color:#1a2456;font-weight:700;margin:0 0 0.5rem;">Getting Started:</p>
      <ul style="color:#374151;margin:0;padding-left:1.25rem;">
        <li>Log in at <a href="https://sakzee.com/vendor/login" style="color:#f97316;">sakzee.com/vendor/login</a></li>
        <li>View your inventory dashboard</li>
        <li>Create your first delivery order</li>
        <li>Track orders in real time</li>
      </ul>
    </div>
    <p style="color:#6b7280;font-size:0.85rem;">Need help? Call <strong>0256 089 599</strong> or reply to this email.</p>
    <a href="https://sakzee.com/vendor/login" style="display:inline-block;background:#f97316;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;margin-top:0.5rem;">Log In to Dashboard →</a>
  `);
  await notify(vendor.phone, vendor.email || null, pref, TEMPLATES.vendor_approved, { '1': vendor.business_name }, `✅ Your Sakzee vendor account is now active — ${vendor.business_name}`, html);
}

export async function notifyVendorSuspended(vendor: {
  phone: string; email?: string; business_name: string; contact_name: string;
  suspension_reason: string; notification_preference?: Pref;
}) {
  const pref = vendor.notification_preference || 'whatsapp';
  const html = emailTemplate(`<h2 style="color:#dc2626;">Account Suspended</h2><p style="color:#374151;">Hi ${vendor.contact_name}, your account for <strong>${vendor.business_name}</strong> has been suspended.</p><p><strong>Reason:</strong> ${vendor.suspension_reason}</p><p>Contact us: 0256 089 599</p>`);
  await notify(vendor.phone, vendor.email || null, pref, TEMPLATES.vendor_suspended, { '1': vendor.business_name, '2': vendor.suspension_reason }, `⚠️ Your Sakzee vendor account has been suspended`, html);
}

export async function notifyInventoryCheckedIn(
  vendor: { phone: string; email?: string; contact_name: string; notification_preference?: Pref },
  product: { name: string; quantity: number; space_type: string }
) {
  const pref = vendor.notification_preference || 'whatsapp';
  const html = emailTemplate(`<h2 style="color:#1a2456;">Inventory Checked In ✅</h2><p style="color:#374151;">Hi ${vendor.contact_name}, your inventory has been received!</p><p><strong>Product:</strong> ${product.name}<br/><strong>Quantity:</strong> ${product.quantity} units</p>`);
  await notify(vendor.phone, vendor.email || null, pref, TEMPLATES.inventory_checked_in, { '1': vendor.contact_name, '2': product.name, '3': String(product.quantity) }, `📦 Inventory received: ${product.name}`, html);
}

export async function notifyVendorOrderStatus(
  vendor: { phone: string; email?: string; contact_name: string; notification_preference?: Pref },
  order: { reference: string; status: string; delivery_address: string; recipient_name: string }
) {
  const pref = vendor.notification_preference || 'whatsapp';
  const html = emailTemplate(`<h2 style="color:#1a2456;">Order ${order.status}</h2><p style="color:#374151;">Hi ${vendor.contact_name}, your order <strong>${order.reference}</strong> is now <strong>${order.status}</strong>.</p><p>Recipient: ${order.recipient_name}</p>`);
  await notify(vendor.phone, vendor.email || null, pref, TEMPLATES.order_status_update, { '1': vendor.contact_name, '2': order.reference, '3': order.status, '4': order.recipient_name }, `Order ${order.reference} — ${order.status}`, html);
}

// ══════════════════════════════════════════════════════════════
// CLIENT DELIVERY NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

export async function notifyClientBooking(
  client: { phone: string; email?: string; name: string; notification_preference?: Pref },
  booking: { reference: string; service: string; date: string }
) {
  const pref = client.notification_preference || 'whatsapp';
  const html = emailTemplate(`<h2 style="color:#1a2456;">Booking Confirmed! 🎉</h2><p style="color:#374151;">Hi ${client.name}, your booking is confirmed.</p><p><strong>Reference:</strong> ${booking.reference}<br/><strong>Service:</strong> ${booking.service}<br/><strong>Date:</strong> ${booking.date}</p><p><a href="https://sakzee.com/track" style="background:#f97316;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;">Track Delivery</a></p>`);
  await notify(client.phone, client.email || null, pref, TEMPLATES.booking_confirmation, { '1': client.name, '2': booking.reference, '3': booking.date, '4': '' }, `🎉 Booking Confirmed — ${booking.reference}`, html);
}

export async function notifyDeliveryBooked(booking: {
  reference: string;
  booker_name: string; booker_phone: string; booker_email?: string;
  recipient_name: string; recipient_phone: string;
  pickup_address: string; delivery_address: string;
  pickup_date: string; pickup_time: string;
  delivery_fee: number; paying_party: string;
  notification_preference: Pref;
  same_person: boolean;
}) {
  const pref = booking.notification_preference;
  const payingName = booking.paying_party === 'recipient' ? booking.recipient_name : booking.booker_name;

  const bookerHtml = emailTemplate(`<h2 style="color:#1a2456;">Delivery Booked! 🚚</h2><p>Hi ${booking.booker_name}, your delivery is confirmed.</p><p><strong>Ref:</strong> ${booking.reference}<br/><strong>Pickup:</strong> ${booking.pickup_address}<br/><strong>Delivery:</strong> ${booking.delivery_address}<br/><strong>Date:</strong> ${booking.pickup_date} at ${booking.pickup_time}<br/><strong>Est. Fee:</strong> GHS ${booking.delivery_fee} (paid by ${payingName} on delivery)</p><p><a href="https://sakzee.com/track" style="background:#f97316;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;">Track Delivery</a></p>`);

  await notify(booking.booker_phone, booking.booker_email || null, pref, TEMPLATES.booking_confirmation, { '1': booking.booker_name, '2': booking.reference, '3': booking.pickup_date, '4': booking.pickup_time }, `🚚 Delivery Booked — ${booking.reference}`, bookerHtml);

  if (!booking.same_person && booking.recipient_phone && booking.recipient_phone !== booking.booker_phone) {
    const recipientHtml = emailTemplate(`<h2 style="color:#1a2456;">Package On Its Way! 📦</h2><p>Hi ${booking.recipient_name}, a package from ${booking.booker_name} is on its way to you.</p><p><strong>Ref:</strong> ${booking.reference}<br/><strong>Delivery to:</strong> ${booking.delivery_address}<br/><strong>Date:</strong> ${booking.pickup_date}</p><p><a href="https://sakzee.com/track" style="background:#f97316;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;">Track Delivery</a></p>`);
    await notify(booking.recipient_phone, null, pref, TEMPLATES.booking_confirmation, { '1': booking.recipient_name, '2': booking.reference, '3': booking.pickup_date, '4': booking.pickup_time }, `📦 Package On Its Way — ${booking.reference}`, recipientHtml);
  }
}

export async function notifyDeliveryStatus(booking: {
  reference: string;
  booker_name: string; booker_phone: string; booker_email?: string;
  recipient_name: string; recipient_phone: string;
  status: string; delivery_fee: number;
  paying_party: string; notification_preference: Pref;
  same_person: boolean;
}) {
  const pref = booking.notification_preference;

  const msgs: Record<string, { booker: string; recipient: string }> = {
    Processing: {
      booker: `Your delivery ${booking.reference} is being processed.`,
      recipient: `Your package ${booking.reference} is being prepared for delivery.`,
    },
    Shipped: {
      booker: `Your delivery ${booking.reference} is out for delivery!`,
      recipient: `Your package ${booking.reference} is on its way!`,
    },
    Delivered: {
      booker: booking.paying_party === 'booker'
        ? `Delivery ${booking.reference} complete! Pay GHS ${booking.delivery_fee}: sakzee.com/pay/${booking.reference}`
        : `Delivery ${booking.reference} complete! ${booking.recipient_name} will make payment.`,
      recipient: booking.paying_party === 'recipient'
        ? `Your package ${booking.reference} delivered! Pay GHS ${booking.delivery_fee}: sakzee.com/pay/${booking.reference}`
        : `Your package ${booking.reference} has been delivered!`,
    },
  };

  const m = msgs[booking.status];
  if (!m) return;

  const bookerHtml = emailTemplate(`<h2 style="color:#1a2456;">Update: ${booking.status}</h2><p>Hi ${booking.booker_name}, ${m.booker}</p><p><a href="https://sakzee.com/track" style="background:#f97316;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;">Track Delivery</a></p>`);
  await notify(booking.booker_phone, booking.booker_email || null, pref, TEMPLATES.order_status_client, { '1': booking.booker_name, '2': booking.reference, '3': booking.status }, `Delivery ${booking.reference} — ${booking.status}`, bookerHtml);

  if (!booking.same_person && booking.recipient_phone && booking.recipient_phone !== booking.booker_phone) {
    const recipientHtml = emailTemplate(`<h2 style="color:#1a2456;">Update: ${booking.status}</h2><p>Hi ${booking.recipient_name}, ${m.recipient}</p><p><a href="https://sakzee.com/track" style="background:#f97316;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;">Track Delivery</a></p>`);
    await notify(booking.recipient_phone, null, pref, TEMPLATES.order_status_client, { '1': booking.recipient_name, '2': booking.reference, '3': booking.status }, `Package ${booking.reference} — ${booking.status}`, recipientHtml);
  }
}

export async function notifyRiderCashPending(rider: { phone: string; name: string }, booking: { reference: string; delivery_fee: number }) {
  const smsText = `Sakzee: Hi ${rider.name}, client confirmed cash payment of GHS ${booking.delivery_fee} for delivery ${booking.reference}. Please confirm receipt at sakzee.com/rider/login`;
  const html = emailTemplate(`
    <h2 style="color:#1a2456;">💵 Cash Payment to Confirm</h2>
    <p>Hi ${rider.name},</p>
    <p>The client has confirmed paying <strong>GHS ${booking.delivery_fee}</strong> cash for delivery <strong>${booking.reference}</strong>.</p>
    <p>Please log in to confirm you received the cash.</p>
    <a href="https://sakzee.com/rider/login" style="display:inline-block;background:#f97316;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;margin-top:0.5rem;">Confirm Cash Receipt →</a>
  `);
  await notify(rider.phone, null, 'whatsapp', TEMPLATES.order_status_client, { '1': rider.name, '2': booking.reference, '3': 'Cash Payment — Please Confirm' }, `💵 Cash Payment Confirmation — ${booking.reference}`, html);
}

export async function notifyClientOrderStatus(
  client: { phone: string; email?: string; name: string; notification_preference?: Pref },
  booking: { reference: string; status: string; service: string; delivery_fee?: number }
) {
  const pref = client.notification_preference || 'whatsapp';
  const isPaid = booking.status === 'Paid';
  const isDelivered = booking.status === 'Delivered' && booking.delivery_fee;
  const isRider = booking.service?.startsWith('Payment confirmed');

  let html = '';
  if (isPaid && isRider) {
    // Rider notification
    html = emailTemplate(`<h2 style="color:#15803d;">Payment Received ✅</h2><p>Hi ${client.name}, payment of <strong>GHS ${booking.delivery_fee}</strong> has been confirmed for delivery <strong>${booking.reference}</strong>. Well done!</p>`);
  } else if (isPaid) {
    // Paying party notification
    html = emailTemplate(`<h2 style="color:#15803d;">Payment Confirmed ✅</h2><p>Hi ${client.name}, your payment of <strong>GHS ${booking.delivery_fee}</strong> for delivery <strong>${booking.reference}</strong> has been received. Thank you for choosing Sakzee!</p>`);
  } else {
    html = emailTemplate(`<h2 style="color:#1a2456;">${booking.status}</h2><p>Hi ${client.name}, your delivery ${booking.reference} is now <strong>${booking.status}</strong>.</p>${isDelivered ? `<p><a href="https://sakzee.com/pay/${booking.reference}" style="background:#f97316;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;">Pay GHS ${booking.delivery_fee}</a></p>` : `<p><a href="https://sakzee.com/track" style="background:#1a2456;color:white;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700;">Track Delivery</a></p>`}`);
  }

  const waVars = isPaid
    ? { '1': client.name, '2': booking.reference, '3': `Paid - GHS ${booking.delivery_fee} confirmed` }
    : { '1': client.name, '2': booking.reference, '3': booking.status };

  await notify(client.phone, client.email || null, pref, TEMPLATES.order_status_client, waVars, `Delivery ${booking.reference} — ${booking.status}`, html);
}