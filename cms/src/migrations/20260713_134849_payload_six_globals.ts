import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_settings\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`header_website_logo_id\` integer,
	\`header_mobile_drawer_logo_id\` integer,
	\`header_about_us_menu_label\` text,
	\`header_loan_menu_label\` text,
	\`header_how_to_apply_menu_label\` text,
	\`header_contact_us_menu_label\` text,
	\`header_apply_now_button_label\` text,
	\`header_login_button_label\` text,
	\`header_newsletter_label\` text,
	\`footer_footer_logo_id\` integer,
	\`footer_pages_column_heading\` text,
	\`footer_home_link_label\` text,
	\`footer_about_us_link_label\` text,
	\`footer_loan_link_label\` text,
	\`footer_help_column_heading\` text,
	\`footer_how_to_apply_link_label\` text,
	\`footer_contact_us_link_label\` text,
	\`footer_copyright_text\` text,
	\`contact_details_support_email\` text,
	\`contact_details_display_phone_number\` text,
	\`contact_details_office_name\` text,
	\`contact_details_office_address\` text,
	\`contact_details_waze_url\` text,
	\`contact_details_google_maps_url\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`header_website_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`header_mobile_drawer_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`footer_footer_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_header_header_website_logo_idx\` ON \`site_settings\` (\`header_website_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_header_header_mobile_drawer_logo_idx\` ON \`site_settings\` (\`header_mobile_drawer_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_footer_footer_footer_logo_idx\` ON \`site_settings\` (\`footer_footer_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings__status_idx\` ON \`site_settings\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_header_website_logo_id\` integer,
	\`version_header_mobile_drawer_logo_id\` integer,
	\`version_header_about_us_menu_label\` text,
	\`version_header_loan_menu_label\` text,
	\`version_header_how_to_apply_menu_label\` text,
	\`version_header_contact_us_menu_label\` text,
	\`version_header_apply_now_button_label\` text,
	\`version_header_login_button_label\` text,
	\`version_header_newsletter_label\` text,
	\`version_footer_footer_logo_id\` integer,
	\`version_footer_pages_column_heading\` text,
	\`version_footer_home_link_label\` text,
	\`version_footer_about_us_link_label\` text,
	\`version_footer_loan_link_label\` text,
	\`version_footer_help_column_heading\` text,
	\`version_footer_how_to_apply_link_label\` text,
	\`version_footer_contact_us_link_label\` text,
	\`version_footer_copyright_text\` text,
	\`version_contact_details_support_email\` text,
	\`version_contact_details_display_phone_number\` text,
	\`version_contact_details_office_name\` text,
	\`version_contact_details_office_address\` text,
	\`version_contact_details_waze_url\` text,
	\`version_contact_details_google_maps_url\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`latest\` integer,
	FOREIGN KEY (\`version_header_website_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_header_mobile_drawer_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_footer_footer_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_header_version_header_website_l_idx\` ON \`_site_settings_v\` (\`version_header_website_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_header_version_header_mobile_dr_idx\` ON \`_site_settings_v\` (\`version_header_mobile_drawer_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_footer_version_footer_footer_lo_idx\` ON \`_site_settings_v\` (\`version_footer_footer_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version__status_idx\` ON \`_site_settings_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_latest_idx\` ON \`_site_settings_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`home_page_how_it_works_steps\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_how_it_works_steps_order_idx\` ON \`home_page_how_it_works_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_how_it_works_steps_parent_id_idx\` ON \`home_page_how_it_works_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_statistics_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`value\` text,
	\`label\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_statistics_items_order_idx\` ON \`home_page_statistics_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_statistics_items_parent_id_idx\` ON \`home_page_statistics_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_loan_options_cards\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`title\` text,
	\`description\` text,
	\`link_label\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_loan_options_cards_order_idx\` ON \`home_page_loan_options_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_loan_options_cards_parent_id_idx\` ON \`home_page_loan_options_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_loan_options_cards_image_idx\` ON \`home_page_loan_options_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page_why_choose_us_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_why_choose_us_features_order_idx\` ON \`home_page_why_choose_us_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_page_why_choose_us_features_parent_id_idx\` ON \`home_page_why_choose_us_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_page\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`seo_title\` text,
	\`seo_description\` text,
	\`hero_eyebrow\` text,
	\`hero_main_heading\` text,
	\`hero_description\` text,
	\`hero_primary_button_label\` text,
	\`hero_secondary_button_label\` text,
	\`hero_left_top_image_id\` integer,
	\`hero_right_top_image_id\` integer,
	\`hero_bottom_left_image_id\` integer,
	\`hero_bottom_right_image_id\` integer,
	\`how_it_works_heading\` text,
	\`how_it_works_description\` text,
	\`loan_options_heading\` text,
	\`loan_options_description\` text,
	\`why_choose_us_image_id\` integer,
	\`why_choose_us_heading\` text,
	\`ready_to_get_started_heading\` text,
	\`ready_to_get_started_description\` text,
	\`ready_to_get_started_apply_button_label\` text,
	\`ready_to_get_started_whatsapp_button_label\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_left_top_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`hero_right_top_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`hero_bottom_left_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`hero_bottom_right_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`why_choose_us_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_left_top_image_idx\` ON \`home_page\` (\`hero_left_top_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_right_top_image_idx\` ON \`home_page\` (\`hero_right_top_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_bottom_left_image_idx\` ON \`home_page\` (\`hero_bottom_left_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_hero_hero_bottom_right_image_idx\` ON \`home_page\` (\`hero_bottom_right_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page_why_choose_us_why_choose_us_image_idx\` ON \`home_page\` (\`why_choose_us_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_page__status_idx\` ON \`home_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_how_it_works_steps\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_how_it_works_steps_order_idx\` ON \`_home_page_v_version_how_it_works_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_how_it_works_steps_parent_id_idx\` ON \`_home_page_v_version_how_it_works_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_statistics_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`value\` text,
	\`label\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_statistics_items_order_idx\` ON \`_home_page_v_version_statistics_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_statistics_items_parent_id_idx\` ON \`_home_page_v_version_statistics_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_loan_options_cards\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`title\` text,
	\`description\` text,
	\`link_label\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_loan_options_cards_order_idx\` ON \`_home_page_v_version_loan_options_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_loan_options_cards_parent_id_idx\` ON \`_home_page_v_version_loan_options_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_loan_options_cards_image_idx\` ON \`_home_page_v_version_loan_options_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v_version_why_choose_us_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_home_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_why_choose_us_features_order_idx\` ON \`_home_page_v_version_why_choose_us_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_why_choose_us_features_parent_id_idx\` ON \`_home_page_v_version_why_choose_us_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_home_page_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_seo_title\` text,
	\`version_seo_description\` text,
	\`version_hero_eyebrow\` text,
	\`version_hero_main_heading\` text,
	\`version_hero_description\` text,
	\`version_hero_primary_button_label\` text,
	\`version_hero_secondary_button_label\` text,
	\`version_hero_left_top_image_id\` integer,
	\`version_hero_right_top_image_id\` integer,
	\`version_hero_bottom_left_image_id\` integer,
	\`version_hero_bottom_right_image_id\` integer,
	\`version_how_it_works_heading\` text,
	\`version_how_it_works_description\` text,
	\`version_loan_options_heading\` text,
	\`version_loan_options_description\` text,
	\`version_why_choose_us_image_id\` integer,
	\`version_why_choose_us_heading\` text,
	\`version_ready_to_get_started_heading\` text,
	\`version_ready_to_get_started_description\` text,
	\`version_ready_to_get_started_apply_button_label\` text,
	\`version_ready_to_get_started_whatsapp_button_label\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_left_top_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_hero_right_top_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_hero_bottom_left_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_hero_bottom_right_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_why_choose_us_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_left_top_image_idx\` ON \`_home_page_v\` (\`version_hero_left_top_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_right_top_image_idx\` ON \`_home_page_v\` (\`version_hero_right_top_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_bottom_left_image_idx\` ON \`_home_page_v\` (\`version_hero_bottom_left_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_hero_version_hero_bottom_right_imag_idx\` ON \`_home_page_v\` (\`version_hero_bottom_right_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_why_choose_us_version_why_choose_us_idx\` ON \`_home_page_v\` (\`version_why_choose_us_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_version_version__status_idx\` ON \`_home_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_created_at_idx\` ON \`_home_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_updated_at_idx\` ON \`_home_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_home_page_v_latest_idx\` ON \`_home_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`about_us_page_who_we_are_paragraphs\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`text\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_us_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_are_paragraphs_order_idx\` ON \`about_us_page_who_we_are_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_are_paragraphs_parent_id_idx\` ON \`about_us_page_who_we_are_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_us_page_who_we_are_statistics\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`value\` text,
	\`label\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_us_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_are_statistics_order_idx\` ON \`about_us_page_who_we_are_statistics\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_are_statistics_parent_id_idx\` ON \`about_us_page_who_we_are_statistics\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_us_page_why_choose_us_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_us_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_us_page_why_choose_us_features_order_idx\` ON \`about_us_page_why_choose_us_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_why_choose_us_features_parent_id_idx\` ON \`about_us_page_why_choose_us_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_us_page_trust_and_security_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_us_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_us_page_trust_and_security_items_order_idx\` ON \`about_us_page_trust_and_security_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_trust_and_security_items_parent_id_idx\` ON \`about_us_page_trust_and_security_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`about_us_page_who_we_help_cards\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_us_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_help_cards_order_idx\` ON \`about_us_page_who_we_help_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_help_cards_parent_id_idx\` ON \`about_us_page_who_we_help_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_help_cards_image_idx\` ON \`about_us_page_who_we_help_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`about_us_page\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`seo_title\` text,
	\`seo_description\` text,
	\`hero_background_image_id\` integer,
	\`hero_main_heading\` text,
	\`hero_description\` text,
	\`who_we_are_image_id\` integer,
	\`who_we_are_heading\` text,
	\`why_choose_us_heading\` text,
	\`why_choose_us_description\` text,
	\`trust_and_security_heading\` text,
	\`trust_and_security_description\` text,
	\`trust_and_security_image_id\` integer,
	\`who_we_help_heading\` text,
	\`who_we_help_description\` text,
	\`ready_to_get_started_heading\` text,
	\`ready_to_get_started_description\` text,
	\`ready_to_get_started_apply_button_label\` text,
	\`ready_to_get_started_advisor_button_label\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`who_we_are_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`trust_and_security_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`about_us_page_hero_hero_background_image_idx\` ON \`about_us_page\` (\`hero_background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_who_we_are_who_we_are_image_idx\` ON \`about_us_page\` (\`who_we_are_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page_trust_and_security_trust_and_security_imag_idx\` ON \`about_us_page\` (\`trust_and_security_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_us_page__status_idx\` ON \`about_us_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_about_us_page_v_version_who_we_are_paragraphs\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`text\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_us_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_are_paragraphs_order_idx\` ON \`_about_us_page_v_version_who_we_are_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_are_paragraphs_parent_id_idx\` ON \`_about_us_page_v_version_who_we_are_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_us_page_v_version_who_we_are_statistics\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`value\` text,
	\`label\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_us_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_are_statistics_order_idx\` ON \`_about_us_page_v_version_who_we_are_statistics\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_are_statistics_parent_id_idx\` ON \`_about_us_page_v_version_who_we_are_statistics\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_us_page_v_version_why_choose_us_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_us_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_why_choose_us_features_order_idx\` ON \`_about_us_page_v_version_why_choose_us_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_why_choose_us_features_parent_id_idx\` ON \`_about_us_page_v_version_why_choose_us_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_us_page_v_version_trust_and_security_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_us_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_trust_and_security_items_order_idx\` ON \`_about_us_page_v_version_trust_and_security_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_trust_and_security_items_parent_id_idx\` ON \`_about_us_page_v_version_trust_and_security_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_us_page_v_version_who_we_help_cards\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_us_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_help_cards_order_idx\` ON \`_about_us_page_v_version_who_we_help_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_help_cards_parent_id_idx\` ON \`_about_us_page_v_version_who_we_help_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_help_cards_image_idx\` ON \`_about_us_page_v_version_who_we_help_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_us_page_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_seo_title\` text,
	\`version_seo_description\` text,
	\`version_hero_background_image_id\` integer,
	\`version_hero_main_heading\` text,
	\`version_hero_description\` text,
	\`version_who_we_are_image_id\` integer,
	\`version_who_we_are_heading\` text,
	\`version_why_choose_us_heading\` text,
	\`version_why_choose_us_description\` text,
	\`version_trust_and_security_heading\` text,
	\`version_trust_and_security_description\` text,
	\`version_trust_and_security_image_id\` integer,
	\`version_who_we_help_heading\` text,
	\`version_who_we_help_description\` text,
	\`version_ready_to_get_started_heading\` text,
	\`version_ready_to_get_started_description\` text,
	\`version_ready_to_get_started_apply_button_label\` text,
	\`version_ready_to_get_started_advisor_button_label\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_who_we_are_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_trust_and_security_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_hero_version_hero_background_im_idx\` ON \`_about_us_page_v\` (\`version_hero_background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_who_we_are_version_who_we_are_i_idx\` ON \`_about_us_page_v\` (\`version_who_we_are_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_trust_and_security_version_trus_idx\` ON \`_about_us_page_v\` (\`version_trust_and_security_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_version_version__status_idx\` ON \`_about_us_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_created_at_idx\` ON \`_about_us_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_updated_at_idx\` ON \`_about_us_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_us_page_v_latest_idx\` ON \`_about_us_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`loan_page_personal_loan_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`loan_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`loan_page_personal_loan_features_order_idx\` ON \`loan_page_personal_loan_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_personal_loan_features_parent_id_idx\` ON \`loan_page_personal_loan_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_personal_loan_features_image_idx\` ON \`loan_page_personal_loan_features\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`loan_page_personal_loan_requirements_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`text\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`loan_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`loan_page_personal_loan_requirements_items_order_idx\` ON \`loan_page_personal_loan_requirements_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_personal_loan_requirements_items_parent_id_idx\` ON \`loan_page_personal_loan_requirements_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`loan_page_business_loan_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`loan_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`loan_page_business_loan_features_order_idx\` ON \`loan_page_business_loan_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_business_loan_features_parent_id_idx\` ON \`loan_page_business_loan_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_business_loan_features_image_idx\` ON \`loan_page_business_loan_features\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`loan_page_business_loan_requirements_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`text\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`loan_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`loan_page_business_loan_requirements_items_order_idx\` ON \`loan_page_business_loan_requirements_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_business_loan_requirements_items_parent_id_idx\` ON \`loan_page_business_loan_requirements_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`loan_page_comparison_rows\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`label\` text,
	\`personal_value\` text,
	\`business_value\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`loan_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`loan_page_comparison_rows_order_idx\` ON \`loan_page_comparison_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_comparison_rows_parent_id_idx\` ON \`loan_page_comparison_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`loan_page_interest_rates_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`loan_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`loan_page_interest_rates_features_order_idx\` ON \`loan_page_interest_rates_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_interest_rates_features_parent_id_idx\` ON \`loan_page_interest_rates_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`loan_page\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`seo_title\` text,
	\`seo_description\` text,
	\`hero_main_heading\` text,
	\`hero_description\` text,
	\`hero_primary_button_label\` text,
	\`hero_secondary_button_label\` text,
	\`hero_image_id\` integer,
	\`personal_loan_heading\` text,
	\`personal_loan_description\` text,
	\`personal_loan_apply_button_label\` text,
	\`personal_loan_whatsapp_button_label\` text,
	\`personal_loan_requirements_image_id\` integer,
	\`personal_loan_requirements_heading\` text,
	\`business_loan_heading\` text,
	\`business_loan_description\` text,
	\`business_loan_apply_button_label\` text,
	\`business_loan_whatsapp_button_label\` text,
	\`business_loan_requirements_image_id\` integer,
	\`business_loan_requirements_heading\` text,
	\`comparison_heading\` text,
	\`comparison_description\` text,
	\`comparison_table_heading\` text,
	\`comparison_personal_column_title\` text,
	\`comparison_personal_column_subtitle\` text,
	\`comparison_business_column_title\` text,
	\`comparison_business_column_subtitle\` text,
	\`comparison_loan_details_heading\` text,
	\`comparison_application_needs_heading\` text,
	\`interest_rates_heading\` text,
	\`interest_rates_description\` text,
	\`estimator_heading\` text,
	\`estimator_disclaimer\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`personal_loan_requirements_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`business_loan_requirements_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`loan_page_hero_hero_image_idx\` ON \`loan_page\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_personal_loan_requirements_personal_loan_requi_idx\` ON \`loan_page\` (\`personal_loan_requirements_image_id\`);`)
  await db.run(sql`CREATE INDEX \`loan_page_business_loan_requirements_business_loan_requi_idx\` ON \`loan_page\` (\`business_loan_requirements_image_id\`);`)
  await db.run(sql`CREATE INDEX \`loan_page__status_idx\` ON \`loan_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_loan_page_v_version_personal_loan_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_loan_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_personal_loan_features_order_idx\` ON \`_loan_page_v_version_personal_loan_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_personal_loan_features_parent_id_idx\` ON \`_loan_page_v_version_personal_loan_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_personal_loan_features_image_idx\` ON \`_loan_page_v_version_personal_loan_features\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_loan_page_v_version_personal_loan_requirements_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`text\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_loan_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_personal_loan_requirements_items_order_idx\` ON \`_loan_page_v_version_personal_loan_requirements_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_personal_loan_requirements_items_parent_id_idx\` ON \`_loan_page_v_version_personal_loan_requirements_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_loan_page_v_version_business_loan_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`image_id\` integer,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_loan_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_business_loan_features_order_idx\` ON \`_loan_page_v_version_business_loan_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_business_loan_features_parent_id_idx\` ON \`_loan_page_v_version_business_loan_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_business_loan_features_image_idx\` ON \`_loan_page_v_version_business_loan_features\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_loan_page_v_version_business_loan_requirements_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`text\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_loan_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_business_loan_requirements_items_order_idx\` ON \`_loan_page_v_version_business_loan_requirements_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_business_loan_requirements_items_parent_id_idx\` ON \`_loan_page_v_version_business_loan_requirements_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_loan_page_v_version_comparison_rows\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`label\` text,
	\`personal_value\` text,
	\`business_value\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_loan_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_comparison_rows_order_idx\` ON \`_loan_page_v_version_comparison_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_comparison_rows_parent_id_idx\` ON \`_loan_page_v_version_comparison_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_loan_page_v_version_interest_rates_features\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_loan_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_interest_rates_features_order_idx\` ON \`_loan_page_v_version_interest_rates_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_interest_rates_features_parent_id_idx\` ON \`_loan_page_v_version_interest_rates_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_loan_page_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_seo_title\` text,
	\`version_seo_description\` text,
	\`version_hero_main_heading\` text,
	\`version_hero_description\` text,
	\`version_hero_primary_button_label\` text,
	\`version_hero_secondary_button_label\` text,
	\`version_hero_image_id\` integer,
	\`version_personal_loan_heading\` text,
	\`version_personal_loan_description\` text,
	\`version_personal_loan_apply_button_label\` text,
	\`version_personal_loan_whatsapp_button_label\` text,
	\`version_personal_loan_requirements_image_id\` integer,
	\`version_personal_loan_requirements_heading\` text,
	\`version_business_loan_heading\` text,
	\`version_business_loan_description\` text,
	\`version_business_loan_apply_button_label\` text,
	\`version_business_loan_whatsapp_button_label\` text,
	\`version_business_loan_requirements_image_id\` integer,
	\`version_business_loan_requirements_heading\` text,
	\`version_comparison_heading\` text,
	\`version_comparison_description\` text,
	\`version_comparison_table_heading\` text,
	\`version_comparison_personal_column_title\` text,
	\`version_comparison_personal_column_subtitle\` text,
	\`version_comparison_business_column_title\` text,
	\`version_comparison_business_column_subtitle\` text,
	\`version_comparison_loan_details_heading\` text,
	\`version_comparison_application_needs_heading\` text,
	\`version_interest_rates_heading\` text,
	\`version_interest_rates_description\` text,
	\`version_estimator_heading\` text,
	\`version_estimator_disclaimer\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`latest\` integer,
	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_personal_loan_requirements_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_business_loan_requirements_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_hero_version_hero_image_idx\` ON \`_loan_page_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_personal_loan_requirements_version__idx\` ON \`_loan_page_v\` (\`version_personal_loan_requirements_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_business_loan_requirements_version__idx\` ON \`_loan_page_v\` (\`version_business_loan_requirements_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_version_version__status_idx\` ON \`_loan_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_created_at_idx\` ON \`_loan_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_updated_at_idx\` ON \`_loan_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_loan_page_v_latest_idx\` ON \`_loan_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`how_to_apply_page_steps_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`how_to_apply_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`how_to_apply_page_steps_items_order_idx\` ON \`how_to_apply_page_steps_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`how_to_apply_page_steps_items_parent_id_idx\` ON \`how_to_apply_page_steps_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`how_to_apply_page_required_documents_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`how_to_apply_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`how_to_apply_page_required_documents_items_order_idx\` ON \`how_to_apply_page_required_documents_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`how_to_apply_page_required_documents_items_parent_id_idx\` ON \`how_to_apply_page_required_documents_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`how_to_apply_page_eligibility_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`text\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`how_to_apply_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`how_to_apply_page_eligibility_items_order_idx\` ON \`how_to_apply_page_eligibility_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`how_to_apply_page_eligibility_items_parent_id_idx\` ON \`how_to_apply_page_eligibility_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`how_to_apply_page\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`seo_title\` text,
	\`seo_description\` text,
	\`hero_main_heading\` text,
	\`hero_description\` text,
	\`hero_primary_button_label\` text,
	\`steps_heading\` text,
	\`steps_description\` text,
	\`required_documents_image_id\` integer,
	\`required_documents_heading\` text,
	\`required_documents_description\` text,
	\`eligibility_heading\` text,
	\`eligibility_description\` text,
	\`ready_to_apply_heading\` text,
	\`ready_to_apply_description\` text,
	\`ready_to_apply_whatsapp_button_label\` text,
	\`ready_to_apply_submit_button_label\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`required_documents_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`how_to_apply_page_required_documents_required_documents__idx\` ON \`how_to_apply_page\` (\`required_documents_image_id\`);`)
  await db.run(sql`CREATE INDEX \`how_to_apply_page__status_idx\` ON \`how_to_apply_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_how_to_apply_page_v_version_steps_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_how_to_apply_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_version_steps_items_order_idx\` ON \`_how_to_apply_page_v_version_steps_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_version_steps_items_parent_id_idx\` ON \`_how_to_apply_page_v_version_steps_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_how_to_apply_page_v_version_required_documents_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text,
	\`description\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_how_to_apply_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_version_required_documents_items_order_idx\` ON \`_how_to_apply_page_v_version_required_documents_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_version_required_documents_items_parent_id_idx\` ON \`_how_to_apply_page_v_version_required_documents_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_how_to_apply_page_v_version_eligibility_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`text\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_how_to_apply_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_version_eligibility_items_order_idx\` ON \`_how_to_apply_page_v_version_eligibility_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_version_eligibility_items_parent_id_idx\` ON \`_how_to_apply_page_v_version_eligibility_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_how_to_apply_page_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_seo_title\` text,
	\`version_seo_description\` text,
	\`version_hero_main_heading\` text,
	\`version_hero_description\` text,
	\`version_hero_primary_button_label\` text,
	\`version_steps_heading\` text,
	\`version_steps_description\` text,
	\`version_required_documents_image_id\` integer,
	\`version_required_documents_heading\` text,
	\`version_required_documents_description\` text,
	\`version_eligibility_heading\` text,
	\`version_eligibility_description\` text,
	\`version_ready_to_apply_heading\` text,
	\`version_ready_to_apply_description\` text,
	\`version_ready_to_apply_whatsapp_button_label\` text,
	\`version_ready_to_apply_submit_button_label\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`latest\` integer,
	FOREIGN KEY (\`version_required_documents_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_version_required_documents_version__idx\` ON \`_how_to_apply_page_v\` (\`version_required_documents_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_version_version__status_idx\` ON \`_how_to_apply_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_created_at_idx\` ON \`_how_to_apply_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_updated_at_idx\` ON \`_how_to_apply_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_how_to_apply_page_v_latest_idx\` ON \`_how_to_apply_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`contact_us_page_faq_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`question\` text,
	\`answer\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_us_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_us_page_faq_items_order_idx\` ON \`contact_us_page_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`contact_us_page_faq_items_parent_id_idx\` ON \`contact_us_page_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_us_page\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`seo_title\` text,
	\`seo_description\` text,
	\`contact_form_heading\` text,
	\`contact_form_description\` text,
	\`contact_form_submit_button_label\` text,
	\`contact_form_image_id\` integer,
	\`contact_methods_email_heading\` text,
	\`contact_methods_email_description\` text,
	\`contact_methods_phone_heading\` text,
	\`contact_methods_office_heading\` text,
	\`contact_methods_office_description\` text,
	\`faq_heading\` text,
	\`faq_description\` text,
	\`still_have_questions_heading\` text,
	\`_status\` text DEFAULT 'draft',
	\`updated_at\` text,
	\`created_at\` text,
	FOREIGN KEY (\`contact_form_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_us_page_contact_form_contact_form_image_idx\` ON \`contact_us_page\` (\`contact_form_image_id\`);`)
  await db.run(sql`CREATE INDEX \`contact_us_page__status_idx\` ON \`contact_us_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_contact_us_page_v_version_faq_items\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`question\` text,
	\`answer\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_contact_us_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_contact_us_page_v_version_faq_items_order_idx\` ON \`_contact_us_page_v_version_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_contact_us_page_v_version_faq_items_parent_id_idx\` ON \`_contact_us_page_v_version_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_contact_us_page_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`version_seo_title\` text,
	\`version_seo_description\` text,
	\`version_contact_form_heading\` text,
	\`version_contact_form_description\` text,
	\`version_contact_form_submit_button_label\` text,
	\`version_contact_form_image_id\` integer,
	\`version_contact_methods_email_heading\` text,
	\`version_contact_methods_email_description\` text,
	\`version_contact_methods_phone_heading\` text,
	\`version_contact_methods_office_heading\` text,
	\`version_contact_methods_office_description\` text,
	\`version_faq_heading\` text,
	\`version_faq_description\` text,
	\`version_still_have_questions_heading\` text,
	\`version__status\` text DEFAULT 'draft',
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`latest\` integer,
	FOREIGN KEY (\`version_contact_form_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_contact_us_page_v_version_contact_form_version_contact__idx\` ON \`_contact_us_page_v\` (\`version_contact_form_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_contact_us_page_v_version_version__status_idx\` ON \`_contact_us_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_contact_us_page_v_created_at_idx\` ON \`_contact_us_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_contact_us_page_v_updated_at_idx\` ON \`_contact_us_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_contact_us_page_v_latest_idx\` ON \`_contact_us_page_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`internal_name\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`home_page_how_it_works_steps\`;`)
  await db.run(sql`DROP TABLE \`home_page_statistics_items\`;`)
  await db.run(sql`DROP TABLE \`home_page_loan_options_cards\`;`)
  await db.run(sql`DROP TABLE \`home_page_why_choose_us_features\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_how_it_works_steps\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_statistics_items\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_loan_options_cards\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v_version_why_choose_us_features\`;`)
  await db.run(sql`DROP TABLE \`_home_page_v\`;`)
  await db.run(sql`DROP TABLE \`about_us_page_who_we_are_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`about_us_page_who_we_are_statistics\`;`)
  await db.run(sql`DROP TABLE \`about_us_page_why_choose_us_features\`;`)
  await db.run(sql`DROP TABLE \`about_us_page_trust_and_security_items\`;`)
  await db.run(sql`DROP TABLE \`about_us_page_who_we_help_cards\`;`)
  await db.run(sql`DROP TABLE \`about_us_page\`;`)
  await db.run(sql`DROP TABLE \`_about_us_page_v_version_who_we_are_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`_about_us_page_v_version_who_we_are_statistics\`;`)
  await db.run(sql`DROP TABLE \`_about_us_page_v_version_why_choose_us_features\`;`)
  await db.run(sql`DROP TABLE \`_about_us_page_v_version_trust_and_security_items\`;`)
  await db.run(sql`DROP TABLE \`_about_us_page_v_version_who_we_help_cards\`;`)
  await db.run(sql`DROP TABLE \`_about_us_page_v\`;`)
  await db.run(sql`DROP TABLE \`loan_page_personal_loan_features\`;`)
  await db.run(sql`DROP TABLE \`loan_page_personal_loan_requirements_items\`;`)
  await db.run(sql`DROP TABLE \`loan_page_business_loan_features\`;`)
  await db.run(sql`DROP TABLE \`loan_page_business_loan_requirements_items\`;`)
  await db.run(sql`DROP TABLE \`loan_page_comparison_rows\`;`)
  await db.run(sql`DROP TABLE \`loan_page_interest_rates_features\`;`)
  await db.run(sql`DROP TABLE \`loan_page\`;`)
  await db.run(sql`DROP TABLE \`_loan_page_v_version_personal_loan_features\`;`)
  await db.run(sql`DROP TABLE \`_loan_page_v_version_personal_loan_requirements_items\`;`)
  await db.run(sql`DROP TABLE \`_loan_page_v_version_business_loan_features\`;`)
  await db.run(sql`DROP TABLE \`_loan_page_v_version_business_loan_requirements_items\`;`)
  await db.run(sql`DROP TABLE \`_loan_page_v_version_comparison_rows\`;`)
  await db.run(sql`DROP TABLE \`_loan_page_v_version_interest_rates_features\`;`)
  await db.run(sql`DROP TABLE \`_loan_page_v\`;`)
  await db.run(sql`DROP TABLE \`how_to_apply_page_steps_items\`;`)
  await db.run(sql`DROP TABLE \`how_to_apply_page_required_documents_items\`;`)
  await db.run(sql`DROP TABLE \`how_to_apply_page_eligibility_items\`;`)
  await db.run(sql`DROP TABLE \`how_to_apply_page\`;`)
  await db.run(sql`DROP TABLE \`_how_to_apply_page_v_version_steps_items\`;`)
  await db.run(sql`DROP TABLE \`_how_to_apply_page_v_version_required_documents_items\`;`)
  await db.run(sql`DROP TABLE \`_how_to_apply_page_v_version_eligibility_items\`;`)
  await db.run(sql`DROP TABLE \`_how_to_apply_page_v\`;`)
  await db.run(sql`DROP TABLE \`contact_us_page_faq_items\`;`)
  await db.run(sql`DROP TABLE \`contact_us_page\`;`)
  await db.run(sql`DROP TABLE \`_contact_us_page_v_version_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_contact_us_page_v\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`internal_name\`;`)
}
