import {
  confirmBookingPage,
  escapeHtml,
  formatAppointmentDate,
  getConfig,
  htmlResponse,
  sendConfirmedEmails,
  sendConfirmedWhatsApp,
} from '../../_lib/booking.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!id || !token) {
    return htmlResponse('<h1>Booking not found</h1><p>This confirmation link is invalid.</p>', 400);
  }

  const config = getConfig(env);
  const booking = await confirmBookingPage(config, id, token);

  if (!booking) {
    return htmlResponse('<h1>Booking not found</h1><p>This confirmation link is invalid or expired.</p>', 404);
  }

  const emailResults = await sendConfirmedEmails(config, booking);
  if (!emailResults.client.ok) console.error('[booking] Confirmed client email failed:', emailResults.client.error);
  if (!emailResults.admin.ok) console.error('[booking] Confirmed admin email failed:', emailResults.admin.error);

  const whatsappResult = await sendConfirmedWhatsApp(config, booking);
  if (!whatsappResult.ok) console.error('[booking] Confirmed WhatsApp failed:', whatsappResult.error);

  return htmlResponse(`<!doctype html>
<html>
  <head>
    <title>Appointment Confirmed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <main style="max-width:640px;margin:64px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;">
      <h1 style="margin:0 0 12px;font-size:28px;">Appointment Confirmed</h1>
      <p style="font-size:16px;line-height:1.6;">Your appointment for ${escapeHtml(formatAppointmentDate(booking))} is confirmed. A calendar invite has been sent to your email.</p>
      <p><a href="/contact.html" style="color:#0f766e;font-weight:700;">Back to contact page</a></p>
    </main>
  </body>
</html>`);
}
