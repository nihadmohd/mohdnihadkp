// GET /api — health check
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  let dbOk = true
  try {
    await db.setting.count()
  } catch {
    dbOk = false
  }
  return NextResponse.json({
    status: 'ok',
    database: dbOk ? 'connected' : 'unavailable',
    realtime: 'port 3003',
    time: new Date().toISOString(),
  })
}
