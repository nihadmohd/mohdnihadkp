// ─────────────────────────────────────────────────────────────
// Site-wide constants — Mohammed Nihad KP Portfolio Platform
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: 'MN.KP',
  fullName: 'Mohammed Nihad KP',
  shortName: 'MN.KP',
  initials: 'MN',
  tagline: 'AI-Powered Developer & Digital Creator',
  description:
    'MN.KP — the platform of Mohammed Nihad KP. I build apps, websites, and digital solutions by mastering the AI tools of tomorrow. Freelancer, businessman and developer from Calicut, Kerala.',
  url: 'https://nihadkp.com',
  locale: 'en_IN',
  location: 'Calicut, Kerala, India',
  email: 'hello@nihadkp.com',
  whatsappNumber: '919846750898',
  brand: 'KP Foundation',
  logo: '/logo.svg',
  logoPng: '/logo.png',
  icon: '/icon.svg',
}

export const SOCIALS = [
  { name: 'WhatsApp', handle: '+91 98467 50898', href: 'https://api.whatsapp.com/send?phone=919846750898&text=Hello...!', icon: 'whatsapp', color: '#25D366' },
  { name: 'Instagram', handle: '@mohdnihadkp', href: 'https://www.instagram.com/mohdnihadkp', icon: 'instagram', color: '#E4405F' },
  { name: 'LinkedIn', handle: 'mohammed-nihad-kp', href: 'https://www.linkedin.com/in/mohammed-nihad-kp-71b6b6339', icon: 'linkedin', color: '#0A66C2' },
  { name: 'X (Twitter)', handle: '@mohdnihadkp', href: 'https://x.com/mohdnihadkp', icon: 'x', color: '#e7e9ea' },
  { name: 'Facebook', handle: 'Mohammed Nihad KP', href: 'https://www.facebook.com/profile.php?id=61589286702060', icon: 'facebook', color: '#1877F2' },
  { name: 'Threads', handle: '@mohdnihadkp', href: 'https://www.threads.com/@mohdnihadkp', icon: 'threads', color: '#e7e9ea' },
  { name: 'Pinterest', handle: 'Nihad KP', href: 'https://pin.it/4SKTJurgS', icon: 'pinterest', color: '#BD081C' },
  { name: 'Google Business', handle: 'Nihad KP — Calicut', href: 'https://share.google/6p5tbrpjnGFZbk0eR', icon: 'globe', color: '#EA4335' },
]

export const CV_URL =
  'https://drive.google.com/file/d/1wzvYQdy3LTLekoCOhytPM5m0AGO0n9nr/preview'

export const VENTURES = [
  {
    name: 'KP Foundation',
    tagline: 'All-in-one business platform',
    description:
      'The parent platform under which every business vertical lives — one foundation, many ventures. Built to be the base of an evolving business ecosystem from Calicut to the world.',
    href: null,
    icon: 'foundation',
    accent: 'emerald',
    badge: 'Flagship',
  },
  {
    name: 'Calicut Store',
    tagline: 'Local commerce, online',
    description:
      'An online storefront for Calicut — bringing local products and deals to a wider audience with a clean shopping experience.',
    href: 'https://calicutstore.vercel.app/',
    icon: 'store',
    accent: 'amber',
    badge: 'Live',
  },
  {
    name: 'Chaliyam Connect',
    tagline: 'Free service facility',
    description:
      'A free community service platform for Chaliyam — connecting people with the services and facilities they need, at zero cost.',
    href: 'https://chaliyam.vercel.app/',
    icon: 'connect',
    accent: 'teal',
    badge: 'Free Service',
  },
  {
    name: 'Calicut Gold',
    tagline: 'Premium gold essentials',
    description:
      'A curated gold and jewellery experience — timeless pieces with modern convenience for customers in and around Calicut.',
    href: 'https://calicutgold.vercel.app/',
    icon: 'gold',
    accent: 'yellow',
    badge: 'Live',
  },
  {
    name: 'PolyStudy',
    tagline: 'Learning made simple',
    description:
      'An education platform helping students study smarter with organized resources and smart learning tools.',
    href: 'https://polystudy.vercel.app/',
    icon: 'study',
    accent: 'lime',
    badge: 'Live',
  },
]

