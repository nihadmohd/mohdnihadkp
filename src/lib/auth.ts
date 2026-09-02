// ─────────────────────────────────────────────────────────────
// Auth: scrypt password hashing + HS256 JWT sessions (httpOnly cookie)
// No external deps — uses Node crypto only.
// ─────────────────────────────────────────────────────────────
import crypto from 'crypto'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db'

const SECRET =
  process.env.AUTH_SECRET || 'nihad-kp-dev-secret-change-me-in-production-please'
export const SESSION_COOKIE = 'nihad_session'
const SESSION_DAYS = 7

// ── Password hashing (scrypt) ────────────────────────────────
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    if (!salt || !hash) return false
    const test = crypto.scryptSync(password, salt, 64)
    const orig = Buffer.from(hash, 'hex')
    return orig.length === test.length && crypto.timingSafeEqual(orig, test)
  } catch {
    return false
  }
}

// ── JWT (HS256) ──────────────────────────────────────────────
const b64url = (buf: Buffer | string) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const b64urlJson = (obj: unknown) => b64url(JSON.stringify(obj))

function fromB64url(str: string): string {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString()
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

export function signJwt(payload: { sub: string; email: string; role: string }, days = SESSION_DAYS): string {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + days * 24 * 3600
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' })
  const body = b64urlJson({ ...payload, iat, exp })
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest())
  return `${header}.${body}.${sig}`
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const [header, body, sig] = token.split('.')
    if (!header || !body || !sig) return null
    const expected = b64url(
      crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest()
    )
    if (expected.length !== sig.length) return null
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null
    const payload = JSON.parse(fromB64url(body)) as JwtPayload
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// ── Tokens (email verify / password reset) ───────────────────
export function createToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// ── Session helpers (server-only) ────────────────────────────
export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: string
  image: string | null
  emailVerified: Date | null
  onboarded: boolean
  plan: string
  planRenewsAt?: Date | null
  banned: boolean
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verifyJwt(token)
  if (!payload) return null
  const user = await db.user.findUnique({ where: { id: payload.sub } })
  if (!user || user.banned) return null
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
    emailVerified: user.emailVerified,
    onboarded: user.onboarded,
    plan: user.plan,
    planRenewsAt: user.planRenewsAt,
    banned: user.banned,
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies()
  // Detect HTTPS via the gateway's forwarded proto header.
  const hdrs = await headers()
  const proto = (hdrs.get('x-forwarded-proto') || 'http').split(',')[0].trim()
  const isHttps = proto === 'https'
  // IMPORTANT: when the site is viewed inside an embedded webview/iframe
  // (e.g. IM preview panels), browsers reject SameSite=Lax cookies entirely,
  // which breaks the session right after login ("session expired").
  // SameSite=None (requires Secure) works in BOTH embedded and top-level
  // contexts over HTTPS, so we use it whenever we are on HTTPS.
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    maxAge: SESSION_DAYS * 24 * 3600,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  const hdrs = await headers()
  const isHttps = (hdrs.get('x-forwarded-proto') || 'http').split(',')[0].trim() === 'https'
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: isHttps ? 'none' : 'lax',
    secure: isHttps,
    maxAge: 0,
    path: '/',
  })
}

// ── Guard helpers for API routes ─────────────────────────────
export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) throw new HttpError(401, 'Authentication required')
  return session
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireUser()
  if (session.role !== 'ADMIN') throw new HttpError(403, 'Admin access required')
  return session
}

// ── Simple in-memory rate limiter (per IP+action) ─────────────
const attempts = new Map<string, { count: number; resetAt: number }>()
export function rateLimit(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count++
  if (entry.count > max) return false
  return true
}

// ── Helpers ──────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90) || `item-${Date.now().toString(36)}`
}

export function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
