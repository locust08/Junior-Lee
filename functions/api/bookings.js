import {
  cleanValue,
  createContactSubmissionPage,
  createBookingPage,
  appendContactSubmissionToGoogleSheet,
  findActiveBookingBySlot,
  getConfig,
  jsonResponse,
  normalizeMalaysiaPhone,
  sendBookingEmails,
  sendBookingWhatsApp,
  slotKey,
  validateBooking,
} from '../_lib/booking.js';

export async function onRequestPost({ request, env }) {
  const config = getConfig(env);
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ message: 'Please submit the form again.' }, 400);
  }

  const validationError = validateBooking(payload);
  if (validationError) return jsonResponse({ message: validationError }, 400);

  try {
    const key = slotKey(payload.date, payload.time);
    const submissionTimestamp = new Date().toISOString();
    const primaryDatabaseStoresContactSubmission =
      !config.contactNotionDatabaseId
      || config.contactNotionDatabaseId === config.notionDatabaseId;
    const duplicate = await findActiveBookingBySlot(config, key);
    if (duplicate) {
      return jsonResponse({ message: 'This time slot has already been booked. Please choose another time.' }, 409);
    }

    const booking = await createBookingPage(config, {
      name: cleanValue(payload.name),
      email: cleanValue(payload.email),
      phone: normalizeMalaysiaPhone(payload.phone),
      loanType: cleanValue(payload.loanType),
      location: cleanValue(payload.location),
      date: payload.date,
      time: payload.time,
      message: cleanValue(payload.message),
      submissionTimestamp: primaryDatabaseStoresContactSubmission
        ? submissionTimestamp
        : '',
    });

    const contactPayload = {
      name: cleanValue(payload.name),
      email: cleanValue(payload.email),
      phone: normalizeMalaysiaPhone(payload.phone),
      loanType: cleanValue(payload.loanType),
      location: cleanValue(payload.location),
      date: payload.date,
      time: payload.time,
      message: cleanValue(payload.message),
      submissionTimestamp,
    };
    const contactNotionPromise =
      config.contactNotionDatabaseId === config.notionDatabaseId
        ? Promise.resolve({ ok: true, skipped: true })
        : createContactSubmissionPage(config, contactPayload);
    const [contactNotionResult, contactGoogleSheetResult] = await Promise.all([
      contactNotionPromise,
      appendContactSubmissionToGoogleSheet(config, contactPayload),
    ]);
    if (!contactNotionResult.ok) {
      console.error('[booking] Contact Notion storage failed:', contactNotionResult.error);
    }
    if (!contactGoogleSheetResult.ok) {
      console.error('[booking] Contact Google Sheet storage failed:', contactGoogleSheetResult.error);
    }

    const emailResults = await sendBookingEmails(config, booking);
    if (!emailResults.admin.ok) console.error('[booking] Company email failed:', emailResults.admin.error);
    if (!emailResults.client.ok) console.error('[booking] Applicant email failed:', emailResults.client.error);

    const whatsappResult = await sendBookingWhatsApp(config, booking);
    if (!whatsappResult.ok) console.error('[booking] WhatsApp message failed:', whatsappResult.error);

    const warnings = [];
    if (!emailResults.admin.ok) {
      warnings.push('Your booking was saved, but the company email notification could not be sent.');
    }
    if (!emailResults.client.ok) {
      warnings.push('Your booking was saved, but your confirmation email could not be sent.');
    }
    if (!whatsappResult.ok) {
      warnings.push('Your booking was saved, but a WhatsApp notification could not be sent.');
    }
    if (!contactNotionResult.ok) {
      warnings.push('Your booking was saved, but the contact details could not be copied to the contact Notion table.');
    }
    if (!contactGoogleSheetResult.ok) {
      warnings.push('Your booking was saved, but the contact details could not be copied to the contact Google Sheet.');
    }

    return jsonResponse({ message: 'Booking submitted.', booking, warnings }, 201);
  } catch (error) {
    console.error('[booking] Booking submission failed:', error);
    return jsonResponse({
      message: 'Sorry, we could not submit your appointment right now. Please try again or contact us on WhatsApp.',
    }, 500);
  }
}
