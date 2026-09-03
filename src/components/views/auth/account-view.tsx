'use client'

// Account — profile settings, password change, danger zone, sign-out
import { useCallback, useEffect, useState } from 'react'
import {
  UserRound, Mail, KeyRound, Loader2, Check, Save, AlertTriangle, Trash2,
  LogOut, ShieldCheck, Upload, BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useSession } from '@/components/site/site-context'
import { useSeo } from '@/hooks/use-seo'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

export default function AccountView() {
  const { user, setUser, refresh } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [image, setImage] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useSeo({ title: 'Account Settings', description: 'Manage your profile and security.', path: '/account', noindex: true }, ['account'])

  const load = useCallback(async () => {
    try {
      const res = await api<{ user: { name: string; bio: string | null; image: string | null } }>('/api/account/profile')
      setName(res.user.name || '')
      setBio(res.user.bio || '')
      setImage(res.user.image || '')
    } catch { /* handled by guard below */ }
  }, [])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  if (!user) {
    return (
      <div className="flex-1 grid place-items-center px-4 py-24 text-center">
        <div>
          <p className="text-muted-foreground">Please sign in to manage your account.</p>
          <Button className="mt-4" asChild><Link href="/login">Sign in</Link></Button>
        </div>
      </div>
    )
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      await api('/api/account/profile', { method: 'PATCH', body: { name, bio, image } })
      setUser({ ...user, name })
      toast({ title: 'Profile saved', description: 'Your changes are live.' })
    } catch (err) {
      toast({ title: 'Could not save', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    setSavingPassword(true)
    try {
      const res = await api<{ message: string }>('/api/account/profile', {
        method: 'PUT',
        body: { currentPassword, newPassword },
      })
      toast({ title: 'Password updated', description: res.message })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      toast({ title: 'Could not update', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSavingPassword(false)
    }
  }

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    router.push('/')
  }

  const deleteAccount = async () => {
    try {
      await api('/api/account/profile', { method: 'DELETE' })
      setUser(null)
      toast({ title: 'Account deleted', description: 'Your data has been removed. Sorry to see you go.' })
      router.push('/')
    } catch (err) {
      toast({ title: 'Could not delete', description: (err as Error).message, variant: 'destructive' })
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-10 sm:py-14 pb-24 lg:pb-14">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <Avatar className="size-16 border-2 border-primary/30">
          {image ? (
             
            <img src={image} alt={user.name || 'You'} className="size-full object-cover rounded-full" />
          ) : (
            <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
              {(user.name || 'U')[0].toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
            {user.name}
            {user.role === 'ADMIN' && <BadgeCheck className="size-5 text-primary shrink-0" aria-label="Admin" />}
          </h1>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <p className="text-xs mt-1">
            <span className={`inline-flex items-center gap-1 ${user.emailVerified ? 'text-primary' : 'text-amber-500'}`}>
              <ShieldCheck className="size-3.5" />
              {user.emailVerified ? 'Email verified' : 'Email not verified'}
            </span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="shrink-0">
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profile"><UserRound className="size-4" /> Profile</TabsTrigger>
          <TabsTrigger value="security"><KeyRound className="size-4" /> Security</TabsTrigger>
          <TabsTrigger value="danger"><AlertTriangle className="size-4" /> Danger</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ac-name">Display name</Label>
              <Input id="ac-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ac-image">Profile picture URL</Label>
              <div className="flex gap-2">
                <Input id="ac-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" className="flex-1" />
                <Button variant="outline" size="icon" aria-label="Preview applies on save"><Upload className="size-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Paste any image URL — it shows in comments and your account chip.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ac-bio">Short bio</Label>
              <Textarea id="ac-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} placeholder="A line about you (shown on your comments)" />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={saveProfile} disabled={savingProfile || name.trim().length < 2}>
                {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
              </Button>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="size-3" /> Email changes require re-verification</span>
            </div>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-5">
          <form onSubmit={changePassword} className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sec-current">Current password</Label>
              <Input id="sec-current" type="password" required autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sec-new">New password</Label>
                <Input id="sec-new" type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sec-confirm">Confirm new password</Label>
                <Input id="sec-confirm" type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Update password
            </Button>
          </form>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <p className="font-semibold text-sm flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Security status</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Password hashed with scrypt (never stored in plain text)</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Sessions in httpOnly signed cookies (7 days)</li>
              <li className="flex items-center gap-2">
                {user.emailVerified ? <Check className="size-4 text-primary" /> : <AlertTriangle className="size-4 text-amber-500" />}
                {user.emailVerified ? 'Email verified' : 'Email verification pending — check your registration link'}
              </li>
            </ul>
          </div>
        </TabsContent>

        {/* Danger zone */}
        <TabsContent value="danger" className="space-y-5">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <p className="font-semibold flex items-center gap-2 text-destructive"><AlertTriangle className="size-4" /> Delete account</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              This permanently removes your profile, comments and tickets. Inquiries you submitted
              are kept for legal/booking purposes but anonymised. This cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4"><Trash2 className="size-4" /> Delete my account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes your data and signs you out everywhere. There is no undo. Are you absolutely sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my account</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
