'use client'

// Admin posts — list + full editor (markdown, SEO fields, cover, tags, publish)
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Star, Search, ArrowLeft, Save,
  FileText, Check, X, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Markdown } from '@/components/markdown'
import { api } from '@/lib/api-client'
import { navigate } from '@/hooks/use-hash-router'
import { useToast } from '@/hooks/use-toast'
import { EmptyView } from '@/components/views/states'
import type { MediaRow } from '@/components/views/admin/admin-media'

interface PostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  tags: string
  category: string | null
  published: boolean
  featured: boolean
  views: number
  readingMinutes: number
  seoTitle: string | null
  seoDescription: string | null
  updatedAt: string
}

export default function AdminPosts({ editId }: { editId?: string }) {
  const [posts, setPosts] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<PostRow | null>(null)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api<{ posts: PostRow[] }>('/api/posts?admin=true&limit=50')
      setPosts(res.posts)
    } catch (err) {
      toast({ title: 'Failed to load posts', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  // Open editor for ?new=1 or existing id via /admin/posts/new or /admin/posts/:id
  useEffect(() => {
    if (editId === 'new') setCreating(true)
    else if (editId) {
      openEditorById(editId)
    }
  }, [editId, posts.length])

  const openEditorById = async (id: string) => {
    try {
      const res = await api<{ post: PostRow }>(`/api/posts/${id}`)
      if (res.post) setEditing(res.post)
    } catch {
      // fallback: match from already-loaded list (without content)
      const found = posts.find((p) => p.id === id)
      if (found) setEditing(found)
    }
  }

  const remove = async (post: PostRow) => {
    try {
      await api(`/api/posts/${post.id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      toast({ title: 'Post deleted', description: `“${post.title}” removed.` })
    } catch (err) {
      toast({ title: 'Delete failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const togglePublish = async (post: PostRow) => {
    try {
      const res = await api<{ post: PostRow }>(`/api/posts/${post.id}`, {
        method: 'PUT',
        body: { published: !post.published },
      })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? res.post : p)))
      toast({ title: res.post.published ? 'Published' : 'Unpublished', description: res.post.title })
    } catch (err) {
      toast({ title: 'Update failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const toggleFeatured = async (post: PostRow) => {
    try {
      const res = await api<{ post: PostRow }>(`/api/posts/${post.id}`, {
        method: 'PUT',
        body: { featured: !post.featured },
      })
      setPosts((prev) => prev.map((p) => (p.id === post.id ? res.post : p)))
    } catch (err) {
      toast({ title: 'Update failed', description: (err as Error).message, variant: 'destructive' })
    }
  }

  const filtered = posts.filter(
    (p) => !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.tags.includes(query.toLowerCase())
  )

  // ── Editor mode ──
  if (creating || editing) {
    return (
      <PostEditor
        post={editing}
        onClose={() => {
          setEditing(null)
          setCreating(false)
          navigate('/admin/posts')
          load()
        }}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Blog posts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{posts.length} total · {posts.filter((p) => p.published).length} published</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="pl-9 h-9 w-44" aria-label="Search posts" />
          </div>
          <Button size="sm" className="glow-sm" onClick={() => navigate('/admin/posts/new')}>
            <Plus className="size-4" /> New post
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyView
          title={query ? 'No posts match' : 'No posts yet'}
          message={query ? 'Try a different search.' : 'Publish your first article — it goes live instantly with full SEO.'}
          icon={<FileText className="size-7 text-muted-foreground" />}
          action={<Button size="sm" onClick={() => navigate('/admin/posts/new')}><Plus className="size-4" /> Write first post</Button>}
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((post) => (
            <li key={post.id} className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm truncate">{post.title}</p>
                  {post.published ? (
                    <Badge variant="secondary" className="text-[10px] text-primary border-primary/30 gap-1">
                      <Check className="size-2.5" /> live
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] text-amber-500 border-amber-500/30">draft</Badge>
                  )}
                  {post.featured && <Badge variant="secondary" className="text-[10px] gap-0.5"><Star className="size-2.5 fill-current" /></Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  <code className="bg-muted rounded px-1.5 py-0.5">/blog/{post.slug}</code>
                  <span>{post.views} views</span>
                  <span>· {post.readingMinutes} min</span>
                  <span>· edited {new Date(post.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="icon" variant="ghost" className="size-8" title={post.published ? 'Unpublish' : 'Publish'} aria-label={post.published ? 'Unpublish' : 'Publish'} onClick={() => togglePublish(post)}>
                  {post.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="size-8" title="Featured" aria-label="Toggle featured" onClick={() => toggleFeatured(post)}>
                  <Star className={`size-4 ${post.featured ? 'text-amber-500 fill-current' : ''}`} />
                </Button>
                {post.published && (
                  <Button size="icon" variant="ghost" className="size-8" aria-label="View live" onClick={() => navigate(`/blog/${post.slug}`)}>
                    <ExternalLink className="size-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="size-8" aria-label="Edit" onClick={() => openEditorById(post.id)}>
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete “{post.title}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The post and its comments will be permanently removed. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(post)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete post
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
function PostEditor({ post, onClose }: { post: PostRow | null; onClose: () => void }) {
  const isNew = !post
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || '# Start writing\n\nUse **markdown** — headings, lists, `code`, ```code blocks```, links, images, GIFs and stickers all render.')
  const [coverImage, setCoverImage] = useState(post?.coverImage || '')
  const [tags, setTags] = useState(post?.tags || '')
  const [category, setCategory] = useState(post?.category || '')
  const [published, setPublished] = useState(post?.published || false)
  const [featured, setFeatured] = useState(post?.featured || false)
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || '')
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Insert markdown at the cursor position (or append if no cursor)
  const insertAtCursor = useCallback((snippet: string) => {
    const el = textareaRef.current
    if (!el) {
      setContent((c) => `${c}\n${snippet}`)
      return
    }
    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? content.length
    const next = content.slice(0, start) + snippet + content.slice(end)
    setContent(next)
    // Restore cursor after the inserted snippet
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + snippet.length
      el.setSelectionRange(pos, pos)
    })
  }, [content])

  const save = async () => {
    if (saving) return
    if (title.trim().length < 3) {
      toast({ title: 'Title too short', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const body = { title, slug, excerpt, content, coverImage, tags, category, published, featured, seoTitle, seoDescription }
      if (isNew) {
        await api('/api/posts', { method: 'POST', body })
      } else {
        await api(`/api/posts/${post.id}`, { method: 'PUT', body })
      }
      toast({ title: published ? 'Post saved & live' : 'Draft saved', description: title })
      onClose()
    } catch (err) {
      toast({ title: 'Save failed', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="size-4" /> Posts
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Switch id="pe-published" checked={published} onCheckedChange={setPublished} />
            <Label htmlFor="pe-published" className="cursor-pointer">{published ? 'Published' : 'Draft'}</Label>
          </div>
          <Button size="sm" onClick={save} disabled={saving} className="glow-sm">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5">
        {/* Main: title + content */}
        <div className="space-y-4 min-w-0">
          <div className="space-y-1.5">
            <Label htmlFor="pe-title">Title</Label>
            <Input id="pe-title" value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold h-12" placeholder="Article title" />
          </div>

          <Tabs defaultValue="write">
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-3">
              <InsertToolbar insertAtCursor={insertAtCursor} onCoverSet={setCoverImage} />
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[420px] font-mono text-sm leading-relaxed scrollbar-slim"
                placeholder="Write in markdown…"
                aria-label="Post content (markdown)"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-3">
              <div className="min-h-[420px] rounded-xl border border-border bg-card p-5 overflow-y-auto scrollbar-slim">
                <Markdown content={content} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: meta + SEO */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publishing</p>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pe-featured" className="text-sm">Featured</Label>
                <p className="text-[11px] text-muted-foreground">Shows on the homepage</p>
              </div>
              <Switch id="pe-featured" checked={featured} onCheckedChange={setFeatured} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pe-slug">URL slug</Label>
              <Input id="pe-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-title" />
              <p className="text-[11px] text-muted-foreground">/blog/{slug || 'auto-generated'}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pe-tags">Tags (comma separated)</Label>
              <Input id="pe-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ai, tools, tutorial" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pe-category">Category</Label>
              <Input id="pe-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="AI / Business / Media" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pe-cover">Cover image URL</Label>
              <div className="flex gap-1.5">
                <Input id="pe-cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…" className="flex-1" />
                <Button type="button" size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={() => insertAtCursor(`![cover](${coverImage || 'https://…'})`)} disabled={!coverImage} title="Insert cover into content" aria-label="Insert cover image into content">
                  <Plus className="size-4" />
                </Button>
              </div>
              {coverImage && (
                 
                <img src={coverImage} alt="Cover preview" className="rounded-lg mt-1.5 aspect-[16/8] w-full object-cover border border-border" />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 space-y-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1.5">
              SEO
              <Badge variant="secondary" className="text-[9px]">per-post control</Badge>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="pe-seo-title">Meta title</Label>
              <Input id="pe-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || 'defaults to post title'} maxLength={70} />
              <p className="text-[11px] text-muted-foreground">{(seoTitle || title).length}/70 characters</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pe-seo-desc">Meta description</Label>
              <Textarea id="pe-seo-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="155-char summary for search engines…" maxLength={165} rows={3} />
              <p className="text-[11px] text-muted-foreground">{(seoDescription || excerpt).length}/165 characters</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Excerpt</p>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="1–2 sentence summary shown on cards & previews" rows={3} maxLength={300} />
            <p className="text-[11px] text-muted-foreground">{excerpt.length}/300</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// InsertToolbar — markdown quick-inserts + media library picker
// (images, GIFs, stickers). Click any media to insert it at the
// cursor in the markdown editor.
// ─────────────────────────────────────────────────────────────
function InsertToolbar({
  insertAtCursor, onCoverSet,
}: {
  insertAtCursor: (snippet: string) => void
  onCoverSet: (url: string) => void
}) {
  const [mediaOpen, setMediaOpen] = useState(false)
  const [media, setMedia] = useState<MediaRow[]>([])
  const [mediaType, setMediaType] = useState<'sticker' | 'image' | 'gif'>('sticker')

  useEffect(() => {
    if (!mediaOpen || media.length > 0) return
    api<{ media: MediaRow[] }>('/api/media')
      .then((d) => setMedia(d.media))
      .catch(() => {})
  }, [mediaOpen, media.length])

  const quick: Array<[string, string, string]> = [
    ['H2', 'Heading', '\n\n## '],
    ['H3', 'Sub-heading', '\n\n### '],
    ['B', 'Bold', '****'],
    ['i', 'Italic', '**'],
    ['• List', 'Bullet list', '\n\n- '],
    ['1. List', 'Numbered list', '\n\n1. '],
    ['❝ Quote', 'Blockquote', '\n\n> '],
    ['</>', 'Code block', '\n\n```\n\n```\n'],
    ['—', 'Divider', '\n\n---\n\n'],
  ]

  const insertMedia = (m: MediaRow) => {
    const alt = m.type === 'sticker'
      ? `sticker-${(m.alt || m.name).toLowerCase().replace(/\s+/g, '-')}`
      : (m.alt || m.name).toLowerCase().replace(/\s+/g, '-')
    const snippet = m.type === 'gif'
      ? `![${alt}](${m.url} "${m.name}")`
      : `![${alt}](${m.url})`
    insertAtCursor(snippet)
  }

  const items = media.filter((m) => m.type === mediaType)

  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
      {/* Markdown quick-inserts */}
      {quick.map(([label, title, snippet]) => (
        <button
          key={label}
          type="button"
          onClick={() => insertAtCursor(snippet)}
          title={title}
          className="h-7 rounded-md border border-border bg-card px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          {label}
        </button>
      ))}

      {/* Link insert */}
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Link URL (https://…)')
          if (url) insertAtCursor(`[link text](${url})`)
        }}
        title="Insert link"
        className="h-7 rounded-md border border-border bg-card px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
      >
        🔗 Link
      </button>

      {/* Media picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMediaOpen((o) => !o)}
          className="h-7 rounded-md border border-primary/40 bg-primary/10 px-2.5 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors"
          aria-expanded={mediaOpen}
          aria-haspopup="grid"
        >
          ✦ Stickers & media
        </button>
        {mediaOpen && (
          <div className="absolute z-50 mt-2 left-0 w-72 rounded-2xl border border-border bg-popover shadow-2xl p-3">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex gap-1" role="group" aria-label="Media type">
                {(['sticker', 'image', 'gif'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMediaType(t)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                      mediaType === t ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-pressed={mediaType === t}
                  >
                    {t === 'gif' ? 'GIFs' : `${t}s`}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setMediaOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close media picker">
                <X className="size-3.5" />
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-6 leading-relaxed">
                No {mediaType}s yet — add them in <span className="text-primary font-medium">Admin → Media</span>.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto scrollbar-slim">
                {items.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { insertMedia(m); setMediaOpen(false) }}
                    title={`Insert ${m.name}${m.type === 'image' ? ' (double-click also sets as cover)' : ''}`}
                    onDoubleClick={() => { if (m.type === 'image') { onCoverSet(m.url); insertMedia(m); setMediaOpen(false) } }}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted hover:border-primary/50 transition-colors"
                  >
                    { }
                    <img src={m.url} alt={m.name} loading="lazy" className="size-full object-contain p-1" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-3.5 pb-0.5 px-1 text-[9px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
