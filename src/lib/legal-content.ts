// ─────────────────────────────────────────────────────────────
// Legal documents — full policy content for the platform
// Owner: Mohammed Nihad KP (nihadkp.com), Calicut, Kerala, India
// ─────────────────────────────────────────────────────────────
import { SITE } from '@/lib/constants'

export interface LegalDoc {
  slug: string
  title: string
  description: string
  updated: string
  sections: { heading: string; body: string[] }[]
}

const UPDATED = 'September 2, 2026'
const OWNER = SITE.name
const EMAIL = SITE.email

const intro = (purpose: string): string[] => [
  `This document is part of the legal framework governing ${SITE.url} (the "Site"), operated by ${OWNER} ("I", "me", "we"), from Calicut, Kerala, India. By accessing or using the Site you agree to the terms described here. ${purpose}`,
  `If you have questions about this document, contact me at ${EMAIL} or via WhatsApp at +91 98467 50898. I aim to respond to all legal and privacy enquiries within 72 hours.`,
]

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How nihadkp.com collects, uses, stores and protects your personal data under India\u2019s DPDP Act and international standards.',
    updated: UPDATED,
    sections: [
      { heading: 'Overview', body: intro('This Privacy Policy explains what personal data the Site collects, why it is collected, how long it is kept, and the rights you have over it.') },
      {
        heading: 'Data I Collect',
        body: [
          '**Account data:** when you register, I store your name, email address, hashed password (never the password itself), profile picture and preferences.',
          '**Content you submit:** blog comments, service inquiries (name, email, phone, budget, message), support tickets, newsletter subscription email, and form submissions.',
          '**Usage data:** pages you visit, referring page, approximate device type (mobile/desktop), session identifier and timestamps. This powers analytics like live visitor counts and popular content, and is collected in aggregated or pseudonymised form.',
          '**Cookies:** strictly necessary cookies for login sessions, plus optional analytics/preference cookies only if you consent. See the Cookie Policy for the full register.',
        ],
      },
      {
        heading: 'How Data Is Used',
        body: [
          'Data is used only to: operate your account, publish and moderate comments, respond to service inquiries and support requests, send the newsletter you subscribed to, understand aggregate traffic patterns to improve the Site, and meet legal obligations.',
          'I do **not** sell, rent or trade your personal data to third parties. Affiliate links in the Store may set third-party cookies once you click through to a merchant — that is governed by the merchant\u2019s own policy, not mine.',
        ],
      },
      {
        heading: 'Storage & Security',
        body: [
          'Data is stored on managed infrastructure (Supabase/Neon Postgres and Vercel/Netlify hosting) chosen for their strong security posture. Passwords are hashed with scrypt; sessions use signed, httpOnly tokens.',
          'Despite best efforts, no system is perfectly secure. If a breach affecting your data occurs, I will notify affected users and the relevant authorities without undue delay.',
        ],
      },
      {
        heading: 'Retention',
        body: [
          'Account data is kept while your account is active. Inquiries and tickets are kept up to 24 months. Aggregated analytics are kept up to 12 months. Newsletters until you unsubscribe. You may request deletion at any time.',
        ],
      },
      {
        heading: 'Your Rights',
        body: [
          'You may request access, correction, export, or erasure of your personal data, withdraw consent for optional cookies, and object to marketing emails. Email ' + EMAIL + ' to exercise these rights — verification of identity may be required.',
          'Indian users are protected under the Digital Personal Data Protection Act, 2023; EU/UK users under GDPR; other users under applicable local law. I honour these frameworks to the extent applicable to a sole-proprietor website operator.',
        ],
      },
      {
        heading: 'Children',
        body: ['The Site is not directed at children under 13, and I do not knowingly collect their data. If you believe a child has provided data, contact me and it will be deleted.'],
      },
    ],
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    description: 'The rules and agreements that govern your use of nihadkp.com — accounts, content, services, purchases and liability.',
    updated: UPDATED,
    sections: [
      { heading: 'Acceptance', body: [...intro('These Terms form a binding agreement between you and the Site owner.'), 'If you do not agree with any part, please stop using the Site.'] },
      {
        heading: 'Accounts',
        body: [
          'You must provide accurate registration details, keep your password confidential, and be at least 13 years old. You are responsible for activity under your account.',
          'I may suspend accounts that violate these Terms, abuse the platform, or are involved in fraud. You can delete your account at any time from Account Settings.',
        ],
      },
      {
        heading: 'Acceptable Use',
        body: [
          'You agree not to: scrape or overload the Site; attempt unauthorised access; upload malware; post unlawful, hateful, harassing, misleading or infringing content; impersonate others; or use the comments or inquiry forms for spam.',
          'Detailed rules are in the Acceptable Use Policy, which is incorporated into these Terms by reference.',
        ],
      },
      {
        heading: 'Services & Payments',
        body: [
          'Service inquiries submitted through the Site are requests, not confirmed orders. Work begins only after a written agreement (email/WhatsApp confirmation) stating scope, timeline and price.',
          'Membership plans (Free/Pro/Business) currently operate in demonstration mode; paid features activate when billing goes live. Any live payments will be processed by a PCI-compliant gateway and governed by the Refund Policy.',
        ],
      },
      {
        heading: 'Content Ownership',
        body: [
          'Blog posts, images, branding and design on the Site are my intellectual property or used with permission. You may not republish full articles without written consent; short quotes with attribution and a link are welcome.',
          'You retain ownership of comments and inquiries you submit, but grant me a non-exclusive licence to display them on the Site and use them to respond to you.',
        ],
      },
      {
        heading: 'Affiliate Disclosure',
        body: ['Some Store links are affiliate links. If you purchase through them I may earn a commission at no extra cost to you. This never affects which products I list or the honesty of my recommendations.'], 
      },
      {
        heading: 'Disclaimers & Liability',
        body: [
          'The Site is provided "as is" without warranties of any kind. To the maximum extent permitted by law, I am not liable for indirect, incidental or consequential damages arising from use of the Site. Total liability is capped at ₹1,000 or the amount you paid me in the prior 6 months, whichever is higher.',
          'Disputes are governed by the laws of India, with exclusive jurisdiction of courts in Kozhikode (Calicut), Kerala, after a good-faith attempt at resolution via direct contact.',
        ],
      },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    description: 'Every cookie nihadkp.com uses — what it stores, how long it lasts, and how to control it.',
    updated: UPDATED,
    sections: [
      { heading: 'What Cookies Are', body: intro('This policy lists every cookie the Site sets. Cookies are small text files stored by your browser.') },
      {
        heading: 'Cookie Register',
        body: [
          '**nihad_session** (Strictly Necessary) — a signed authentication token that keeps you logged in. Lifetime: 7 days. httpOnly; not readable by scripts.',
          '**nihad_sid** (Functional) — a random session identifier used to count live visitors accurately without identifying you. Lifetime: stored in local storage until cleared.',
          '**theme** (Functional) — remembers whether you chose light or dark mode. Lifetime: 1 year.',
          '**cookie-consent** (Strictly Necessary) — remembers your cookie choices so you are not asked again. Lifetime: 12 months.',
          '**Analytics cookies** (Statistics, optional) — only set after you consent; pseudonymised page-view measurement. Lifetime: up to 12 months.',
          '**Third-party cookies** — set only after you click outbound affiliate links, by the destination merchant (e.g. Amazon). Governed by their policies.',
        ],
      },
      {
        heading: 'Managing Cookies',
        body: [
          'Use the on-site Cookie Preferences panel (link in the footer) to grant or withdraw consent for optional categories at any time.',
          'You can also block or delete cookies through your browser settings. Blocking strictly necessary cookies will break login functionality.',
        ],
      },
    ],
  },
  {
    slug: 'cookie-preferences',
    title: 'Cookie Preferences',
    description: 'Choose which optional cookie categories nihadkp.com may use. Necessary cookies are always active.',
    updated: UPDATED,
    sections: [
      { heading: 'Live Preference Panel', body: intro('This page hosts the interactive cookie consent manager. Use the controls on this page to save your choices instantly — they apply across the whole Site.') },
      {
        heading: 'Categories',
        body: [
          '**Strictly Necessary (always on)** — login sessions, security, consent memory. Cannot be disabled because the Site cannot function without them.',
          '**Functional (optional)** — theme memory, live-visitor session ID.',
          '**Analytics (optional)** — pseudonymised page-view measurement used to improve content.',
          '**Marketing (currently unused)** — reserved for the future; disabled by default.',
        ],
      },
      {
        heading: 'Your Current Choice',
        body: ['Open the Cookie Preferences panel on this page to review or change what you have allowed. Withdrawing consent clears optional cookies on your next visit.'],
      },
    ],
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    description: 'When and how refunds are issued for services and digital products purchased through nihadkp.com.',
    updated: UPDATED,
    sections: [
      { heading: 'Scope', body: intro('This policy covers refunds for services booked and any future digital products or memberships sold on the Site.') },
      {
        heading: 'Service Bookings',
        body: [
          '**Full refund** if you cancel at least 48 hours before scheduled work begins, or if I am unable to deliver the agreed scope.',
          '**Partial refund** (minus hours already worked) if the project is cancelled mid-way. Completed and delivered milestones are non-refundable.',
          '**No refund** after final delivery is accepted, or for change-of-mind after work is substantially complete.',
        ],
      },
      {
        heading: 'Memberships & Digital Products',
        body: [
          'Membership plans can be cancelled anytime; cancellation stops future billing and you retain access until the end of the paid period. A pro-rata refund is available within 7 days of a renewal charge if you have not used premium features in that period.',
          'Instant-download digital products are non-refundable once downloaded, except where legally required (e.g. EU 14-day right for purchases where access has not begun).',
        ],
      },
      {
        heading: 'How Refunds Are Processed',
        body: [
          'Approved refunds return via the original payment method within 7–10 business days. Bank processing time may extend this. Email ' + EMAIL + ' with your transaction details to request a refund. Fraudulent chargeback abuse may result in account suspension.',
        ],
      },
    ],
  },
  {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    description: 'How to cancel service bookings, subscriptions and accounts on nihadkp.com.',
    updated: UPDATED,
    sections: [
      { heading: 'Scope', body: intro('This policy explains cancellations for bookings, subscriptions and accounts.') },
      {
        heading: 'Service Bookings',
        body: [
          'Cancel free of charge up to 48 hours before work begins (via email or WhatsApp). Cancellations within 24 hours may incur a 25% fee covering reserved time; no-shows for scheduled shoots/sessions are charged 50% of the booking.',
          'If I must cancel, you receive a full refund or free rescheduling — your choice.',
        ],
      },
      {
        heading: 'Subscriptions',
        body: [
          'Cancel any time from Account → Billing → Cancel Subscription. Cancellation is immediate for future billing; premium access continues until the period ends. No phone calls or emails are required.',
        ],
      },
      {
        heading: 'Account Cancellation',
        body: [
          'Delete your account from Account Settings. This removes personal data and cancels all subscriptions in one step. Some data is retained briefly for legal/backup purposes as described in the Privacy Policy.',
        ],
      },
    ],
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    description: 'Physical product shipping terms for items ordered through nihadkp.com or its Calicut Store venture.',
    updated: UPDATED,
    sections: [
      { heading: 'Scope', body: intro('The Store currently lists affiliate products fulfilled by third-party merchants, and selected physical products shipped by me within India.') },
      {
        heading: 'Affiliate Orders',
        body: [
          'Affiliate links redirect to merchant platforms (e.g. Amazon). Shipping, tracking and delivery for those orders are handled entirely by the merchant under their own shipping policy.',
        ],
      },
      {
        heading: 'Direct Orders',
        body: [
          'Orders placed directly with me (prints, media deliverables on physical media, local products) ship within 3 business days.',
          '**India:** 2–7 business days by tracked courier. Free shipping on orders above ₹2,000; ₹99 flat below that. Calicut city may qualify for same-day hand delivery.',
          '**International:** 7–21 business days; actual cost quoted before payment. Customs duties (if any) are payable by the recipient.',
        ],
      },
      {
        heading: 'Tracking & Issues',
        body: [
          'A tracking link is emailed once shipped. If tracking shows no movement for 7 days, contact me for a replacement or refund. Risk passes to you on delivery to the courier in good condition.',
        ],
      },
    ],
  },
  {
    slug: 'return-exchange-policy',
    title: 'Return / Exchange Policy',
    description: 'Eligibility, windows and process for returning or exchanging products bought from nihadkp.com.',
    updated: UPDATED,
    sections: [
      { heading: 'Scope', body: intro('This covers returns and exchanges for physical products I ship directly.') },
      {
        heading: 'Return Window & Eligibility',
        body: [
          'Returns accepted within **7 days of delivery** for unused items in original packaging with all accessories. Custom/personalised items (engraved prints, bespoke media, made-to-order products) are non-returnable unless defective.',
          'Digital downloads and delivered service work are governed by the Refund Policy, not this one.',
        ],
      },
      {
        heading: 'Exchanges',
        body: [
          'Size/variant exchanges are free (one exchange per order) — message me within 7 days. The replacement ships after the original item is received back.',
        ],
      },
      {
        heading: 'Process',
        body: [
          'Email ' + EMAIL + ' or WhatsApp with your order ID and photos of the item. After approval, ship the item back (address provided then). Refunds are issued within 7–10 business days of inspection; original shipping fees are non-refundable.',
          'Damaged-on-arrival or wrong item? Send photos within 48 hours — return shipping is on me and you get a replacement or full refund, including shipping.',
        ],
      },
    ],
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer',
    description: 'Accuracy of information, external links, affiliate relationships and professional advice limits on nihadkp.com.',
    updated: UPDATED,
    sections: [
      { heading: 'Scope', body: intro('This disclaimer limits my responsibility for how information on the Site is used.') },
      {
        heading: 'Information Accuracy',
        body: [
          'Blog posts, tutorials and AI-related content reflect my personal experience at the time of writing. Technology changes fast — verify critical details before relying on them. Content is provided for general information, not as professional, financial, medical or legal advice.',
        ],
      },
      {
        heading: 'External & Affiliate Links',
        body: [
          'Links to third-party sites (ventures, affiliate merchants, social platforms) are outside my control. I am not responsible for their content, availability or practices. Affiliate commissions never influence recommendations; see the affiliate disclosure in the Terms.',
        ],
      },
      {
        heading: 'AI Tools Notice',
        body: [
          'Parts of this Site — like my workflow itself — are built with AI assistance. While I review everything published, AI-generated assistance can contain inaccuracies. Report anything wrong via the Contact page and I will fix it promptly.',
        ],
      },
      {
        heading: 'Liability Limit',
        body: ['Use of the Site and its content is at your own risk. I disclaim liability for losses arising from reliance on Site content, to the fullest extent permitted by law.'],
      },
    ],
  },
  {
    slug: 'accessibility-statement',
    title: 'Accessibility Statement',
    description: 'My commitment and conformance level for making nihadkp.com usable by everyone, including assistive technology users.',
    updated: UPDATED,
    sections: [
      { heading: 'Commitment', body: intro('Accessibility is a design requirement here, not an afterthought — the Site targets WCAG 2.1 Level AA.') },
      {
        heading: 'What I Have Implemented',
        body: [
          'Semantic HTML landmarks (header, nav, main, footer, article) with a logical heading hierarchy; skip-to-content link; full keyboard operability including menus, dialogs and forms; visible focus indicators; 44px+ touch targets; ARIA labels on icon-only controls; prefers-reduced-motion support; colour contrast meeting AA; light/dark themes; descriptive alt text; captions/labels on all form fields with inline error messages.',
          'The mobile design uses platform-standard navigation (bottom tab bar) so assistive technology users encounter familiar patterns.',
        ],
      },
      {
        heading: 'Known Limitations',
        body: [
          'Some embedded third-party content (social feeds, merchant pages) may not be fully accessible. Older blog images may have short alt text. These are being improved continuously.',
        ],
      },
      {
        heading: 'Feedback',
        body: [
          'If you hit any accessibility barrier, email ' + EMAIL + ' with the page and a description — accessibility issues are treated as bugs with priority. I aim to respond within 3 business days.',
        ],
      },
    ],
  },
  {
    slug: 'data-processing-agreement',
    title: 'Data Processing Agreement',
    description: 'Terms under which nihadkp.com processes personal data on behalf of business clients (controller–processor terms).',
    updated: UPDATED,
    sections: [
      { heading: 'Scope', body: intro('This DPA applies when I process personal data of your customers/end-users as part of a service engagement (e.g. building your website, app or automation).') },
      {
        heading: 'Roles',
        body: [
          'You are the Data Controller. I am the Data Processor. I process data only on your documented instructions — never for my own purposes, and I do not sell it.',
        ],
      },
      {
        heading: 'Processor Obligations',
        body: [
          'I will: use industry-standard safeguards (encryption in transit, access control, scrypt hashing for credentials); ensure personnel are bound by confidentiality; assist with data-subject requests and breach notifications (72-hour breach notice to you); delete or return data at engagement end; maintain a list of sub-processors (hosting such as Vercel/Neon/Supabase, and communication tools) with advance notice of changes.',
        ],
      },
      {
        heading: 'International Transfers',
        body: [
          'Hosting may involve servers outside India. Transfers rely on appropriate safeguards and are limited to what the engagement requires.',
        ],
      },
      {
        heading: 'Audit & Term',
        body: [
          'You may request a summary of security practices once per engagement year. This DPA endures while data is processed and survives until all client data is deleted or returned.',
        ],
      },
    ],
  },
  {
    slug: 'acceptable-use-policy',
    title: 'Acceptable Use Policy',
    description: 'What is — and is not — allowed when using nihadkp.com accounts, comments, forms and services.',
    updated: UPDATED,
    sections: [
      { heading: 'Scope', body: intro('This AUP defines prohibited conduct. It is incorporated into the Terms of Service.') },
      {
        heading: 'Prohibited Content',
        body: [
          'Do not post or submit content that is: unlawful; sexually explicit involving minors; hateful or discriminatory on protected grounds; harassing or threatening; defamatory; infringing copyright/trademark; misleading medical or financial advice; spam, undisclosed advertising, chain letters, or malware.',
        ],
      },
      {
        heading: 'Prohibited Behaviour',
        body: [
          'No scraping at volumes that degrade the service; no automated account creation; no credential stuffing, probing, port scanning or exploit attempts; no circumventing bans; no impersonation of me or other users; no reselling Site content as your own; no using the inquiry or comment systems to phish other users.',
        ],
      },
      {
        heading: 'Enforcement',
        body: [
          'Violations lead to content removal, warnings, temporary suspension or permanent ban, with severity scaled to the violation. Illegal activity is reported to authorities. If you believe a moderation action was wrong, appeal via ' + EMAIL + '.',
        ],
      },
    ],
  },
  {
    slug: 'security-policy',
    title: 'Security Policy',
    description: 'How nihadkp.com protects accounts, data and infrastructure — controls, monitoring and incident handling.',
    updated: UPDATED,
    sections: [
      { heading: 'Commitment', body: intro('This document summarises the security posture of the Site in plain language.') },
      {
        heading: 'Technical Controls',
        body: [
          'Passwords stored as scrypt hashes with unique salts (never plaintext, never reversible); sessions use signed HS256 tokens in httpOnly cookies (immune to XSS token theft); TLS for all traffic; strict security headers; input validation with schema validation on every API; rate limiting on auth endpoints; role-based access control with a single admin role; least-privilege database access.',
          'Realtime features use WebSocket connections that cannot execute anything on the server — they only emit presence events.',
        ],
      },
      {
        heading: 'Infrastructure',
        body: [
          'Hosting on managed platforms (Vercel/Netlify) and managed Postgres (Neon/Supabase) with encrypted at-rest storage, automated backups and isolated network boundaries. Secrets are stored in environment variables, never in the repository.',
        ],
      },
      {
        heading: 'Incident Response',
        body: [
          'Suspected incidents are triaged within 24 hours. Confirmed breaches affecting user data trigger: containment, assessment, user notification with what happened and what to do, and authority notification where legally required. Post-incident, a short public note is published describing the fix.',
        ],
      },
      {
        heading: 'Recommendations for You',
        body: ['Use a strong unique password, verify emails promptly, and log out on shared devices. I will never ask for your password by email, WhatsApp or social media.',
        ],
      },
    ],
  },
  {
    slug: 'responsible-disclosure',
    title: 'Responsible Disclosure',
    description: 'How security researchers can report vulnerabilities in nihadkp.com safely and what I commit to in return.',
    updated: UPDATED,
    sections: [
      { heading: 'Program', body: intro('I welcome responsible security research on this Site and promise not to pursue legal action against good-faith reporters who follow this policy.') },
      {
        heading: 'How to Report',
        body: [
          'Email ' + EMAIL + ' with subject "Security Report". Include: affected URL/route, step-by-step reproduction, potential impact, and any proof-of-concept. Encrypt sensitive reports if you wish — request my public key by reply.',
        ],
      },
      {
        heading: 'Guidelines',
        body: [
          'Use only your own test accounts; do not access, modify or exfiltrate other users\u2019 data; no destructive testing, DoS, spam or social engineering; stop and report immediately if you accidentally reach real data; give me 90 days before public disclosure; do not demand payment — occasional thanks and credits are at my discretion.',
        ],
      },
      {
        heading: 'My Commitments',
        body: [
          'Acknowledgement within 72 hours; a status update every 7 days until resolved; public thanks in a responsibly-timed disclosure if you wish; safe-harbour for compliant research.',
        ],
      },
    ],
  },
  {
    slug: 'community-guidelines',
    title: 'Community Guidelines',
    description: 'How to be a great member of the nihadkp.com community — in comments, support and social channels.',
    updated: UPDATED,
    sections: [
      { heading: 'The Spirit', body: intro('This is a builder\u2019s corner of the internet: curious, practical, generous. These guidelines keep it that way.') },
      {
        heading: 'Be Excellent to Each Other',
        body: [
          'Critique ideas, not people. No harassment, hate speech, doxxing or dogpiling. Disagree with evidence and kindness. Questions from beginners are gifts, not nuisances — answer them the way you wished someone had answered yours.',
        ],
      },
      {
        heading: 'Content Standards',
        body: [
          'Stay roughly on-topic: AI tools, building things, freelancing, creative media and the journey. English or Malayalam are both welcome. No spam, no affiliate-link dropping without context, no NSFW content, no sharing others\u2019 private information. Cite sources when you claim facts.',
        ],
      },
      {
        heading: 'Moderation',
        body: [
          'Comments are pre-moderated (approved before appearing) to keep spam out. Moderation decisions: edit nothing, remove only violating content, explain removals on request. Repeated violations lead to suspension. Appeal by email — genuine mistakes happen and are reversed happily.',
        ],
      },
    ],
  },
]

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug)
}
