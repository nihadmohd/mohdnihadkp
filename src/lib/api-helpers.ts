// Shared API route helpers
import { NextResponse } from 'next/server'
import { HttpError } from '@/lib/auth'

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as Record<string, unknown>, init)
}

export function fail(status: number, message: string) {
  return NextResponse.json({ error: message }, { status })
}

export function handleError(err: unknown) {
  if (err instanceof HttpError) return fail(err.status, err.message)
  console.error('[api]', err)
  return fail(500, 'Something went wrong on the server. Please try again.')
}

export function badRequest(message: string) {
  return fail(400, message)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email)
}

export function parseIntParam(value: string | null, fallback: number): number {
  const n = parseInt(value || '', 10)
  return Number.isFinite(n) ? n : fallback
}
