'use client'

// Live users badge + provider (socket-driven realtime presence)
// + realtime feed/alerts context (consumed by the admin shell).
import { createContext, useContext, type ReactNode } from 'react'
import { Activity } from 'lucide-react'
import type { LiveStats, ActivityEntry, AdminAlert } from '@/hooks/use-realtime'
import { useSiteSettings } from '@/components/site/site-context'

const LiveStatsContext = createContext<LiveStats | null>(null)
export const useLiveStats = () => useContext(LiveStatsContext)

export function LiveUsersProvider({ stats, children }: { stats: LiveStats | null; children: ReactNode }) {
  return <LiveStatsContext.Provider value={stats}>{children}</LiveStatsContext.Provider>
}

interface RealtimeFeedValue {
  feed: ActivityEntry[]
  alerts: AdminAlert[]
}

const RealtimeFeedContext = createContext<RealtimeFeedValue>({ feed: [], alerts: [] })
export const useRealtimeFeed = () => useContext(RealtimeFeedContext)

export function RealtimeFeedProvider({
  feed, alerts, children,
}: { feed: ActivityEntry[]; alerts: AdminAlert[]; children: ReactNode }) {
  return (
    <RealtimeFeedContext.Provider value={{ feed, alerts }}>
      {children}
    </RealtimeFeedContext.Provider>
  )
}

export function LiveBadge({ compact = false }: { compact?: boolean }) {
  const stats = useLiveStats()
  const { settings } = useSiteSettings()
  if (settings.showLiveCounter === 'false') return null
  const count = stats?.liveUsers ?? 0

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium ${
        compact ? 'h-8 px-2.5 text-xs' : 'h-8 px-3 text-xs'
      }`}
      title={`${count} visitor${count === 1 ? '' : 's'} on the site right now`}
      role="status"
      aria-label={`${count} live visitors`}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 animate-pulse-dot" />
      </span>
      <Activity className="size-3" aria-hidden />
      <span className="tabular-nums">
        {count} <span className="hidden sm:inline">live</span>
      </span>
    </div>
  )
}
