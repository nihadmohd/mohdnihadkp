// Help Center FAQ content — server-safe shared module.
// Used by the Help view (UI) and the /help route (FAQPage JSON-LD)
// so answer engines always see the exact same answers.
export const HELP_FAQS: Array<{ category: string; q: string; a: string }> = [
  { category: 'General', q: 'Who is behind this website?', a: 'Mohammed Nihad KP — a freelancer, businessman and AI-driven developer from Calicut, Kerala. You can read the full story on the About page or check the CV linked in the footer.' },
  { category: 'General', q: 'How do I navigate the site on mobile?', a: 'Use the bottom tab bar (Home, Blog, Store, Services, More). "More" contains your account, legal documents, support and everything else. On desktop, everything is in the top navigation.' },
  { category: 'General', q: 'What is KP Foundation?', a: 'KP Foundation is the parent platform for all ventures — Calicut Store, Chaliyam Connect, Calicut Gold and PolyStudy live under it. New businesses will be added under the same foundation over time.' },
  { category: 'Services', q: 'How fast do you reply to inquiries?', a: 'Within 24 hours, usually much faster — especially on WhatsApp. Every inquiry form submission lands instantly in my admin dashboard with a live notification.' },
  { category: 'Services', q: 'How much does a project cost?', a: 'Photography starts from ₹1,499, videography from ₹2,999, websites and apps from ₹4,999. The final quote depends on scope — you get it in writing before any work starts. No hidden charges, ever.' },
  { category: 'Services', q: 'Do you work with clients outside India?', a: 'Yes — remote-first, timezone-flexible. Global and remote opportunities are exactly what I am looking for.' },
  { category: 'Account', q: 'Why should I create an account?', a: 'Accounts let you comment on articles, track your service inquiries, open support tickets and manage subscriptions. Registration takes about 30 seconds.' },
  { category: 'Account', q: 'I forgot my password — what now?', a: 'Use the "Forgot password?" link on the sign-in page. A secure reset link is generated (in production it is emailed); the whole flow takes under a minute.' },
  { category: 'Account', q: 'How do I delete my account?', a: 'Account Settings → Danger zone → Delete account. It removes your profile, comments and tickets. Inquiries submitted for services are retained but anonymised for legal purposes.' },
  { category: 'Billing', q: 'Are the membership plans really free?', a: 'The Free plan is free forever. Pro and Business are currently in demonstration mode — no real charges occur; paid features activate when live billing switches on.' },
  { category: 'Billing', q: 'Can I cancel anytime?', a: 'Yes — one click from Billing → Cancel Subscription, no calls or emails needed. You keep access until the end of the paid period.' },
  { category: 'Store', q: 'What are affiliate links?', a: 'Some store products link to merchants like Amazon. If you buy through them, I may earn a small commission at no extra cost to you. It never influences what gets listed — only tools I actually use appear here.' },
  { category: 'Store', q: 'Do you handle the orders yourself?', a: 'Affiliate orders are fulfilled entirely by the merchant (shipping, returns, warranty). Direct products (prints, media) ship from Calicut — see the Shipping Policy.' },
  { category: 'Content', q: 'Can I republish your articles?', a: 'Full articles require written permission — email me. Short quotes with a link back are always welcome.' },
  { category: 'Content', q: 'How often do you publish?', a: 'I write between projects — typically a new article every week or two. Subscribe to the newsletter (footer) and you will never miss one.' },
]

export const HELP_CATEGORIES = ['All', ...Array.from(new Set(HELP_FAQS.map((f) => f.category)))]
