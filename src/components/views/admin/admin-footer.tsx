'use client'

// Admin footer — edit the site footer navigation sections.
// Changes are live on the public footer immediately.
import { useCallback, useEffect, useState } from 'react'
import {
  Plus, Trash2, Loader2, PanelBottom, ArrowUp, ArrowDown, Power, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

interface FooterLinkRow {
  id: string
  section: string
  label: string
  url: string
  active: boolean
  sortOrder: number
}

const SECTIONS = [
  { value: 'main', label: 'Main — brand column' },
  { value: 'explore', label: 'Explore' },
  { value: 'ventures', label: 'Ventures' },
  { value: 'legal', label: 'Legal' },
]

export default function AdminFooter() {
  const [links, setLinks] = useState<FooterLinkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ label: '', url: '', section: 'explore' })
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ links: FooterLinkRow[] }>('/api/footer?admin=true')
      setLinks(res.links)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      await api('/api/footer', {
        method: 'POST',
        body: { ...form, sortOrder: links.filter((l) => l.section === form.section).length + 1 },
      })
      toast({ title: 'Link added', description: 'The public footer updates instantly.' })
      setOpen(false)
      setForm({ label: '', url: '', section: 'explore' })
      load()
    } catch (err) {
      toast({ title: 'Could not save', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const patch = async (link: FooterLinkRow, data: Partial<FooterLinkRow>) => {
    try {
      await api(`/api/footer/${link.id}`, { method: 'PATCH', body: data })
      setLinks((prev) => prev.map((x) => (x.id === link.id ? { ...x, ...data } : x)))
    } catch (err) {
      toast({ title: 'Could not update', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const remove = async (link: FooterLinkRow) => {
    try {
      await api(`/api/footer/${link.id}`, { method: 'DELETE' })
      setLinks((prev) => prev.filter((x) => x.id !== link.id))
      toast({ title: 'Link removed', description: `${link.label} is gone from the footer.` })
    } catch (err) {
      toast({ title: 'Could not delete', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const move = async (section: string, index: number, dir: -1 | 1) => {
    const sectionLinks = links.filter((l) => l.section === section)
    const next = sectionLinks[index + dir]
    if (!next) return
    const a = sectionLinks[index]
    const updated = [...links]
    updated[updated.indexOf(a)] = next
    updated[updated.indexOf(next)] = a
    setLinks(updated)
    try {
      await Promise.all([
        api(`/api/footer/${a.id}`, { method: 'PATCH', body: { sortOrder: next.sortOrder } }),
        api(`/api/footer/${next.id}`, { method: 'PATCH', body: { sortOrder: a.sortOrder } }),
      ])
    } catch { load() }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Footer editor</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control every link in the public footer — sections, labels, order and visibility. Changes go live instantly.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add link
        </Button>
      </div>

      {loading && links.length === 0 ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : links.length === 0 ? (
        <EmptyView
          title="No footer links"
          message="Add links to build the footer navigation. The brand, newsletter and socials stay automatic."
          icon={<PanelBottom className="size-7 text-muted-foreground" />}
          action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" /> Add link</Button>}
        />
      ) : (
        <div className="space-y-5">
          {SECTIONS.map((section) => {
            const sectionLinks = links.filter((l) => l.section === section.value)
            if (sectionLinks.length === 0) return null
            return (
              <div key={section.value} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.label}</p>
                  <Badge variant="secondary" className="text-[10px]">{sectionLinks.length} links</Badge>
                </div>
                <ul className="divide-y divide-border/40">
                  {sectionLinks.map((l, i) => (
                    <li key={l.id} className={`flex items-center gap-3 p-3 ${!l.active ? 'opacity-50' : ''}`}>
                      <div className="min-w-0 flex-1 flex items-center gap-2.5">
                        <span className="text-sm font-medium truncate">{l.label}</span>
                        <span className="text-[11px] text-muted-foreground truncate inline-flex items-center gap-1">
                          {l.url ? (
                            /^https?:\/\//.test(l.url) ? (
                              <><ExternalLink className="size-3 shrink-0" aria-hidden /> {l.url}</>
                            ) : l.url
                          ) : (
                            <em className="text-muted-foreground/60">no destination</em>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="hidden sm:flex flex-col">
                          <button onClick={() => move(section.value, i, -1)} disabled={i === 0} className="grid place-items-center size-5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move up">
                            <ArrowUp className="size-3" />
                          </button>
                          <button onClick={() => move(section.value, i, 1)} disabled={i === sectionLinks.length - 1} className="grid place-items-center size-5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move down">
                            <ArrowDown className="size-3" />
                          </button>
                        </div>
                        <Switch checked={l.active} onCheckedChange={(v) => patch(l, { active: v })} aria-label={`Toggle ${l.label}`} />
                        <Button size="sm" variant="outline" className="h-7 px-2 hover:border-destructive/50 hover:text-destructive" onClick={() => remove(l)} aria-label="Delete">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add footer link</DialogTitle>
            <DialogDescription>Internal paths (e.g. <code className="text-xs bg-muted px-1 rounded">/blog</code>) navigate in-page; https links open in a new tab.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fl-section">Section</Label>
              <Select value={form.section} onValueChange={(v) => setForm((f) => ({ ...f, section: v }))}>
                <SelectTrigger id="fl-section"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fl-label">Label *</Label>
              <Input id="fl-label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Instagram" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fl-url">URL</Label>
              <Input id="fl-url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="/store or https://…" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving || !form.label}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
