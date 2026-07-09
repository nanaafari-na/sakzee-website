import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM_WHATSAPP = 'whatsapp:+233256089605';
const FROM_SMS = process.env.TWILIO_SMS_FROM || '';

const TEMPLATES = {
  vendor_approved: 'HX5aba3e20c6f230cceaa528001583b039',
  vendor_suspended: 'HX10c07067a28c77f772a425bccdf73c1f',
  inventory_checked_in: 'HXb394bf3d53082e7001d2e0d3baa57c48',
  order_status_update: 'HXf0fbfbf5a51e9ec7fce0f15eda3320a8',
  booking_confirmation: 'HX870d45087f6b06d057584c8414d9eb68',
  order_status_client: 'HX15f2a97da69c47bdbf3a8054414a0717',
};

type Pref = 'whatsapp' | 'sms' | 'both';

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

async function sendSMS(to: string, message: string) {
  try {
    if (!FROM_SMS) { console.warn('TWILIO_SMS_FROM not set'); return; }
    await twilioClient.messages.create({
      from: FROM_SMS,
      to: formatGhana(to),
      body: message,
    });
  } catch (e) { console.error('SMS error:', e); }
}

async function notify(
  phone: string, pref: Pref = 'both',
  waTpl: string, waVars: Record<string, string>,
  smsText: string
) {
  const wa = () => sendWhatsApp(phone, waTpl, waVars);
  const sms = () => sendSMS(phone, smsText);
  if (pref === 'whatsapp') return wa();
  if (pref === 'sms') return sms();
  return Promise.all([wa(), sms()]);
}

export async function notifyVendorApproved(vendor: {
  phone: string; business_name: string; contact_name: string;
  notification_preference?: Pref;
}) {
  await notify(
    vendor.phone, vendor.notification_preference || 'both',
    TEMPLATES.vendor_approved, { '1': vendor.business_name },
    `Sakzee: Hi ${vendor.contact_name}, your vendor account for ${vendor.business_name} has been approved! Log in at sakzee.com/vendor/login - Call 0256 089 599`
  );
}

export async function notifyVendorSuspended(vendor: {
  phone: string; business_name: string; contact_name: string;
  suspension_reason: string; notification_preference?: Pref;
}) {
  await notify(
    vendor.phone, vendor.notification_preference || 'both',
    TEMPLATES.vendor_suspended, { '1': vendor.business_name, '2': vendor.suspension_reason },
    `Sakzee: Hi ${vendor.contact_name}, your account for ${vendor.business_name} has been suspended. Reason: ${vendor.suspension_reason}. Call 0256 089 599`
  );
}

export async function notifyInventoryCheckedIn(
  vendor: { phone: string; contact_name: string; notification_preference?: Pref },
  product: { name: string; quantity: number; space_type: string }
) {
  await notify(
    vendor.phone, vendor.notification_preference || 'both',
    TEMPLATES.inventory_checked_in, { '1': vendor.contact_name, '2': product.name, '3': String(product.quantity) },
    `Sakzee: Hi ${vendor.contact_name}, inventory received! ${product.name} x${product.quantity} units. Create orders: sakzee.com/vendor/orders/new`
  );
}

export async function notifyVendorOrderStatus(
  vendor: { phone: string; contact_name: string; notification_preference?: Pref },
  order: { reference: string; status: string; delivery_address: string; recipient_name: string }
) {
  await notify(
    vendor.phone, vendor.notification_preference || 'both',
    TEMPLATES.order_status_update, { '1': vendor.contact_name, '2': order.reference, '3': order.status, '4': order.recipient_name },
    `Sakzee: Hi ${vendor.contact_name}, order ${order.reference} is now ${order.status}. Recipient: ${order.recipient_name}. View: sakzee.com/vendor/orders`
  );
}

