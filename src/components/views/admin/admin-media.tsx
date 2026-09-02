'use client'

// Admin media library — images, GIFs and stickers used across the site.
// Add by URL, copy markdown snippets for the blog editor, delete.
import { useCallback, useEffect, useState } from 'react'
import {
  ImageIcon, Plus, Trash2, Loader2, Copy, Search, Sparkles, Sticker, Film, Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'

export interface MediaRow {
  id: string
  name: string
  url: string
  type: string
  alt: string | null
  createdAt: string
}

const TYPE_META: Record<string, { icon: typeof ImageIcon; label: string; cls: string }> = {
  image: { icon: ImageIcon, label: 'Image', cls: 'bg-primary/12 text-primary' },
  gif: { icon: Film, label: 'GIF', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  sticker: { icon: Sticker, label: 'Sticker', cls: 'bg-pink-500/15 text-pink-600 dark:text-pink-400' },
}

export default function AdminMedia() {
  const [media, setMedia] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<MediaRow | null>(null)
  const [form, setForm] = useState({ name: '', url: '', type: 'image', alt: '' })
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ media: MediaRow[] }>('/api/media')
      setMedia(res.media)
    } catch (err) {
      toast({ title: 'Failed to load', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', url: '', type: 'image', alt: '' })
    setOpen(true)
  }

  const openEdit = (m: MediaRow) => {
    setEditing(m)
    setForm({ name: m.name, url: m.url, type: m.type, alt: m.alt || '' })
    setOpen(true)
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      if (editing) {
        await api(`/api/media/${editing.id}`, { method: 'PATCH', body: form })
        toast({ title: 'Media updated', description: `${form.name} re-edited — new details are live.` })
      } else {
        await api('/api/media', { method: 'POST', body: form })
        toast({ title: 'Media added', description: `${form.name} is now in the library.` })
      }
      setOpen(false)
      setEditing(null)
      setForm({ name: '', url: '', type: 'image', alt: '' })
      load()
    } catch (err) {
      toast({ title: 'Could not save', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (m: MediaRow) => {
    try {
      await api(`/api/media/${m.id}`, { method: 'DELETE' })
      setMedia((prev) => prev.filter((x) => x.id !== m.id))
      toast({ title: 'Deleted', description: `${m.name} removed from the library.` })
    } catch (err) {
      toast({ title: 'Could not delete', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const copyMarkdown = (m: MediaRow) => {
    const alt = m.type === 'sticker' ? `sticker-${m.name.toLowerCase().replace(/\s+/g, '-')}` : (m.alt || m.name)
    const md = m.type === 'gif'
      ? `![${alt}](${m.url} "${m.name}")`
      : `![${alt}](${m.url})`
    navigator.clipboard?.writeText(md).catch(() => {})
    toast({ title: 'Markdown copied', description: 'Paste it straight into the blog editor.' })
  }

  const filtered = media.filter((m) =>
    (filter === 'all' || m.type === filter) &&
    (!query || m.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Media library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Images, GIFs and stickers for blog posts and product galleries — copy a markdown snippet to insert anywhere.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" /> Add media
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'image', 'gif', 'sticker'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === t ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={filter === t}
          >
            {t === 'all' ? `All (${media.length})` : `${TYPE_META[t]?.label}s (${media.filter((m) => m.type === t).length})`}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search media…" className="pl-9 h-9 w-44" aria-label="Search media" />
        </div>
      </div>

      {loading && media.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-video rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyView
          title="Library is empty"
          message="Add images, GIFs and stickers by URL — they become instantly insertable in the blog editor and product galleries."
          icon={<Sparkles className="size-7 text-muted-foreground" />}
          action={<Button size="sm" onClick={openCreate}><Plus className="size-4" /> Add media</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((m) => {
            const meta = TYPE_META[m.type] || TYPE_META.image
            const Icon = meta.icon
            return (
              <div key={m.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors">
                <div className="aspect-video relative bg-muted grid place-items-center overflow-hidden">
                  { }
                  <img src={m.url} alt={m.alt || m.name} loading="lazy" className="size-full object-contain p-2" />
                  <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.cls}`}>
                    <Icon className="size-3" aria-hidden /> {meta.label}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate" title={m.name}>{m.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5" title={m.url}>{m.url}</p>
                  <div className="flex gap-1.5 mt-2.5">
                    <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => copyMarkdown(m)}>
                      <Copy className="size-3" /> Markdown
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => openEdit(m)} aria-label={`Edit ${m.name}`}>
                      <Pencil className="size-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2 hover:border-destructive/50 hover:text-destructive" onClick={() => remove(m)} aria-label={`Delete ${m.name}`}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit — ${editing.name}` : 'Add media'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Re-edit the name, type, URL or alt text — changes apply everywhere it is used.'
                : <>Link an image, GIF or sticker by URL. Local paths like <code className="text-xs bg-muted px-1 rounded">/sticker-rocket.png</code> work too.</>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="media-type">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger id="media-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                    <SelectItem value="sticker">Sticker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="media-name">Name</Label>
                <Input id="media-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Rocket sticker" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="media-url">URL</Label>
              <Input id="media-url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://… or /image.png" disabled={Boolean(editing)} />
              {editing && <p className="text-[11px] text-muted-foreground">URL is fixed after creation (media already inserted keeps working).</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="media-alt">Alt text (optional)</Label>
              <Input id="media-alt" value={form.alt} onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))} placeholder="Describe the image for SEO + a11y" />
            </div>
            {form.url && (
              <div className="rounded-xl border border-border bg-muted h-36 grid place-items-center overflow-hidden">
                { }
                <img src={form.url} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving || !form.name || !form.url}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : editing ? <Pencil className="size-4" /> : <Plus className="size-4" />} {editing ? 'Save changes' : 'Add to library'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
