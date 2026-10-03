// Single place for site-wide settings. To add a page or a tool, add an entry to `nav`
// and create a file in src/pages/.
export type SocialIcon = 'x' | 'threads' | 'tiktok';

export const site = {
  name: 'Vonex Design',
  tagline: 'Ready-made Framer templates for any website.',
  description:
    'Ready-made, responsive Framer templates by Vonex Design. Pick a template, remix it in Framer, make it yours and publish your website without writing code.',
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
] as { label: string; href: string; external?: boolean }[];
