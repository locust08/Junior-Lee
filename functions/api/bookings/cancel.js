import {
  cancelBookingPage,
  escapeHtml,
  formatAppointmentDate,
  getConfig,
  htmlResponse,
  sendCancelledEmails,
} from '../../_lib/booking.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!id || !token) {
    return htmlResponse('<h1>Booking not found</h1><p>This cancellation link is invalid.</p>', 400);
  }

  const config = getConfig(env);
  const booking = await cancelBookingPage(config, id, token);

  if (!booking) {
    return htmlResponse('<h1>Booking not found</h1><p>This cancellation link is invalid or expired.</p>', 404);
  }

  if (booking.wasConfirmed) {
    const emailResults = await sendCancelledEmails(config, booking);
    if (!emailResults.client.ok) console.error('[booking] Cancelled client email failed:', emailResults.client.error);
    if (!emailResults.admin.ok) console.error('[booking] Cancelled admin email failed:', emailResults.admin.error);
  }

  return htmlResponse(`<!doctype html>
<html>
  <head>
    <title>Appointment Cancelled</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <main style="max-width:640px;margin:64px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;">
      <h1 style="margin:0 0 12px;font-size:28px;">Appointment Cancelled</h1>
      <p style="font-size:16px;line-height:1.6;">Your appointment for ${escapeHtml(formatAppointmentDate(booking))} has been cancelled. This time slot is now available again.</p>
      <p><a href="/contact.html" style="color:#0f766e;font-weight:700;">Book another appointment</a></p>
    </main>
  </body>
</html>`);
}
