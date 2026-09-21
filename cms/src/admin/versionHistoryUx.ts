export type VersionInfo = {
  id?: number | string
  status?: string
  updatedAt?: string
}

export const CURRENT_LIVE_LABEL = 'Current live'
export const PREVIOUS_LIVE_LABEL = 'Previous live'
export const DRAFT_LABEL = 'Draft'
export const UNDO_HELPER_TEXT =
  'This restores the previous live version and creates a new published version. Your version history will not be deleted.'
export const RESTORE_HELPER_TEXT =
  'To return to an older snapshot, open that version and use Restore Version.'

function formatVersionDate(value?: string): string {
  if (!value) return 'Unknown'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function getVersionBadgeLabel({
  isCurrent,
  status,
}: {
  isCurrent: boolean
  status?: string
}): string {
  if (isCurrent) return CURRENT_LIVE_LABEL
  if (status === 'draft') return DRAFT_LABEL
  if (status === 'published') return PREVIOUS_LIVE_LABEL
  return status || 'Version'
}

export function getRestoreButtonLabel(version?: VersionInfo): string {
  return `Restore Version ${version?.id ?? ''}`.trim()
}

export function getVersionAgeLabel({
  currentVersion,
  version,
}: {
  currentVersion?: VersionInfo
  version?: VersionInfo
}): string {
  if (!version?.updatedAt || !currentVersion?.updatedAt) return 'Version timing unavailable'
  if (String(version.id) === String(currentVersion.id)) return 'Current live version'

  const selectedTime = new Date(version.updatedAt).getTime()
  const currentTime = new Date(currentVersion.updatedAt).getTime()
  if (!Number.isFinite(selectedTime) || !Number.isFinite(currentTime)) return 'Version timing unavailable'
  if (selectedTime > currentTime) return 'Newer than current live'
  return 'Older than current live'
}

export function buildVersionSummaryLines({
  currentVersion,
  isCurrent,
  version,
}: {
  currentVersion?: VersionInfo
  isCurrent: boolean
  version?: VersionInfo
}): string[] {
  return [
    `Version ${version?.id ?? 'Unknown'}`,
    getVersionBadgeLabel({ isCurrent, status: version?.status }),
    formatVersionDate(version?.updatedAt),
    getVersionAgeLabel({ currentVersion, version }),
  ]
}

export function buildRestoreConfirmationDetails({
  currentVersion,
  selectedVersion,
}: {
  currentVersion?: VersionInfo
  selectedVersion?: VersionInfo
}): string[] {
  const selectedLabel = getVersionBadgeLabel({
    isCurrent: Boolean(currentVersion?.id && selectedVersion?.id && String(currentVersion.id) === String(selectedVersion.id)),
    status: selectedVersion?.status,
  })
  const details = [
    `${getRestoreButtonLabel(selectedVersion)}?`,
    '',
    'Current live version:',
    `Version ${currentVersion?.id ?? 'Unknown'}`,
    '',
    'Selected version:',
    `Version ${selectedVersion?.id ?? 'Unknown'}`,
    '',
    'Updated:',
    formatVersionDate(selectedVersion?.updatedAt),
    '',
    'Status:',
    selectedLabel,
    '',
    'This will replace the current page content with the selected version.',
    'A new version will be created. Existing version history will not be deleted.',
  ]

  if (selectedVersion?.status === 'draft') {
    details.push(
      '',
      'You are restoring a draft version. The restored content will become the current content only after it is published.',
    )
  }

  return details
}

export function buildLegacyRestoreConfirmationDetails({
  currentVersion,
  selectedVersion,
}: {
  currentVersion?: VersionInfo
  selectedVersion?: VersionInfo
}): string[] {
  return [
    `Selected version ID: ${selectedVersion?.id ?? 'Unknown'}`,
    `Current version ID: ${currentVersion?.id ?? 'Unknown'}`,
    `Selected version date: ${selectedVersion?.updatedAt ?? 'Unknown'}`,
    `Selected version status: ${selectedVersion?.status ?? 'Unknown'}`,
    'Warning: all fields will match the selected snapshot.',
    'Version history will remain available.',
  ]
}

export function shouldDisableSelectedVersionRestore({
  currentVersion,
  selectedVersion,
}: {
  currentVersion?: VersionInfo
  selectedVersion?: VersionInfo
}): boolean {
  return Boolean(currentVersion?.id && selectedVersion?.id && String(currentVersion.id) === String(selectedVersion.id))
}
