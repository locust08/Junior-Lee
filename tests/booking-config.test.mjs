import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCalendarInvite, getConfig } from '../functions/_lib/booking.js';

test('normalizes Notion database IDs from full Notion URLs', () => {
  const config = getConfig({
    NOTION_TOKEN: 'test-token',
    APPOINTMENT_NOTION_DATABASE_ID: 'https://www.notion.so/workspace/Appointment-Bookings-fa9a71965f8d40ff92276ba56aa2d69f?v=abcdef',
  });

  assert.equal(config.notionDatabaseId, 'fa9a71965f8d40ff92276ba56aa2d69f');
});

test('normalizes Notion database IDs from collection URLs and hyphenated IDs', () => {
  const config = getConfig({
    NOTION_TOKEN: 'test-token',
    APPOINTMENT_NOTION_DATABASE_ID: 'collection://fa9a7196-5f8d-40ff-9227-6ba56aa2d69f',
    VISITOR_EVENTS_NOTION_DATABASE_ID: 'collection://3984fcc4-f701-80ec-8e27-f466ebc06223',
  });

  assert.equal(config.notionDatabaseId, 'fa9a71965f8d40ff92276ba56aa2d69f');
  assert.equal(config.visitorEventsDatabaseId, '3984fcc4f70180ec8e27f466ebc06223');
});

test('loads dedicated contact storage configuration', () => {
  const config = getConfig({
    CONTACT_NOTION_DATABASE_ID: 'https://www.notion.so/d94340aee05341d8b2b682ff856d2ddf',
    CONTACT_GOOGLE_SPREADSHEET_ID: 'sheet-id',
    CONTACT_GOOGLE_SHEET_NAME: 'Contact Form',
    GOOGLE_OAUTH_CLIENT_ID: 'client-id',
    GOOGLE_OAUTH_CLIENT_SECRET: 'client-secret',
    GOOGLE_WORKSPACE_OAUTH_REFRESH_TOKEN: 'refresh-token',
  });

  assert.equal(config.contactNotionDatabaseId, 'd94340aee05341d8b2b682ff856d2ddf');
  assert.equal(config.notionDatabaseId, 'd94340aee05341d8b2b682ff856d2ddf');
  assert.equal(config.contactGoogleSpreadsheetId, 'sheet-id');
  assert.equal(config.contactGoogleSheetName, 'Contact Form');
  assert.equal(config.googleOAuthClientId, 'client-id');
  assert.equal(config.googleOAuthClientSecret, 'client-secret');
  assert.equal(config.googleOAuthRefreshToken, 'refresh-token');
});

test('enables booking emails unless explicitly disabled by environment', () => {
  assert.equal(getConfig({}).emailNotificationsEnabled, true);
  assert.equal(getConfig({ BOOKING_EMAILS_ENABLED: 'true' }).emailNotificationsEnabled, true);
  assert.equal(
    getConfig({ BOOKING_EMAILS_ENABLED: 'false' }).emailNotificationsEnabled,
    false,
  );
});

test('calendar invitations use the Junior Lee customer-facing identity', () => {
  const invite = buildCalendarInvite({
    id: 'booking-1',
    name: 'Customer',
    email: 'customer@example.com',
    phone: '0170000000',
    loanType: 'Personal Loan',
    date: '2026-09-22',
    time: '10:00',
    cancelUrl: 'https://example.com/cancel',
  });

  assert.match(invite, /Junior Lee/);
  assert.match(invite, /ORGANIZER;CN=Junior Lee:mailto:metropinjamanberlesan@gmail\.com/);
  assert.match(
    invite,
    /LOCATION:Jalan Metro 1, Metro Prima, 52100 Kuala Lumpur, Federal Territory of Kuala Lumpur/,
  );
  assert.doesNotMatch(invite, /Alfa Pinjaman|Metro Pinjaman Berlesen/i);
});
