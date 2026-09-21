import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_brand_description\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_quick_links_column_heading\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_loan_options_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_loan_information_column_heading\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_personal_loan_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_business_loan_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_required_documents_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_interest_repayment_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_contact_column_heading\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_phone_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_email_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_office_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_hours_label\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD COLUMN \`footer_business_hours\` text;`)

  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_brand_description\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_quick_links_column_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_loan_options_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_loan_information_column_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_personal_loan_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_business_loan_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_required_documents_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_interest_repayment_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_contact_column_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_phone_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_email_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_office_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_hours_label\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD COLUMN \`version_footer_business_hours\` text;`)

  await db.run(sql`ALTER TABLE \`about_us_page\` ADD COLUMN \`hero_primary_button_label\` text;`)
  await db.run(sql`ALTER TABLE \`about_us_page\` ADD COLUMN \`ready_to_get_started_whatsapp_button_label\` text;`)
  await db.run(sql`ALTER TABLE \`_about_us_page_v\` ADD COLUMN \`version_hero_primary_button_label\` text;`)
  await db.run(sql`ALTER TABLE \`_about_us_page_v\` ADD COLUMN \`version_ready_to_get_started_whatsapp_button_label\` text;`)

  await db.run(sql`CREATE TABLE \`about_us_page_who_we_are_highlights\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`text\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_us_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_are_highlights_order_idx\` ON \`about_us_page_who_we_are_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_are_highlights_parent_id_idx\` ON \`about_us_page_who_we_are_highlights\` (\`_parent_id\`);`)

  await db.run(sql`CREATE TABLE \`_about_us_page_v_version_who_we_are_highlights\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`text\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_us_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_are_highlights_order_idx\` ON \`_about_us_page_v_version_who_we_are_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_are_highlights_parent_id_idx\` ON \`_about_us_page_v_version_who_we_are_highlights\` (\`_parent_id\`);`)

  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`hero_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`personal_loan_documents_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`business_loan_documents_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`required_documents_heading\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`required_documents_description\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`required_documents_personal_heading\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`required_documents_business_heading\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`required_documents_cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`required_documents_cta_description\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`interest_rates_example_heading\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`interest_rates_amount_label\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`interest_rates_amount_value\` text;`)
  await db.run(sql`ALTER TABLE \`loan_page\` ADD COLUMN \`interest_rates_example_description\` text;`)

  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_hero_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_personal_loan_documents_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_business_loan_documents_link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_required_documents_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_required_documents_description\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_required_documents_personal_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_required_documents_business_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_required_documents_cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_required_documents_cta_description\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_interest_rates_example_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_interest_rates_amount_label\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_interest_rates_amount_value\` text;`)
  await db.run(sql`ALTER TABLE \`_loan_page_v\` ADD COLUMN \`version_interest_rates_example_description\` text;`)

  await db.run(sql`ALTER TABLE \`contact_us_page\` ADD COLUMN \`contact_methods_phone_description\` text;`)
  await db.run(sql`ALTER TABLE \`contact_us_page\` ADD COLUMN \`still_have_questions_description\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_us_page_v\` ADD COLUMN \`version_contact_methods_phone_description\` text;`)
  await db.run(sql`ALTER TABLE \`_contact_us_page_v\` ADD COLUMN \`version_still_have_questions_description\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`about_us_page_who_we_are_highlights\`;`)
  await db.run(sql`DROP TABLE \`_about_us_page_v_version_who_we_are_highlights\`;`)
}