export const SERVICE_OFFERINGS = [
  {
    title: 'Photography & Photo Editing',
    slug: 'photography',
    icon: 'camera',
    description:
      'End-to-end photography — from concept to color-graded final delivery. Events, products, portraits and brand shoots, edited professionally in Lightroom.',
    features: ['Event & product shoots', 'Professional color grading', 'Retouching & enhancement', 'Fast delivery'],
    priceFrom: '₹1,499',
  },
  {
    title: 'Videography & Video Editing',
    slug: 'videography',
    icon: 'video',
    description:
      'Cinematic videography and precision editing with CapCut and Adobe tools — reels, promos, event films and brand stories that hold attention.',
    features: ['Cinematic event films', 'Reels & short-form content', 'Motion graphics & titles', 'Sound design included'],
    priceFrom: '₹2,999',
  },
  {
    title: 'Websites & Apps Using AI',
    slug: 'ai-development',
    icon: 'code',
    description:
      'I build apps, websites and digital solutions by mastering AI tools instead of hand-writing every line — meaning faster delivery, lower cost, and modern quality.',
    features: ['Portfolio & business sites', 'Web apps & dashboards', 'AI-assisted rapid delivery', 'SEO-ready builds'],
    priceFrom: '₹4,999',
  },
  {
    title: 'AI Mastery Consulting',
    slug: 'ai-mastery',
    icon: 'brain',
    description:
      'Learn to leverage artificial intelligence the way I do — practical sessions on using AI tools for development, content, automation and business.',
    features: ['1-on-1 AI tool training', 'Workflow automation setup', 'Prompt engineering', 'Team workshops'],
    priceFrom: '₹999',
  },
  {
    title: 'Digital Marketing',
    slug: 'marketing',
    icon: 'megaphone',
    description:
      'Full-stack digital presence — social strategy, content calendars, campaign creatives and business planning grounded in market analysis.',
    features: ['Social media strategy', 'Content calendars', 'Campaign creatives', 'Market analysis & planning'],
    priceFrom: '₹2,499',
  },
  {
    title: 'Creative Media Production',
    slug: 'creative-media',
    icon: 'palette',
    description:
      'Complete creative production — combining Canva, PicsArt, PixelLab and Adobe into one seamless visual pipeline for your brand.',
    features: ['Brand visual kits', 'Social creatives', 'Print & digital design', 'Consistent visual language'],
    priceFrom: '₹1,999',
  },
]

export const SKILLS = {
  'Build & Deploy': ['Firebase', 'Vercel', 'Netlify', 'GitHub'],
  'AI & Automation': ['AI Tools', 'AI Development', 'Software Testing', 'Automation'],
  'Google Ecosystem': ['Google Workspace', 'Google Business', 'Analytics'],
  'Creative Suite': ['CapCut', 'Adobe', 'Canva', 'PicsArt', 'PixelLab', 'Lightroom'],
}

export const ABOUT_LONG = `I build apps, websites, and digital solutions — not by writing every line of code from scratch, but by mastering the AI tools of tomorrow.

After pursuing a Computer Engineering diploma, I realized my true strength lies outside the traditional classroom: in rapid execution, resourcefulness, and leveraging artificial intelligence to solve real-world problems. I don't just study technology; I use it to bridge the gap between an idea and its final execution.

Instead of getting stuck in conventional methods, I utilize modern AI tools for software testing, development, and automation. Combined with my background in creative media, I bring a unique, multifaceted approach to every project I take on.`

