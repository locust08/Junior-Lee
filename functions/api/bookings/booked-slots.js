import {
  bookedTimesFromPages,
  findActiveBookingsForDate,
  getConfig,
  jsonResponse,
} from '../../_lib/booking.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  if (!date) return jsonResponse({ message: 'Date is required.' }, 400);

  const config = getConfig(env);
  try {
    const bookings = await findActiveBookingsForDate(config, date);
    return jsonResponse({ bookedTimes: bookedTimesFromPages(date, bookings) });
  } catch (error) {
    console.error('[booking] Booked-slot lookup failed:', error);
    return jsonResponse({ message: 'Booked times are temporarily unavailable. Please try again.' }, 500);
  }
}
