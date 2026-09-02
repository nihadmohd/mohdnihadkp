// Blog article — server-rendered full article content (critical:
// AI crawlers like GPTBot/ClaudeBot don't run JavaScript, so the
// markdown must be in the initial HTML). Per-post SEO from the
// admin editor (seoTitle / seoDescription) + BlogPosting JSON-LD.
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/site/app-shell'
import BlogPostView, { type PostRow } from '@/components/views/blog-post-view'
import { db } from '@/lib/db'
import { SITE } from '@/lib/constants'
import { getSettings, getPostBySlug, buildMetadata } from '@/lib/page-data'
import { PAGE_SEO, blogPostingJsonLd, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo-metadata'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    return buildMetadata('blog', `/blog/${slug}`, { noindex: true })
  }
  return buildMetadata('blog', `/blog/${slug}`, {
    title: post.seoTitle || `${post.title} | MN.KP`,
    description:
      post.seoDescription ||
      post.excerpt ||
      `${post.title} — read this and other articles on AI-powered development, freelancing and business on the MN.KP blog.`,
    image: post.coverImage || undefined,
    type: 'article',
    publishedTime: post.publishedAt?.toISOString(),
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()])
  if (!post) notFound()

  const [author, comments] = await Promise.all([
    db.user.findUnique({ where: { id: post.authorId }, select: { id: true, name: true, image: true } }),
    db.comment.findMany({
      where: { postId: post.id, approved: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, content: true, createdAt: true, user: { select: { id: true, name: true, image: true } } },
    }).catch(() => []),
  ])

  const initial = {
    ...post,
    author: author || { id: '', name: SITE.fullName, image: null },
    comments,
  }

  return (
    <AppShell settings={settings}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          '@context': 'https://schema.org',
          '@graph': [
            blogPostingJsonLd({
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              coverImage: post.coverImage,
              publishedAt: post.publishedAt?.toISOString(),
              updatedAt: post.updatedAt?.toISOString(),
              content: post.content,
              authorName: author?.name || SITE.fullName,
              tags: post.tags,
            }),
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
              { name: post.title, path: `/blog/${post.slug}` },
            ]),
          ],
        })}
      />
      <Suspense>
        <BlogPostView slug={slug} initial={initial as unknown as PostRow} />
      </Suspense>
    </AppShell>
  )
}
