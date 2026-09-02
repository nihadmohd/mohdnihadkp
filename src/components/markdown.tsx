'use client'

// ─────────────────────────────────────────────────────────────
// Markdown renderer — used by blog posts + help center articles
// ─────────────────────────────────────────────────────────────
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export const Markdown = memo(function Markdown({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold mt-10 mb-3 tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">{children}</h3>,
          p: ({ children }) => <p className="leading-7 mb-5 text-foreground/90">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:text-primary/80">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-2 leading-7">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-5 space-y-2 leading-7">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 py-1 my-5 text-muted-foreground italic bg-muted/40 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const isBlock = Boolean(match) || String(children).includes('\n')
            if (!isBlock) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-[0.85em] text-primary" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match?.[1] || 'text'}
                PreTag="div"
                className="!rounded-xl !my-5 !text-sm !bg-zinc-900 border border-border"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-5 rounded-xl border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="bg-muted px-4 py-2.5 text-left font-semibold border-b border-border">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2.5 border-b border-border/50">{children}</td>,
          hr: () => <hr className="my-8 border-border" />,
          // ── Media-aware image renderer ────────────────────────
          // Blog content can embed images, GIFs and stickers via standard
          // markdown ![alt](url). Special sizing is derived from the URL
          // or the alt text:
          //   alt starting with "sticker" → inline sticker (small, no block)
          //   alt starting with "wide"    → full-bleed wide figure
          //   *.gif / sticker path        → treated as animated embed
          //   ![alt](url "caption")       → captioned figure
          img: ({ src, alt, title }) => {
            const url = typeof src === 'string' ? src : ''
            const text = alt || ''
            const isSticker = text.toLowerCase().startsWith('sticker') || /sticker/i.test(url)
            const isWide = text.toLowerCase().startsWith('wide')
            const isGif = /\.gif($|\?)/i.test(url) || /\/gif\//i.test(url)
            const caption = typeof title === 'string' ? title : ''

            if (isSticker) {
              // Inline floating sticker — playful, small, sits in the text flow
              return (
                <span
                  className="inline-block align-middle mx-1.5 my-1 animate-sticker-in"
                  title={caption || text}
                >
                  { }
                  <img
                    src={url}
                    alt={text}
                    loading="lazy"
                    className="size-12 sm:size-14 object-contain drop-shadow-md hover:scale-125 hover:rotate-6 transition-transform"
                  />
                </span>
              )
            }

            if (isGif || isWide) {
              // Animated GIF / wide media — full-width figure with caption
              return (
                <figure className="my-6">
                  <span className="block rounded-2xl overflow-hidden border border-border bg-muted">
                    { }
                    <img
                      src={url}
                      alt={text}
                      loading="lazy"
                      className={`w-full ${isWide ? 'aspect-[21/9] object-cover' : 'object-contain max-h-[520px] mx-auto'}`}
                    />
                  </span>
                  {caption && (
                    <figcaption className="mt-2 text-center text-xs text-muted-foreground italic">
                      {caption}
                    </figcaption>
                  )}
                </figure>
              )
            }

            // Regular image — rounded figure with optional caption
            return (
              <figure className="my-6">
                <span className="block rounded-2xl overflow-hidden border border-border">
                  { }
                  <img src={url} alt={text} loading="lazy" className="w-full object-cover" />
                </span>
                {caption && (
                  <figcaption className="mt-2 text-center text-xs text-muted-foreground italic">
                    {caption}
                  </figcaption>
                )}
              </figure>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})
