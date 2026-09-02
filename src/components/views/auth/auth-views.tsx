'use client'

// Auth views — login, admin-login (distinct gold theme), register
// (violet theme), verify-email, forgot & reset password. Each major
// auth page has its own color theme as requested.
import { useEffect, useState, type ReactNode } from 'react'
import {
  LogIn, UserPlus, Loader2, MailCheck, KeyRound, Eye, EyeOff, ArrowLeft,
  Check, AlertCircle, ShieldCheck, Sparkles, TerminalSquare, Lock, Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api-client'
import { navigate } from '@/hooks/use-hash-router'
import { useSession, type SessionUser } from '@/components/site/site-context'
import { useSeo } from '@/hooks/use-seo'
import { SITE } from '@/lib/constants'

// ── Per-page color themes ───────────────────────────────────────
// login → emerald · admin-login → gold · register → violet
type AuthTheme = 'emerald' | 'gold' | 'violet'

const THEMES: Record<AuthTheme, {
  aurora: string
  iconWrap: string
  text: string
  btn: string
  glow: string
  label: string
  input: string
}> = {
  emerald: {
    aurora: 'bg-primary/10',
    iconWrap: 'bg-primary/12 text-primary',
    text: 'text-primary',
    btn: 'bg-primary text-primary-foreground hover:bg-primary/90',
    glow: 'shadow-lg shadow-primary/25',
    label: '',
    input: '',
  },
  gold: {
    aurora: 'bg-amber-400/15',
    iconWrap: 'bg-gradient-to-br from-amber-400/25 to-amber-600/15 text-amber-500 border border-amber-500/30',
    text: 'text-amber-500 dark:text-amber-400',
    btn: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 font-bold',
    glow: 'shadow-lg shadow-amber-500/30',
    label: 'border-amber-500/40',
    input: 'focus-visible:ring-amber-500/40 border-amber-500/25',
  },
  violet: {
    aurora: 'bg-violet-500/15',
    iconWrap: 'bg-violet-500/15 text-violet-500 dark:text-violet-400 border border-violet-500/30',
    text: 'text-violet-600 dark:text-violet-400',
    btn: 'bg-violet-600 text-white hover:bg-violet-500',
    glow: 'shadow-lg shadow-violet-500/25',
    label: '',
    input: 'focus-visible:ring-violet-500/40 border-violet-500/25',
  },
}

function AuthShell({
  icon, title, subtitle, children, footer, theme = 'emerald', badge,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  theme?: AuthTheme
  badge?: string
}) {
  const t = THEMES[theme]
  return (
    <div className="relative flex-1 flex items-center justify-center px-4 py-12 sm:py-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg mask-fade-b opacity-25" aria-hidden />
      <div className={`absolute -top-24 left-1/3 size-80 rounded-full ${t.aurora} blur-3xl animate-aurora`} aria-hidden />
      {theme === 'gold' && (
        <div className="absolute -bottom-32 right-1/4 size-96 rounded-full bg-amber-500/10 blur-3xl animate-aurora" style={{ animationDelay: '1.2s' }} aria-hidden />
      )}
      <div className="relative w-full max-w-sm">
        {badge && (
          <p className={`mb-3 text-center`}><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${t.text} ${t.label || 'border-border'}`}>
            <Lock className="size-3" aria-hidden /> {badge}
          </span></p>
        )}
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-8 shadow-xl shadow-black/5">
          <div className="flex justify-center mb-5">
            <span className={`grid place-items-center size-14 rounded-2xl ${t.iconWrap}`}>{icon}</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-center">{title}</h1>
          <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}

function PasswordInput({
  id, value, onChange, placeholder = '••••••••', autoComplete = 'current-password',
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive" role="alert">
      <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden />
      <span>{message}</span>
    </div>
  )
}

// ─── LOGIN ───────────────────────────────────────────────────
function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useSession()
  useSeo({ title: 'Sign In', description: 'Sign in to your account.', path: '/login', noindex: true }, ['login'])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const res = await api<{ user: SessionUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      setUser(res.user)
      navigate(res.user.onboarded ? '/' : '/onboarding')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      icon={<LogIn className="size-6" />}
      title="Welcome back"
      subtitle="Sign in to comment, manage inquiries and access your account."
      footer={
        <>
          New here?{' '}
          <button onClick={() => navigate('/register')} className="text-primary font-medium hover:underline">
            Create a free account
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Forgot?
            </button>
          </div>
          <PasswordInput id="login-password" value={password} onChange={setPassword} />
        </div>
        <Button type="submit" className="w-full h-11 glow-sm" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  )
}

// ─── REGISTER ────────────────────────────────────────────────
function RegisterView() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{ verifyToken: string } | null>(null)
  useSeo({ title: 'Create Account', description: 'Create a free account.', path: '/register', noindex: true }, ['register'])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const res = await api<{ verifyToken: string }>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      })
      setCreated({ verifyToken: res.verifyToken })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <AuthShell
        icon={<MailCheck className="size-6" />}
        title="Check your inbox"
        subtitle={`A verification link has been generated for ${email}. In this demo environment email delivery is disabled, so use the button below.`}
        footer={
          <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
            Skip for now — sign in
          </button>
        }
      >
        <div className="space-y-4">
          <Button
            className="w-full h-11 glow-sm"
            onClick={() => navigate(`/verify-email?token=${created.verifyToken}`)}
          >
            <ShieldCheck className="size-4" /> Open verification link
          </Button>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Production note: wire Supabase SMTP or Resend to send this link by email automatically.
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      icon={<UserPlus className="size-6" />}
      title="Create your account"
      subtitle="Free forever — comment on articles, track inquiries and get the newsletter."
      footer={
        <>
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
            Sign in
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="space-y-1.5">
          <Label htmlFor="reg-name">Full name</Label>
          <Input id="reg-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <Input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <PasswordInput id="reg-password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="8+ characters" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-confirm">Confirm password</Label>
          <PasswordInput id="reg-confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full h-11 glow-sm" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Create account
        </Button>
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          By creating an account you agree to the{' '}
          <button type="button" onClick={() => navigate('/legal/terms-of-service')} className="text-primary hover:underline">Terms</button>
          {' '}and{' '}
          <button type="button" onClick={() => navigate('/legal/privacy-policy')} className="text-primary hover:underline">Privacy Policy</button>.
        </p>
      </form>
    </AuthShell>
  )
}

// ─── VERIFY EMAIL ────────────────────────────────────────────
function VerifyEmailView({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'verifying' | 'done' | 'error' | 'need-token'>(
    token ? 'verifying' : 'need-token'
  )
  const [error, setError] = useState('')
  const { refresh } = useSession()
  useSeo({ title: 'Verify Email', description: 'Verify your email address.', path: '/verify-email', noindex: true }, ['verify'])

  useEffect(() => {
    if (!token) return
    api('/api/auth/verify-email', { method: 'POST', body: { token } })
      .then(() => {
        setState('done')
        refresh()
      })
      .catch((err) => {
        setError((err as Error).message)
        setState('error')
      })
  }, [token, refresh])

  return (
    <AuthShell
      icon={<MailCheck className="size-6" />}
      title={
        state === 'done' ? 'Email verified!' :
        state === 'error' ? 'Verification failed' :
        state === 'need-token' ? 'Verification link' : 'Verifying…'
      }
      subtitle={
        state === 'done' ? 'Your email is confirmed. Your account is now fully active.' :
        state === 'error' ? error :
        state === 'need-token' ? 'Open the verification link from your registration to continue.' :
        'Checking your verification token…'
      }
      footer={
        <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
          Continue to sign in →
        </button>
      }
    >
      <div className="space-y-4 text-center">
        {state === 'verifying' && <Loader2 className="size-10 animate-spin text-primary mx-auto" />}
        {state === 'done' && (
          <>
            <span className="mx-auto grid place-items-center size-14 rounded-2xl bg-primary/15 text-primary">
              <Check className="size-7" />
            </span>
            <Button className="w-full h-11" onClick={() => navigate('/login')}>
              <LogIn className="size-4" /> Go to sign in
            </Button>
          </>
        )}
        {state === 'need-token' && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you just registered, go back and use the verification button shown there.
            In production this page is opened from the email link.
          </p>
        )}
        {state === 'error' && (
          <Button variant="outline" className="w-full h-11" onClick={() => navigate('/login')}>
            <ArrowLeft className="size-4" /> Back to sign in
          </Button>
        )}
      </div>
    </AuthShell>
  )
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────
function ForgotPasswordView() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<{ resetToken: string | null } | null>(null)
  useSeo({ title: 'Forgot Password', description: 'Reset your password.', path: '/forgot-password', noindex: true }, ['forgot'])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const res = await api<{ resetToken: string | null }>('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      })
      setSent({ resetToken: res.resetToken })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      icon={<KeyRound className="size-6" />}
      title={sent ? 'Reset link generated' : 'Forgot your password?'}
      subtitle={
        sent
          ? 'If an account exists for that email, a reset link is ready. Email delivery is disabled in this environment, so continue below.'
          : 'Enter your account email and I\u2019ll generate a secure reset link.'
      }
      footer={
        <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
          <span className="inline-flex items-center gap-1"><ArrowLeft className="size-3.5" /> Back to sign in</span>
        </button>
      }
    >
      {sent ? (
        <div className="space-y-4">
          {sent.resetToken ? (
            <Button className="w-full h-11 glow-sm" onClick={() => navigate(`/reset-password?token=${sent.resetToken}`)}>
              <KeyRound className="size-4" /> Continue to reset
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              If that email has an account, the link has been sent for real in production. Try again if needed.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <div className="space-y-1.5">
            <Label htmlFor="fp-email">Email</Label>
            <Input id="fp-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <Button type="submit" className="w-full h-11 glow-sm" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Generate reset link
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

// ─── RESET PASSWORD ──────────────────────────────────────────
function ResetPasswordView({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { refresh } = useSession()
  useSeo({ title: 'Reset Password', description: 'Set a new password.', path: '/reset-password', noindex: true }, ['reset'])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (loading) return
    setLoading(true)
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: { token, password } })
      setDone(true)
      refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthShell
        icon={<KeyRound className="size-6" />}
        title="Reset link required"
        subtitle="Open the reset link from the email (or generate one from the Forgot Password page)."
        footer={<button onClick={() => navigate('/forgot-password')} className="text-primary font-medium hover:underline">Go to forgot password →</button>}
      >
        <Button variant="outline" className="w-full h-11" onClick={() => navigate('/forgot-password')}>
          <ArrowLeft className="size-4" /> Forgot password
        </Button>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell
        icon={<Check className="size-6" />}
        title="Password updated"
        subtitle="Your new password is active and you are signed in. Head home — everything is unlocked."
        footer={null}
      >
        <Button className="w-full h-11 glow-sm" onClick={() => navigate('/')}>
          Continue to home
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      icon={<KeyRound className="size-6" />}
      title="Choose a new password"
      subtitle="At least 8 characters. You will be signed in automatically after."
    >
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="space-y-1.5">
          <Label htmlFor="rp-password">New password</Label>
          <PasswordInput id="rp-password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="8+ characters" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rp-confirm">Confirm new password</Label>
          <PasswordInput id="rp-confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full h-11 glow-sm" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          Set new password
        </Button>
      </form>
    </AuthShell>
  )
}

// ─── DISPATCHER ──────────────────────────────────────────────
export default function AuthViews({
  view, token,
}: {
  view: 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password'
  token?: string
}) {
  switch (view) {
    case 'login': return <LoginView />
    case 'register': return <RegisterView />
    case 'verify-email': return <VerifyEmailView token={token || ''} />
    case 'forgot-password': return <ForgotPasswordView />
    case 'reset-password': return <ResetPasswordView token={token || ''} />
    default: return <LoginView />
  }
}
