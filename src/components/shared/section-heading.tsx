'use client'

// Shared section heading + skeletons
import { Skeleton } from '@/components/ui/skeleton'

export function SectionHeading({
  eyebrow, title, description, action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-8">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed text-balance">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-border overflow-hidden ${className}`} aria-hidden>
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  )
}
