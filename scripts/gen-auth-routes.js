// Generates auth + account route pages that render AuthViews /
// their view with AppShell + noindex metadata.
const fs = require('fs')
const path = require('path')

const pages = [
  // [dir, view, title, description, needsToken]
  ['login', 'login', 'Sign In | MN.KP', 'Sign in to your MN.KP account to comment, manage inquiries and access support.', false],
  ['admin-login', 'admin-login', 'Admin & Developer Entrance | MN.KP', 'Restricted access — administrator sign-in for the MN.KP control center.', false],
  ['register', 'register', 'Create Your Free Account | MN.KP', 'Create a free MN.KP account in 30 seconds — comment on articles, track inquiries and get support.', false],
  ['verify-email', 'verify-email', 'Verify Your Email | MN.KP', 'Confirm your email address to activate your MN.KP account.', true],
  ['forgot-password', 'forgot-password', 'Reset Your Password | MN.KP', 'Request a secure password reset link for your MN.KP account.', false],
  ['reset-password', 'reset-password', 'Choose a New Password | MN.KP', 'Set a new password for your MN.KP account.', true],
]

const accountPages = [
  // [dir, component import path, prop name, title, description]
  ['onboarding', '@/components/views/auth/onboarding-view', 'OnboardingView', 'Welcome — Set Up Your Profile | MN.KP', 'A few quick questions to personalize your MN.KP account.'],
  ['account', '@/components/views/auth/account-view', 'AccountView', 'Account Settings | MN.KP', 'Manage your MN.KP profile, password and preferences.'],
  ['billing', '@/components/views/auth/billing-view', 'BillingView', 'Billing & Plans | MN.KP', 'Manage your MN.KP plan, payments and subscription.'],
  ['support', '@/components/views/auth/support-view', 'SupportView', 'Support Tickets | MN.KP', 'Open and track support tickets with the MN.KP team.'],
]

const base = '/home/z/my-project/src/app'

for (const [dir, view, title, description, needsToken] of pages) {
  const tokenParam = needsToken
    ? `  const [{ token }, settings] = await Promise.all([searchParams, getSettings()])`
    : `  const [, settings] = await Promise.all([searchParams, getSettings()])
  const token = undefined`
  const content = `// ${dir} — auth page (noindex: private page, not for search).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import AuthViews from '@/components/views/auth/auth-views'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/${dir}', {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
  noindex: true,
})

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
${tokenParam}
  return (
    <AppShell settings={settings}>
      <Suspense>
        <AuthViews view="${view}" token={token} />
      </Suspense>
    </AppShell>
  )
}
`
  fs.mkdirSync(path.join(base, dir), { recursive: true })
  fs.writeFileSync(path.join(base, dir, 'page.tsx'), content)
  console.log('wrote', dir)
}

for (const [dir, importPath, comp, title, description] of accountPages) {
  const content = `// ${dir} — account-area page (noindex: private page).
import { Suspense } from 'react'
import { AppShell } from '@/components/site/app-shell'
import ${comp} from '${importPath}'
import { getSettings, buildMetadata } from '@/lib/page-data'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata('home', '/${dir}', {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
  noindex: true,
})

export default async function Page() {
  const settings = await getSettings()
  return (
    <AppShell settings={settings}>
      <Suspense>
        <${comp} />
      </Suspense>
    </AppShell>
  )
}
`
  fs.mkdirSync(path.join(base, dir), { recursive: true })
  fs.writeFileSync(path.join(base, dir, 'page.tsx'), content)
  console.log('wrote', dir)
}
