'use client'

// ─────────────────────────────────────────────────────────────
// Socket hook — live users + realtime activity through gateway
// Connection: io("/?XTransformPort=3003") — see gateway rules
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { REALTIME_PORT } from '@/lib/constants'

export interface LiveStats {
  liveUsers: number
  liveMobile: number
  liveDesktop: number
  topPages: { page: string; count: number }[]
  ts: number
}

export interface ActivityEntry {
  type: string
  page: string
  device: string
  sessionId: string
  at: number
}

export interface AdminAlert {
  event: string
  message: string
  at: number
}

let socketRef: Socket | null = null
let refCount = 0

function getSocket(): Socket {
  if (!socketRef) {
    socketRef = io(`/?XTransformPort=${REALTIME_PORT}`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
  }
  return socketRef
}

function releaseSocket() {
  if (refCount <= 0 && socketRef) {
    socketRef.disconnect()
    socketRef = null
  }
}

export function useRealtime(opts: { page: string; asAdmin?: boolean } = { page: '/' }) {
  const [stats, setStats] = useState<LiveStats | null>(null)
  const [feed, setFeed] = useState<ActivityEntry[]>([])
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [connected, setConnected] = useState(false)
  const pageRef = useRef(opts.page)
  pageRef.current = opts.page

  useEffect(() => {
    const socket = getSocket()
    refCount++

    const sessionId = (() => {
      try {
        const existing = localStorage.getItem('nihad_sid')
        if (existing) return existing
        const sid = Math.random().toString(36).slice(2, 12)
        localStorage.setItem('nihad_sid', sid)
        return sid
      } catch {
        return 'anon'
      }
    })()

    const device = window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop'

    const onConnect = () => {
      setConnected(true)
      socket.emit('visitor:join', { sessionId, page: pageRef.current, device })
      if (opts.asAdmin) socket.emit('admin:register')
    }
    const onDisconnect = () => setConnected(false)
    const onStats = (s: LiveStats) => setStats(s)
    const onFeed = (f: ActivityEntry[]) => setFeed(f || [])
    const onAlert = (a: AdminAlert) => setAlerts((prev) => [a, ...prev].slice(0, 20))

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('live-stats', onStats)
    socket.on('activity-feed', onFeed)
    socket.on('admin:alert', onAlert)

    if (socket.connected) {
      socket.emit('visitor:join', { sessionId, page: pageRef.current, device })
      if (opts.asAdmin) socket.emit('admin:register')
    }

    // Announce page changes
    const prev = pageRef.current
    if (prev !== opts.page) {
      socket.emit('visitor:page', { page: opts.page })
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('live-stats', onStats)
      socket.off('activity-feed', onFeed)
      socket.off('admin:alert', onAlert)
      refCount--
      releaseSocket()
    }
  }, [opts.asAdmin])

  // Track page changes separately
  useEffect(() => {
    if (!socketRef?.connected) return
    socketRef.emit('visitor:page', { page: opts.page })
  }, [opts.page])

  const notifyAdmins = (event: string, message: string) => {
    // Only meaningful when called from admin-authenticated contexts; API route also relays via its own socket
    socketRef?.emit('admin:notify', { event, message })
  }

  return { stats, feed, alerts, connected, notifyAdmins }
}
