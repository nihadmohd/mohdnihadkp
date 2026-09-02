'use client'

// GDPR-style cookie consent banner + preferences, remembers choice in localStorage
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Consent {
  functional: boolean
  analytics: boolean
  marketing: boolean
  ts?: string
}

const KEY = 'cookie-consent'

function loadConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Consent) : null
  } catch {
    return null
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState<Consent>({ functional: true, analytics: true, marketing: false })

  useEffect(() => {
    const t = setTimeout(() => {
      const existing = loadConsent()
      if (!existing) {
        // Slight entrance delay so the page settles first
        setTimeout(() => setVisible(true), 1100)
      } else {
        setPrefs({ ...existing, marketing: existing.marketing || false })
      }
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const save = (consent: Consent) => {
    localStorage.setItem(KEY, JSON.stringify({ ...consent, ts: new Date().toISOString() }))
    setVisible(false)
    setExpanded(false)
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: consent }))
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-x-3 bottom-3 lg:inset-x-auto lg:left-4 lg:bottom-4 lg:max-w-md z-50"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="glass border border-border rounded-2xl p-5 shadow-2xl shadow-black/20">
        <div className="flex items-start gap-3">
          <span className="grid place-items-center size-9 rounded-xl bg-primary/15 text-primary shrink-0" aria-hidden>
            <Cookie className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm">Cookies, cleared with consent</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              I use necessary cookies for sign-in, and optional ones to remember preferences and
              count visits. Your call — nothing optional runs until you say yes.
            </p>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
            <ConsentRow
              id="cc-necessary"
              label="Strictly necessary"
              desc="Sign-in sessions, security. Always on."
              checked
              disabled
            />
            <ConsentRow
              id="cc-functional"
              label="Functional"
              desc="Theme memory, live-visitor session ID."
              checked={prefs.functional}
              onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
            />
            <ConsentRow
              id="cc-analytics"
              label="Analytics"
              desc="Pseudonymised page-view counts to improve content."
              checked={prefs.analytics}
              onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
            />
            <ConsentRow
              id="cc-marketing"
              label="Marketing"
              desc="Not used yet. Off by default."
              checked={prefs.marketing}
              onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
            />
            <Link
              href="/legal/cookie-policy"
              onClick={() => setVisible(false)}
              className="inline-block text-xs text-primary hover:underline"
            >
              Read the full Cookie Policy →
            </Link>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {expanded ? (
            <>
              <Button size="sm" className="flex-1" onClick={() => save(prefs)}>
                Save preferences
              </Button>
              <Button size="sm" variant="outline" onClick={() => save({ functional: true, analytics: true, marketing: false })}>
                Accept all
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" className="flex-1" onClick={() => save({ functional: true, analytics: true, marketing: false })}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => save({ functional: true, analytics: false, marketing: false })}>
                Essential only
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setExpanded(true)}>
                Customize
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ConsentRow({
  id, label, desc, checked, disabled, onChange,
}: {
  id: string
  label: string
  desc: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label={`${label} cookies`}
      />
    </div>
  )
}

// ── Standalone preferences panel (used on the Cookie Preferences legal page) ──
export function CookiePreferencesPanel() {
  const [prefs, setPrefs] = useState<Consent>({ functional: true, analytics: true, marketing: false })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const existing = loadConsent()
      if (existing) setPrefs({ functional: true, analytics: existing.analytics, marketing: existing.marketing })
    }, 0)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <ConsentRow id="cp-necessary" label="Strictly necessary (always on)" desc="Login sessions, security, consent memory." checked disabled />
      <ConsentRow
        id="cp-functional" label="Functional" desc="Theme memory, live-visitor ID."
        checked={prefs.functional} onChange={(v) => setPrefs((p) => ({ ...p, functional: v }))}
      />
      <ConsentRow
        id="cp-analytics" label="Analytics" desc="Pseudonymised page-view counts."
        checked={prefs.analytics} onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
      />
      <ConsentRow
        id="cp-marketing" label="Marketing (unused)" desc="Reserved for the future; stays off."
        checked={prefs.marketing} onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
      />
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => {
            localStorage.setItem(KEY, JSON.stringify({ ...prefs, ts: new Date().toISOString() }))
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
            window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: prefs }))
          }}
        >
          {saved ? 'Saved ✓' : 'Save preferences'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setPrefs({ functional: true, analytics: true, marketing: false })}
        >
          Reset to recommended
        </Button>
      </div>
    </div>
  )
}