export const WHAT_I_BRING = [
  {
    title: 'AI-Driven Execution',
    icon: 'cpu',
    text: 'Expert in using AI tools for rapid web/app development and efficient software testing. Ideas move from concept to shipped product at unconventional speed.',
  },
  {
    title: 'Creative Media',
    icon: 'camera',
    text: 'End-to-end videography, photography, and video editing to craft compelling narratives that make brands memorable.',
  },
  {
    title: 'Business Strategy',
    icon: 'trending',
    text: 'Strong foundation in market analysis, business planning, and team management — creative work that actually moves business numbers.',
  },
]

export const VISION_STATEMENTS = [
  { label: 'The 195 Goal', text: 'Travel to all 195 countries — seeing the world while building a global business ecosystem.' },
  { label: 'Family First', text: 'Build financial independence to elevate my family and give back to my community in Calicut.' },
  { label: 'Teach The Future', text: 'Educate others on harnessing the power of AI to overcome their own limitations.' },
]

export const CURRENTLY_EXPLORING = [
  { label: 'Global Careers', text: 'High-paying global opportunities — abroad, remote, or maritime/ship roles.', icon: 'globe' },
  { label: 'Scholarships', text: 'Fully-funded international scholarships in Europe, GCC and China to expand education while working.', icon: 'graduation' },
  { label: 'Networking', text: 'Connecting with tech entrepreneurs, AI innovators, and global professionals.', icon: 'network' },
]

// Status: 'waiting fully funded scholarship'
export const SCHOLARSHIP_STATUS = 'Waiting for a fully-funded scholarship'

export const BUDGET_OPTIONS = [
  'Under ₹5,000',
  '₹5,000 – ₹15,000',
  '₹15,000 – ₹50,000',
  '₹50,000+',
  'Not sure yet',
]

export const NAV_LINKS = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'Blog', path: '/blog', icon: 'newspaper' },
  { label: 'Store', path: '/store', icon: 'shopping-bag' },
  { label: 'Services', path: '/services', icon: 'briefcase' },
  { label: 'About', path: '/about', icon: 'user' },
]

export const MORE_LINKS = [
  { label: 'Ventures', path: '/ventures', icon: 'network' },
  { label: 'Contact', path: '/contact', icon: 'mail' },
  { label: 'Search', path: '/search', icon: 'search' },
  { label: 'Account', path: '/account', icon: 'user-round' },
]

export const ADMIN_ROUTES = [
  { label: 'Dashboard', path: '/admin', icon: 'layout-dashboard' },
  { label: 'Posts', path: '/admin/posts', icon: 'newspaper' },
  { label: 'Store', path: '/admin/products', icon: 'shopping-bag' },
  { label: 'Ads', path: '/admin/ads', icon: 'megaphone' },
  { label: 'Marquee', path: '/admin/marquee', icon: 'images' },
  { label: 'Media', path: '/admin/media', icon: 'sticker' },
  { label: 'Services', path: '/admin/services', icon: 'briefcase' },
  { label: 'Inquiries', path: '/admin/inquiries', icon: 'inbox' },
  { label: 'Submissions', path: '/admin/submissions', icon: 'clipboard-list' },
  { label: 'Comments', path: '/admin/comments', icon: 'message-square' },
  { label: 'Users', path: '/admin/users', icon: 'users' },
  { label: 'Subscribers', path: '/admin/subscribers', icon: 'mail-check' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'chart-line' },
  { label: 'Footer', path: '/admin/footer', icon: 'panel-bottom' },
  { label: 'Support', path: '/admin/support', icon: 'life-buoy' },
  { label: 'Settings', path: '/admin/settings', icon: 'settings' },
]

export const MOBILE_TABS = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'Blog', path: '/blog', icon: 'newspaper' },
  { label: 'Store', path: '/store', icon: 'shopping-bag' },
  { label: 'Services', path: '/services', icon: 'briefcase' },
  { label: 'More', path: '/more', icon: 'menu' },
]

// Realtime service port (used with XTransformPort query param through gateway)
export const REALTIME_PORT = 3003
