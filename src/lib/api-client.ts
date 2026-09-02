'use client'

// ─────────────────────────────────────────────────────────────
// API client — fetch wrapper with auth + session-expiry events
// ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const SESSION_EXPIRED_EVENT = 'nihad:session-expired'

// Marker so we only show the "session expired" modal when the visitor
// actually HAD a session (not for anonymous visitors hitting protected URLs).
const HAD_SESSION_KEY = 'nihad_had_session'
export function markHasSession() {
  try { localStorage.setItem(HAD_SESSION_KEY, '1') } catch { /* private mode */ }
}
function clearHadSession() {
  try { localStorage.removeItem(HAD_SESSION_KEY) } catch { /* private mode */ }
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  const { method = 'GET', body, signal } = options
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  })

  let data: Record<string, unknown> = {}
  try {
    data = await res.json()
  } catch {
    /* non-json */
  }

  if (!res.ok) {
    if (res.status === 401) {
      // Only surface the expiry modal if a session existed before this request.
      let hadSession = false
      try { hadSession = localStorage.getItem(HAD_SESSION_KEY) === '1' } catch { /* noop */ }
      if (hadSession) {
        clearHadSession()
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
      }
    }
    throw new ApiError(res.status, (data.error as string) || `Request failed (${res.status})`)
  }
  return data as T
}

// ── Global session-expired event typing ─────────────────────
declare global {
  interface WindowEventMap {
    [SESSION_EXPIRED_EVENT]: CustomEvent
  }
}
