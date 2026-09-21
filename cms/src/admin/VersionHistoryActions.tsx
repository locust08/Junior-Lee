'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import {
  buildRestoreConfirmationDetails,
  buildVersionSummaryLines,
  getVersionBadgeLabel,
  getRestoreButtonLabel,
  RESTORE_HELPER_TEXT,
  UNDO_HELPER_TEXT,
  shouldDisableSelectedVersionRestore,
  type VersionInfo,
} from './versionHistoryUx'

type VersionActionInfo = {
  currentVersion?: VersionInfo
  isCurrentVersion?: boolean
  restoredFromVersion?: VersionInfo
  selectedVersion?: VersionInfo
  warnings?: string[]
}

type VersionListResponse = {
  docs?: Array<VersionInfo & {
    version?: { _status?: string }
    version__status?: string
  }>
}

type ConfirmationState =
  | { action: 'restore'; info: VersionActionInfo }
  | { action: 'undo'; info: VersionActionInfo }
  | null

function getGlobalSlugFromPath(pathname: string): string | undefined {
  return pathname.match(/\/admin\/globals\/([^/?#]+)/)?.[1]
}

function getSelectedVersionIdFromPath(pathname: string): string | undefined {
  return pathname.match(/\/versions\/([^/?#]+)/)?.[1]
}

async function fetchJson<TData = unknown>(url: string, init?: RequestInit): Promise<TData> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  const data = await response.json().catch(() => ({})) as {
    errors?: Array<{ message?: string }>
    message?: string
  }
  if (!response.ok) {
    const message = data?.errors?.[0]?.message || data?.message || 'Request failed.'
    throw new Error(message)
  }
  return data as TData
}

function normalizeVersionList(response: VersionListResponse): VersionInfo[] {
  return (response.docs || []).map((doc) => ({
    id: doc.id,
    status: doc.status ?? doc.version?._status ?? doc.version__status,
    updatedAt: doc.updatedAt,
  })).filter((version) => version.id)
}

function replaceTextInElement(root: Node, replacements: Record<string, string>) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

  while (walker.nextNode()) {
    const node = walker.currentNode
    const trimmed = node.textContent?.trim()
    if (trimmed && replacements[trimmed]) {
      node.textContent = node.textContent?.replace(trimmed, replacements[trimmed]) ?? replacements[trimmed]
    }
  }
}

export default function VersionHistoryActions() {
  const [selectedInfo, setSelectedInfo] = useState<VersionActionInfo | null>(null)
  const [undoInfo, setUndoInfo] = useState<VersionActionInfo | null>(null)
  const [versionList, setVersionList] = useState<VersionInfo[]>([])
  const [versionFilter, setVersionFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null)
  const [message, setMessage] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null)

  const pathname = typeof window === 'undefined' ? '' : window.location.pathname
  const globalSlug = useMemo(() => getGlobalSlugFromPath(pathname), [pathname])
  const selectedVersionId = useMemo(() => getSelectedVersionIdFromPath(pathname), [pathname])
  const baseUrl = globalSlug ? `/api/globals/${globalSlug}` : undefined

  useEffect(() => {
    if (!baseUrl) return

    fetchJson<VersionActionInfo>(`${baseUrl}/undo-latest-published-change`)
      .then(setUndoInfo)
      .catch(() => setUndoInfo(null))

    fetchJson<VersionListResponse>(`${baseUrl}/versions?limit=100&sort=-updatedAt`)
      .then((response) => setVersionList(normalizeVersionList(response)))
      .catch(() => setVersionList([]))

    if (selectedVersionId) {
      fetchJson<VersionActionInfo>(`${baseUrl}/versions/${selectedVersionId}/restore-info`)
        .then(setSelectedInfo)
        .catch(() => setSelectedInfo(null))
    }
  }, [baseUrl, selectedVersionId])

  useEffect(() => {
    if (confirmation) confirmButtonRef.current?.focus()
  }, [confirmation])

  useEffect(() => {
    if (!selectedInfo) return

    const nativeButtons = Array.from(document.querySelectorAll('button'))
      .filter((button) => button.textContent?.trim() === 'Restore this version')

    nativeButtons.forEach((button) => {
      button.textContent = getRestoreButtonLabel(selectedInfo.selectedVersion)
      button.setAttribute('aria-hidden', 'true')
      button.setAttribute('data-version-history-native-restore', 'hidden')
      button.setAttribute('disabled', 'true')
      button.setAttribute('tabindex', '-1')
      button.style.display = 'none'
    })
  }, [selectedInfo])

  useEffect(() => {
    replaceTextInElement(document.body, {
      'Currently Published': 'Current live',
      'Previously Published': 'Previous live',
      'Comparing against': 'Older comparison version',
      'Currently viewing': 'Selected version',
    })
  }, [pathname, selectedInfo, versionList])

  if (!baseUrl) return null

  const isVersionPage = Boolean(selectedVersionId)
  const isComparePage = pathname.includes('/compare')
  const selectedRestoreDisabled = selectedInfo
    ? shouldDisableSelectedVersionRestore({
      currentVersion: selectedInfo.currentVersion,
      selectedVersion: selectedInfo.selectedVersion,
    })
    : true
  const visibleVersions = versionList.filter((version) => {
    if (versionFilter === 'all') return true
    return version.status === versionFilter
  })

  async function undoLatest() {
    if (!baseUrl || !undoInfo?.currentVersion || !undoInfo.restoredFromVersion) return
    setConfirmation({ action: 'undo', info: undoInfo })
  }

  async function confirmUndoLatest(info: VersionActionInfo) {
    if (!baseUrl || !info.currentVersion || !info.restoredFromVersion) return

    setIsBusy(true)
    setMessage('')
    try {
      await fetchJson(`${baseUrl}/undo-latest-published-change`, { method: 'POST' })
      setMessage('Undo restored the previous live version. The Preview rebuild has been triggered once.')
      window.location.reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Undo failed.')
    } finally {
      setIsBusy(false)
    }
  }

  async function restoreSelected() {
    if (!baseUrl || !selectedVersionId || !selectedInfo?.selectedVersion) return
    setConfirmation({ action: 'restore', info: selectedInfo })
  }

  async function confirmRestoreSelected(info: VersionActionInfo) {
    if (!baseUrl || !selectedVersionId || !info.selectedVersion) return

    setIsBusy(true)
    setMessage('')
    try {
      await fetchJson(`${baseUrl}/versions/${selectedVersionId}`, { method: 'POST' })
      const deployCopy = info.selectedVersion.status === 'draft'
        ? 'No Preview rebuild is triggered until the restored draft is published.'
        : 'The Preview rebuild has been triggered once.'
      setMessage(`Version ${info.selectedVersion.id} has been restored. ${deployCopy}`)
      window.location.href = `/admin/globals/${globalSlug}`
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Restore failed.')
    } finally {
      setIsBusy(false)
    }
  }

  const modalVersion = confirmation?.action === 'undo'
    ? confirmation.info.restoredFromVersion
    : confirmation?.info.selectedVersion
  const modalDetails = confirmation ? buildRestoreConfirmationDetails({
    currentVersion: confirmation.info.currentVersion,
    selectedVersion: modalVersion,
  }) : []

  return (
    <div style={{
      border: '1px solid var(--theme-elevation-200)',
      borderRadius: 4,
      marginBottom: 16,
      padding: 12,
    }}>
      <p style={{ margin: '0 0 10px' }}>{RESTORE_HELPER_TEXT}</p>
      {undoInfo?.currentVersion && undoInfo.restoredFromVersion ? (
        <div style={{ marginBottom: 12 }}>
          <button disabled={isBusy} onClick={undoLatest} type="button">
            Undo latest published change
          </button>
          <p style={{ margin: '8px 0 0' }}>{UNDO_HELPER_TEXT}</p>
          <p style={{ margin: '6px 0 0' }}>
            Current live version: Version {undoInfo.currentVersion.id}. Restore target: Version {undoInfo.restoredFromVersion.id}.
          </p>
        </div>
      ) : null}
      {versionList.length ? (
        <div style={{ marginTop: 12 }}>
          {isComparePage && undoInfo?.currentVersion ? (
            <p style={{ margin: '0 0 8px' }}>
              Current live version: {undoInfo.currentVersion.id}
            </p>
          ) : null}
          <div aria-label="Version filters" role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {([
              ['all', 'All versions'],
              ['published', 'Published history'],
              ['draft', 'Drafts'],
            ] as const).map(([value, label]) => (
              <button
                aria-selected={versionFilter === value}
                key={value}
                onClick={() => setVersionFilter(value)}
                role="tab"
                style={{
                  border: '1px solid var(--theme-elevation-200)',
                  borderRadius: 999,
                  padding: '6px 10px',
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <ol style={{
            display: 'grid',
            gap: 8,
            listStyle: 'none',
            margin: 0,
            maxWidth: 720,
            padding: 0,
          }}>
            {visibleVersions.slice(0, 8).map((version) => {
              const isCurrent = Boolean(undoInfo?.currentVersion?.id && String(undoInfo.currentVersion.id) === String(version.id))
              const lines = buildVersionSummaryLines({
                currentVersion: undoInfo?.currentVersion,
                isCurrent,
                version,
              })

              return (
                <li
                  key={String(version.id)}
                  style={{
                    background: isCurrent ? 'var(--theme-success-50, #eefbf3)' : 'var(--theme-elevation-50)',
                    border: `1px solid ${isCurrent ? 'var(--theme-success-150, #9ee6b5)' : 'var(--theme-elevation-150)'}`,
                    borderRadius: 6,
                    padding: 10,
                  }}
                >
                  <strong>{lines[0]}</strong>
                  <span style={{ display: 'block' }}>{lines[1]}</span>
                  <span style={{ display: 'block' }}>{lines[2]}</span>
                  <span style={{ display: 'block' }}>{lines[3]}</span>
                </li>
              )
            })}
          </ol>
          {isComparePage ? (
            <p style={{ margin: '8px 0 0' }}>
              Only fields that differ between these two versions are shown when Modified only is enabled.
            </p>
          ) : null}
        </div>
      ) : null}
      {isVersionPage && selectedInfo?.selectedVersion ? (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: '0 0 8px' }}>
            You are viewing:{' '}
            <strong>Version {selectedInfo.selectedVersion.id} - {getVersionBadgeLabel({
              isCurrent: Boolean(selectedInfo.isCurrentVersion),
              status: selectedInfo.selectedVersion.status,
            })}</strong>
          </p>
          <p style={{ margin: '0 0 8px' }}>
            Current live version: Version {selectedInfo.currentVersion?.id ?? 'Unknown'}
          </p>
          {selectedInfo.selectedVersion.status === 'draft' ? (
            <p style={{ color: 'var(--theme-error-750)', margin: '0 0 8px' }}>
              You are restoring a draft version. The restored content will become the current content only after it is published.
            </p>
          ) : null}
          {!selectedRestoreDisabled ? (
            <button disabled={isBusy} onClick={restoreSelected} type="button">
              {getRestoreButtonLabel(selectedInfo.selectedVersion)}
            </button>
          ) : null}
        </div>
      ) : null}
      {message ? <p style={{ margin: '10px 0 0' }}>{message}</p> : null}
      {confirmation ? (
        <div
          aria-modal="true"
          role="dialog"
          style={{
            background: 'var(--theme-bg)',
            border: '1px solid var(--theme-elevation-250)',
            borderRadius: 6,
            boxShadow: '0 18px 60px rgba(0, 0, 0, .18)',
            left: '50%',
            maxWidth: 560,
            padding: 20,
            position: 'fixed',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100vw - 32px)',
            zIndex: 1000,
          }}
        >
          <h2 style={{ marginTop: 0 }}>{modalDetails[0]}</h2>
          <div style={{ whiteSpace: 'pre-line' }}>
            {modalDetails.slice(2).join('\n')}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button disabled={isBusy} onClick={() => setConfirmation(null)} type="button">
              Cancel
            </button>
            <button
              disabled={isBusy}
              onClick={() => {
                const activeConfirmation = confirmation
                setConfirmation(null)
                if (activeConfirmation.action === 'undo') {
                  void confirmUndoLatest(activeConfirmation.info)
                } else {
                  void confirmRestoreSelected(activeConfirmation.info)
                }
              }}
              ref={confirmButtonRef}
              type="button"
            >
              {getRestoreButtonLabel(modalVersion)}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