export async function notifyDeliveryBooked(booking: {
  reference: string;
  booker_name: string; booker_phone: string;
  recipient_name: string; recipient_phone: string;
  pickup_address: string; delivery_address: string;
  pickup_date: string; pickup_time: string;
  delivery_fee: number; paying_party: string;
  notification_preference: Pref;
  same_person: boolean;
}) {
  const pref = booking.notification_preference;
  const payingName = booking.paying_party === 'recipient' ? booking.recipient_name : booking.booker_name;

  await notify(
    booking.booker_phone, pref,
    TEMPLATES.booking_confirmation,
    { '1': booking.booker_name, '2': booking.reference, '3': booking.pickup_date, '4': booking.pickup_time },
    `Sakzee: Hi ${booking.booker_name}, delivery booked! Ref: ${booking.reference}. Pickup: ${booking.pickup_date} at ${booking.pickup_time}. Est. fee: GHS ${booking.delivery_fee} payable by ${payingName} on delivery. Track: sakzee.com/track`
  );

  if (!booking.same_person && booking.recipient_phone && booking.recipient_phone !== booking.booker_phone) {
    await notify(
      booking.recipient_phone, pref,
      TEMPLATES.booking_confirmation,
      { '1': booking.recipient_name, '2': booking.reference, '3': booking.pickup_date, '4': booking.pickup_time },
      `Sakzee: Hi ${booking.recipient_name}, a package is on its way to you! Ref: ${booking.reference}. From: ${booking.booker_name}. Track: sakzee.com/track`
    );
  }
}

export async function notifyDeliveryStatus(booking: {
  reference: string;
  booker_name: string; booker_phone: string;
  recipient_name: string; recipient_phone: string;
  status: string; delivery_fee: number;
  paying_party: string; notification_preference: Pref;
  same_person: boolean;
}) {
  const pref = booking.notification_preference;

  const msgs: Record<string, { booker: string; recipient: string }> = {
    Processing: {
      booker: `Sakzee: Hi ${booking.booker_name}, delivery ${booking.reference} is being processed. Track: sakzee.com/track`,
      recipient: `Sakzee: Hi ${booking.recipient_name}, your package ${booking.reference} is being prepared. Track: sakzee.com/track`,
    },
    Shipped: {
      booker: `Sakzee: Hi ${booking.booker_name}, delivery ${booking.reference} is out for delivery! Track: sakzee.com/track`,
      recipient: `Sakzee: Hi ${booking.recipient_name}, your package ${booking.reference} is on its way! Track: sakzee.com/track`,
    },
    Delivered: {
      booker: booking.paying_party === 'booker'
        ? `Sakzee: Hi ${booking.booker_name}, delivery ${booking.reference} complete! Pay GHS ${booking.delivery_fee}: sakzee.com/pay/${booking.reference}`
        : `Sakzee: Hi ${booking.booker_name}, delivery ${booking.reference} complete! ${booking.recipient_name} will make payment. Thank you!`,
      recipient: booking.paying_party === 'recipient'
        ? `Sakzee: Hi ${booking.recipient_name}, your package ${booking.reference} delivered! Pay GHS ${booking.delivery_fee}: sakzee.com/pay/${booking.reference}`
        : `Sakzee: Hi ${booking.recipient_name}, your package ${booking.reference} has been delivered! Thank you for choosing Sakzee.`,
    },
  };

  const m = msgs[booking.status];
  if (!m) return;

  await notify(booking.booker_phone, pref, TEMPLATES.order_status_client, { '1': booking.booker_name, '2': booking.reference, '3': booking.status }, m.booker);

  if (!booking.same_person && booking.recipient_phone && booking.recipient_phone !== booking.booker_phone) {
    await notify(booking.recipient_phone, pref, TEMPLATES.order_status_client, { '1': booking.recipient_name, '2': booking.reference, '3': booking.status }, m.recipient);
  }
}

export async function notifyClientBooking(
  client: { phone: string; name: string; notification_preference?: Pref },
  booking: { reference: string; service: string; date: string }
) {
  await notify(
    client.phone, client.notification_preference || 'both',
    TEMPLATES.booking_confirmation, { '1': client.name, '2': booking.reference, '3': booking.date, '4': '' },
    `Sakzee: Hi ${client.name}, your booking ${booking.reference} is confirmed. Track: sakzee.com/track - Call 0256 089 599`
  );
}

export async function notifyClientOrderStatus(
  client: { phone: string; name: string; notification_preference?: Pref },
  booking: { reference: string; status: string; service: string; delivery_fee?: number }
) {
  const smsText = booking.status === 'Delivered' && booking.delivery_fee
    ? `Sakzee: Hi ${client.name}, delivery ${booking.reference} complete! Pay GHS ${booking.delivery_fee}: sakzee.com/pay/${booking.reference}`
    : `Sakzee: Hi ${client.name}, delivery ${booking.reference} is now ${booking.status}. Track: sakzee.com/track`;

  await notify(
    client.phone, client.notification_preference || 'both',
    TEMPLATES.order_status_client, { '1': client.name, '2': booking.reference, '3': booking.status },
    smsText
  );
}