// Single place for site-wide settings. To add a page or a tool, add an entry to `nav`
// and create a file in src/pages/.
export type SocialIcon = 'x' | 'threads' | 'tiktok';

export const site = {
  name: 'Vonex Design',
  tagline: 'Framer templates, designed with care.',
  description:
    'Clean, responsive Framer templates for portfolios, agencies and weddings by Vonex Design. Pick a template, remix it on Framer and launch your website without code.',
  // Cloudflare Web Analytics token (Cloudflare dashboard > Analytics & Logs > Web Analytics).
  // Leave empty to disable. Nothing is sent until a token is set.
  analyticsToken: '',
  framerProfile: 'https://www.framer.com/@vonexdesign/',
  email: 'ponslookdesign@gmail.com',
  socials: [
    { label: 'X', href: 'https://x.com/ponslookdesign', icon: 'x' },
    { label: 'Threads', href: 'https://www.threads.com/@ponslookdesign', icon: 'threads' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@vonex_design', icon: 'tiktok' },
  ] as { label: string; href: string; icon: SocialIcon }[],
  // Other projects by the same author, shown in the footer.
  projects: [{ label: 'PostVia', href: 'https://postvia.online/' }],
};

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Templates', href: '/templates/' },
  { label: 'Framer profile', href: site.framerProfile, external: true },
];
