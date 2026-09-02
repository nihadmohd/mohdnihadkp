// ─────────────────────────────────────────────────────────────
// Server-side emitter — lets API routes push instant admin alerts
// Fire-and-forget POST to the realtime service's internal endpoint
// ─────────────────────────────────────────────────────────────

const INTERNAL_URL = 'http://127.0.0.1:3004/emit'
const SECRET = process.env.INTERNAL_SECRET || 'nihad-internal-emit-secret-change-me'

export function emitAdminAlert(event: string, message: string): void {
  fetch(INTERNAL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: SECRET, event, message }),
  }).catch(() => {
    /* realtime service down — alerts are best-effort */
  })
}
