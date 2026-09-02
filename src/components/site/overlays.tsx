'use client'

// Session-expired modal + offline banner (online/offline events)
import { useEffect, useState } from 'react'
import { AlertTriangle, WifiOff, LogIn } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function SessionExpiredModal({
  open, onClose, onLogin,
}: {
  open: boolean
  onClose: () => void
  onLogin: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 grid place-items-center size-12 rounded-2xl bg-amber-500/15 text-amber-500">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-center">Session expired</DialogTitle>
          <DialogDescription className="text-center">
            For your security, you have been signed out. Please sign in again to continue where you left off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Not now
          </Button>
          <Button className="flex-1" onClick={onLogin}>
            <LogIn className="size-4" /> Sign in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const onOff = () => setOffline(true)
    const onOn = () => setOffline(false)
    window.addEventListener('offline', onOff)
    window.addEventListener('online', onOn)
    const raf = requestAnimationFrame(() => setOffline(!navigator.onLine))
    return () => {
      window.removeEventListener('offline', onOff)
      window.removeEventListener('online', onOn)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] bg-amber-500 text-amber-950 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
      role="alert"
    >
      <WifiOff className="size-4" aria-hidden />
      You&apos;re offline — content you&apos;ve already visited still works. Reconnecting automatically…
    </div>
  )
}
