import { describe, expect, it } from 'vitest'

import {
  buildRestoreConfirmationDetails,
  buildVersionSummaryLines,
  CURRENT_LIVE_LABEL,
  DRAFT_LABEL,
  getVersionBadgeLabel,
  getRestoreButtonLabel,
  getVersionAgeLabel,
  PREVIOUS_LIVE_LABEL,
  RESTORE_HELPER_TEXT,
  shouldDisableSelectedVersionRestore,
  UNDO_HELPER_TEXT,
} from '../src/admin/versionHistoryUx'

describe('Payload version history UX helpers', () => {
  it('explains when to use undo latest versus selected snapshot restore', () => {
    expect(UNDO_HELPER_TEXT).toContain('This restores the previous live version')
    expect(UNDO_HELPER_TEXT).toContain('creates a new published version')
    expect(UNDO_HELPER_TEXT).toContain('version history will not be deleted')
    expect(RESTORE_HELPER_TEXT).toContain('To return to an older snapshot')
    expect(RESTORE_HELPER_TEXT).toContain('Restore Version')
  })

  it('builds confirmation details with selected and current version metadata', () => {
    const details = buildRestoreConfirmationDetails({
      currentVersion: { id: 42 },
      selectedVersion: {
        id: 41,
        status: 'published',
        updatedAt: '2026-07-14T15:30:00.000Z',
      },
    })

    expect(details).toEqual(expect.arrayContaining([
      'Restore Version 41?',
      'Current live version:',
      'Version 42',
      'Selected version:',
      'Version 41',
      'Status:',
      PREVIOUS_LIVE_LABEL,
      'This will replace the current page content with the selected version.',
      'A new version will be created. Existing version history will not be deleted.',
    ]))
  })

  it('adds a stronger warning when restoring a draft version', () => {
    const details = buildRestoreConfirmationDetails({
      currentVersion: { id: 42 },
      selectedVersion: { id: 40, status: 'draft', updatedAt: '2026-07-14T11:00:00.000Z' },
    })

    expect(details).toContain(DRAFT_LABEL)
    expect(details).toContain('You are restoring a draft version. The restored content will become the current content only after it is published.')
  })

  it('disables selected snapshot restore when viewing the current version', () => {
    expect(shouldDisableSelectedVersionRestore({
      currentVersion: { id: 42 },
      selectedVersion: { id: 42 },
    })).toBe(true)

    expect(shouldDisableSelectedVersionRestore({
      currentVersion: { id: 42 },
      selectedVersion: { id: 41 },
    })).toBe(false)
  })

  it('uses clear version badge labels', () => {
    expect(getVersionBadgeLabel({ isCurrent: true, status: 'published' })).toBe(CURRENT_LIVE_LABEL)
    expect(getVersionBadgeLabel({ isCurrent: false, status: 'draft' })).toBe(DRAFT_LABEL)
    expect(getVersionBadgeLabel({ isCurrent: false, status: 'published' })).toBe(PREVIOUS_LIVE_LABEL)
  })

  it('labels the selected restore button with the version ID', () => {
    expect(getRestoreButtonLabel({ id: 15 })).toBe('Restore Version 15')
  })

  it('shows whether versions are older or newer than the current live version', () => {
    const currentVersion = { id: 17, updatedAt: '2026-07-19T14:42:00.000Z' }

    expect(getVersionAgeLabel({
      currentVersion,
      version: currentVersion,
    })).toBe('Current live version')
    expect(getVersionAgeLabel({
      currentVersion,
      version: { id: 16, updatedAt: '2026-07-19T14:25:00.000Z' },
    })).toBe('Older than current live')
    expect(getVersionAgeLabel({
      currentVersion,
      version: { id: 18, updatedAt: '2026-07-19T14:55:00.000Z' },
    })).toBe('Newer than current live')
  })

  it('builds readable version row summaries', () => {
    const lines = buildVersionSummaryLines({
      currentVersion: { id: 17, updatedAt: '2026-07-19T14:42:00.000Z' },
      isCurrent: false,
      version: { id: 16, status: 'published', updatedAt: '2026-07-19T14:25:00.000Z' },
    })

    expect(lines[0]).toBe('Version 16')
    expect(lines[1]).toBe(PREVIOUS_LIVE_LABEL)
    expect(lines[3]).toBe('Older than current live')
  })
})
