import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`payload_kv\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_home_text_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`text\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_home_text_slots_order_idx\` ON \`site_content_pages_home_text_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_home_text_slots_parent_id_idx\` ON \`site_content_pages_home_text_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_home_image_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`image_id\` integer,
	\`fallback_src\` text,
	\`fallback_alt\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_home_image_slots_order_idx\` ON \`site_content_pages_home_image_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_home_image_slots_parent_id_idx\` ON \`site_content_pages_home_image_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_home_image_slots_image_idx\` ON \`site_content_pages_home_image_slots\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_about_text_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`text\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_about_text_slots_order_idx\` ON \`site_content_pages_about_text_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_about_text_slots_parent_id_idx\` ON \`site_content_pages_about_text_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_about_image_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`image_id\` integer,
	\`fallback_src\` text,
	\`fallback_alt\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_about_image_slots_order_idx\` ON \`site_content_pages_about_image_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_about_image_slots_parent_id_idx\` ON \`site_content_pages_about_image_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_about_image_slots_image_idx\` ON \`site_content_pages_about_image_slots\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_loan_text_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`text\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_loan_text_slots_order_idx\` ON \`site_content_pages_loan_text_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_loan_text_slots_parent_id_idx\` ON \`site_content_pages_loan_text_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_loan_image_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`image_id\` integer,
	\`fallback_src\` text,
	\`fallback_alt\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_loan_image_slots_order_idx\` ON \`site_content_pages_loan_image_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_loan_image_slots_parent_id_idx\` ON \`site_content_pages_loan_image_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_loan_image_slots_image_idx\` ON \`site_content_pages_loan_image_slots\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_how_to_apply_text_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`text\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_how_to_apply_text_slots_order_idx\` ON \`site_content_pages_how_to_apply_text_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_how_to_apply_text_slots_parent_id_idx\` ON \`site_content_pages_how_to_apply_text_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_how_to_apply_image_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`image_id\` integer,
	\`fallback_src\` text,
	\`fallback_alt\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_how_to_apply_image_slots_order_idx\` ON \`site_content_pages_how_to_apply_image_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_how_to_apply_image_slots_parent_id_idx\` ON \`site_content_pages_how_to_apply_image_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_how_to_apply_image_slots_image_idx\` ON \`site_content_pages_how_to_apply_image_slots\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_contact_text_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`text\` text NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_contact_text_slots_order_idx\` ON \`site_content_pages_contact_text_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_contact_text_slots_parent_id_idx\` ON \`site_content_pages_contact_text_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content_pages_contact_image_slots\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`key\` text NOT NULL,
	\`label\` text NOT NULL,
	\`image_id\` integer,
	\`fallback_src\` text,
	\`fallback_alt\` text,
	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_content_pages_contact_image_slots_order_idx\` ON \`site_content_pages_contact_image_slots\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_contact_image_slots_parent_id_idx\` ON \`site_content_pages_contact_image_slots\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_content_pages_contact_image_slots_image_idx\` ON \`site_content_pages_contact_image_slots\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_content\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`updated_at\` text,
	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_home_text_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_home_image_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_about_text_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_about_image_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_loan_text_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_loan_image_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_how_to_apply_text_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_how_to_apply_image_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_contact_text_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content_pages_contact_image_slots\`;`)
  await db.run(sql`DROP TABLE \`site_content\`;`)
}
