import { NextRequest, NextResponse } from 'next/server';
import { notifyDeliveryBooked, notifyClientBooking } from '@/lib/notifications';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Save main booking
        const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
                reference: body.reference,
                name: body.name,
                phone: body.phone,
                email: body.email || null,
                business: body.business || '',
                service: body.service,
                date: body.date,
                notes: body.notes || '',
                pickup_address: body.pickup_address || null,
                delivery_address: body.delivery_address || null,
                package_description: body.package_description || null,
                pickup_time: body.pickup_time || null,
                booking_type: body.booking_type || 'consultation',
                delivery_fee: body.delivery_fee || 0,
                distance_km: body.distance_km || 0,
                region: body.region || null,
                notification_preference: body.notification_preference || 'whatsapp',
                payment_status: body.payment_status || 'pending',
                status: body.status || 'Received',
                recipient_name: body.recipient_name || null,
                recipient_phone: body.recipient_phone || null,
                paying_party: body.paying_party || 'booker',
                delivery_type: body.delivery_type || 'single',
                total_stops: body.total_stops || 1,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: err }, { status: 500 });
        }

        // Save stops for multi-stop bookings
        if (body.stops && body.stops.length > 0) {
            for (let i = 0; i < body.stops.length; i++) {
                const stop = body.stops[i];
                await fetch(`${SUPABASE_URL}/rest/v1/booking_stops`, {
                    method: 'POST',
                    headers: { ...headers, 'Prefer': 'return=minimal' },
                    body: JSON.stringify({
                        booking_id: body.reference,
                        stop_type: stop.type || stop.stop_type,
                        stop_order: stop.stop_order || i + 1,
                        address: stop.address,
                        contact_name: stop.contact_name || null,
                        contact_phone: stop.contact_phone || null,
                        package_description: stop.package_description || null,
                        weight_over_5kg: stop.weight_over_5kg || false,
                        distance_km: stop.distance_km || 0,
                        delivery_fee: stop.fee || stop.delivery_fee || 0,
                        paying_party: stop.paying_party || 'booker',
                    }),
                });
            }
        }

        // Send notifications
        const pref = body.notification_preference || 'whatsapp';

        if (body.booking_type === 'delivery') {
            if (body.delivery_type === 'single') {
                // Standard single booking notification
                await notifyDeliveryBooked({
                    reference: body.reference,
                    booker_name: body.name,
                    booker_phone: body.phone,
                    recipient_name: body.recipient_name || body.name,
                    recipient_phone: body.recipient_phone || body.phone,
                    pickup_address: body.pickup_address,
                    delivery_address: body.delivery_address,
                    pickup_date: body.date,
                    pickup_time: body.pickup_time,
                    delivery_fee: body.delivery_fee || 0,
                    paying_party: body.paying_party || 'booker',
                    notification_preference: pref,
                    same_person: body.recipient_phone === body.phone,
                });
            } else if (body.delivery_type === 'multi_delivery' && body.stops) {
                // Notify booker
                await notifyClientBooking(
                    { phone: body.phone, name: body.name, email: body.email, notification_preference: pref },
                    { reference: body.reference, service: `Multi-Delivery (${body.total_stops} stops)`, date: `${body.date} at ${body.pickup_time}` }
                );
                // Notify each delivery recipient
                const deliveryStops = body.stops.filter((s: any) => s.type === 'delivery');
                for (const stop of deliveryStops) {
                    if (stop.contact_phone) {
                        await notifyClientBooking(
                            { phone: stop.contact_phone, name: stop.contact_name, notification_preference: pref },
                            { reference: body.reference, service: `Delivery to ${stop.address}`, date: `${body.date} at ${body.pickup_time}` }
                        );
                    }
                }
            } else if (body.delivery_type === 'multi_pickup' && body.stops) {
                // Notify each pickup contact
                const pickupStops = body.stops.filter((s: any) => s.type === 'pickup');
                for (const stop of pickupStops) {
                    if (stop.contact_phone) {
                        await notifyClientBooking(
                            { phone: stop.contact_phone, name: stop.contact_name, notification_preference: pref },
                            { reference: body.reference, service: `Pickup from ${stop.address}`, date: `${body.date} at ${body.pickup_time}` }
                        );
                    }
                }
                // Notify recipient
                if (body.recipient_phone) {
                    await notifyClientBooking(
                        { phone: body.recipient_phone, name: body.recipient_name, notification_preference: pref },
                        { reference: body.reference, service: `Multi-Pickup Delivery (${body.total_stops} pickups)`, date: `${body.date} at ${body.pickup_time}` }
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}