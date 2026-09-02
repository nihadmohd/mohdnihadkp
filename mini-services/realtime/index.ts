import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { Server } from 'socket.io'

// ─────────────────────────────────────────────────────────────
// Realtime service — live users + activity feed + admin alerts
// Public socket.io on :3003 (through Caddy gateway)
// Internal emit endpoint on :3004 (server-to-server only, localhost)
// ─────────────────────────────────────────────────────────────

const PORT = 3003
const INTERNAL_PORT = 3004
const INTERNAL_SECRET =
  process.env.INTERNAL_SECRET || 'nihad-internal-emit-secret-change-me'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

interface LiveVisitor {
  id: string
  sessionId: string
  page: string
  device: 'mobile' | 'desktop'
  joinedAt: number
}

const visitors = new Map<string, LiveVisitor>()
const adminSockets = new Set<string>()

interface FeedEntry {
  type: string
  page: string
  device: string
  sessionId: string
  at: number
}
const activityFeed: FeedEntry[] = []

const pushActivity = (entry: Omit<FeedEntry, 'at'>) => {
  activityFeed.unshift({ ...entry, at: Date.now() })
  if (activityFeed.length > 50) activityFeed.pop()
}

const buildStats = () => {
  let mobile = 0
  let desktop = 0
  for (const v of visitors.values()) {
    if (v.device === 'mobile') mobile++
    else desktop++
  }
  const topPages = new Map<string, number>()
  for (const v of visitors.values()) {
    topPages.set(v.page, (topPages.get(v.page) || 0) + 1)
  }
  return {
    liveUsers: visitors.size,
    liveMobile: mobile,
    liveDesktop: desktop,
    topPages: Array.from(topPages.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, count]) => ({ page, count })),
    ts: Date.now(),
  }
}

const broadcastStats = () => {
  io.emit('live-stats', buildStats())
}

io.on('connection', (socket) => {
  // Client identifies itself: { sessionId, page, device }
  socket.on('visitor:join', (data: { sessionId: string; page: string; device: string }) => {
    visitors.set(socket.id, {
      id: socket.id,
      sessionId: data?.sessionId || 'anon',
      page: data?.page || '/',
      device: data?.device === 'mobile' ? 'mobile' : 'desktop',
      joinedAt: Date.now(),
    })
    pushActivity({
      type: 'visit',
      page: data?.page || '/',
      device: data?.device || 'unknown',
      sessionId: data?.sessionId || 'anon',
    })
    socket.emit('activity-feed', activityFeed.slice(0, 30))
    broadcastStats()
  })

  // Client navigated to another page
  socket.on('visitor:page', (data: { page: string }) => {
    const v = visitors.get(socket.id)
    if (v) {
      v.page = data?.page || '/'
      pushActivity({ type: 'pageview', page: v.page, device: v.device, sessionId: v.sessionId })
      io.to(Array.from(adminSockets)).emit('activity-feed', activityFeed.slice(0, 30))
      broadcastStats()
    }
  })

  // Admin dashboard registers for the live feed
  socket.on('admin:register', () => {
    adminSockets.add(socket.id)
    socket.emit('activity-feed', activityFeed.slice(0, 30))
    socket.emit('live-stats', buildStats())
  })

  socket.on('disconnect', () => {
    visitors.delete(socket.id)
    adminSockets.delete(socket.id)
    broadcastStats()
  })

  socket.on('error', (err) => {
    console.error(`Socket error (${socket.id}):`, err?.message || err)
  })
})

// Periodic broadcast so counts stay fresh even on missed events
setInterval(broadcastStats, 5000)

// ── Internal emit endpoint (localhost only, server-to-server) ─
const internalServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST' && req.url === '/emit') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        const data = JSON.parse(body)
        if (data?.secret !== INTERNAL_SECRET) {
          res.writeHead(403).end('forbidden')
          return
        }
        io.emit('admin:alert', {
          event: data.event || 'update',
          message: data.message || 'Site updated',
          at: Date.now(),
        })
        // Also push into the activity feed for the admin ticker
        pushActivity({
          type: data.event || 'update',
          page: 'system',
          device: 'server',
          sessionId: 'internal',
        })
        io.to(Array.from(adminSockets)).emit('activity-feed', activityFeed.slice(0, 30))
        res.writeHead(200).end('ok')
      } catch {
        res.writeHead(400).end('bad request')
      }
    })
  } else {
    res.writeHead(404).end('not found')
  }
})

httpServer.listen(PORT, () => {
  console.log(`Realtime service running on port ${PORT}`)
})

internalServer.listen(INTERNAL_PORT, '127.0.0.1', () => {
  console.log(`Internal emit endpoint on port ${INTERNAL_PORT} (localhost only)`)
})

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  httpServer.close(() => process.exit(0))
})
