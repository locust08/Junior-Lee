import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { migrations } from '../src/migrations'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const migrationsDirectory = path.resolve(testDirectory, '../src/migrations')
const legacyMigrationName = '20260713_014914'
const globalTables = [
  'site_settings',
  'home_page',
  'about_us_page',
  'loan_page',
  'how_to_apply_page',
  'contact_us_page',
]

describe('Payload migration schema', () => {
  it('adds a forward migration for all six Globals and their draft/version tables', () => {
    const migrationNames = migrations.map((migration) => migration.name)
    const sixGlobalsMigrationName = '20260713_134849_payload_six_globals'

    expect(migrationNames).toContain(legacyMigrationName)
    expect(migrationNames).toContain(sixGlobalsMigrationName)

    const migrationSource = fs.readFileSync(
      path.join(migrationsDirectory, `${sixGlobalsMigrationName}.ts`),
      'utf8',
    )
    const normalizedMigrationSource = migrationSource.replaceAll('\\`', '`')
    const snapshot = JSON.parse(
      fs.readFileSync(path.join(migrationsDirectory, `${sixGlobalsMigrationName}.json`), 'utf8'),
    ) as { tables?: Record<string, unknown> }

    for (const table of globalTables) {
      expect(normalizedMigrationSource).toContain('CREATE TABLE `' + table + '`')
      expect(normalizedMigrationSource).toContain('CREATE TABLE `_' + table + '_v`')
      expect(snapshot.tables).toHaveProperty(table)
      expect(snapshot.tables).toHaveProperty(`_${table}_v`)
    }
  })

  it('adds the approved Metro frontend fields in a forward-only additive migration', () => {
    const latestMigrationName = migrations.at(-1)?.name
    expect(latestMigrationName).toBe('20260717_021900_approved_metro_frontend_schema')

    const migrationSource = fs.readFileSync(
      path.join(migrationsDirectory, `${latestMigrationName}.ts`),
      'utf8',
    )
    const upSource = migrationSource.split('export async function down')[0].replaceAll('\\`', '`')

    for (const column of [
      'footer_brand_description',
      'footer_quick_links_column_heading',
      'footer_loan_information_column_heading',
      'hero_primary_button_label',
      'ready_to_get_started_whatsapp_button_label',
      'required_documents_heading',
      'required_documents_description',
      'contact_methods_phone_description',
      'still_have_questions_description',
    ]) {
      expect(upSource).toContain('ADD COLUMN `' + column + '`')
    }

    expect(upSource).toContain('CREATE TABLE `about_us_page_who_we_are_highlights`')
    expect(upSource).toContain('CREATE TABLE `_about_us_page_v_version_who_we_are_highlights`')
    expect(upSource).not.toMatch(/DROP TABLE/)
  })

  it('does not delete legacy slot content during the forward migration', () => {
    const latestMigrationName = migrations.at(-1)?.name
    expect(latestMigrationName).not.toBe(legacyMigrationName)

    const migrationSource = fs.readFileSync(
      path.join(migrationsDirectory, `${latestMigrationName}.ts`),
      'utf8',
    )
    const upSource = migrationSource.split('export async function down')[0]

    expect(upSource).not.toMatch(/DROP TABLE [`\\]site_content/)
    expect(upSource).not.toMatch(/DROP TABLE [`\\]site_content_pages_.*_slots/)
  })
})
