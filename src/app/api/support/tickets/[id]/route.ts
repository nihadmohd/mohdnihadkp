// /api/support/tickets/[id] — GET (detail) | POST (reply) | PATCH (status)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { ok, handleError, badRequest } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

const STATUSES = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']

function parseMessages(raw: string) {
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!ticket) return badRequest('Ticket not found.')
    if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
      return badRequest('You do not have access to this ticket.')
    }
    return ok({ ticket: { ...ticket, thread: parseMessages(ticket.messages) } })
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const ticket = await db.supportTicket.findUnique({ where: { id } })
    if (!ticket) return badRequest('Ticket not found.')
    if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
      return badRequest('You do not have access to this ticket.')
    }

    const body = await req.json()
    const message = String(body.message || '').trim()
    if (message.length < 2) return badRequest('Write a reply first.')

    const thread = parseMessages(ticket.messages)
    thread.push({
      from: user.role === 'ADMIN' ? 'admin' : 'user',
      body: message,
      at: new Date().toISOString(),
    })

    const updated = await db.supportTicket.update({
      where: { id },
      data: {
        messages: JSON.stringify(thread),
        status: ticket.status === 'CLOSED' ? 'PENDING' : ticket.status,
      },
    })

    return ok({ ticket: { ...updated, thread } })
  } catch (err) {
    return handleError(err)
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params
    const ticket = await db.supportTicket.findUnique({ where: { id } })
    if (!ticket) return badRequest('Ticket not found.')

    const body = await req.json()
    const status = String(body.status || '').toUpperCase()

    // Users may only close their own tickets; admins can set any status
    if (user.role !== 'ADMIN') {
      if (ticket.userId !== user.id) return badRequest('No access to this ticket.')
      if (status !== 'CLOSED') return badRequest('You can only close your own tickets.')
    }
    if (!STATUSES.includes(status)) return badRequest('Invalid status.')

    const updated = await db.supportTicket.update({ where: { id }, data: { status } })
    return ok({ ticket: updated })
  } catch (err) {
    return handleError(err)
  }
}
