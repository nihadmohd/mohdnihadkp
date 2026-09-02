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
          img: ({ src, alt }) => (
             
            <img src={typeof src === 'string' ? src : ''} alt={alt || ''} loading="lazy" className="rounded-xl my-5 w-full" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})
