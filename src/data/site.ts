// Single place for site-wide settings. To add a page or a tool, add an entry to `nav`
// and create a file in src/pages/.
export type SocialIcon = 'x' | 'threads' | 'tiktok';

export const site = {
  name: 'Vonex Design',
  tagline: 'Ready-made website templates for Framer and code.',
  description:
    'Ready-made, responsive website templates by Vonex Design. Remix a template in Framer without writing code, or get selected designs as Astro code.',
  // Cloudflare Web Analytics token (Cloudflare dashboard > Analytics & Logs > Web Analytics).
  // Leave empty to disable. Nothing is sent until a token is set.
  analyticsToken: 'a8496556ef3645b5902ace2d122d7198',
  framerProfile: 'https://www.framer.com/@vonexdesign/',
  // Bing Webmaster Tools ownership check (msvalidate.01). Public, keep it: removing it unverifies the site.
  bingSiteVerification: 'F41F52232C55B72905DD1670886C1709',
  // Pinterest website claim (p:domain_verify). Public, keep it: removing it unclaims the site.
  pinterestDomainVerify: '12d900f69dd936e707bd97f4974e4cab',
  // Framer referral link to framer.com, for sign-up and plan links in the guides (not for templates:
  // each template has its own `affiliateUrl`). Links using it get rel="sponsored".
  framerReferral: 'https://framer.link/vonex-studio',
  email: 'ponslookdesign@gmail.com',
  socials: [
    { label: 'X', href: 'https://x.com/ponslookdesign', icon: 'x' },
    { label: 'Threads', href: 'https://www.threads.com/@ponslookdesign', icon: 'threads' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@vonex_design', icon: 'tiktok' },
  ] as { label: string; href: string; icon: SocialIcon }[],
};

export const nav = [
  { label: 'Home', href: '/' },
  // No Templates item: the header button "Browse templates" is the way into the catalog.
  { label: 'Guides', href: '/guides/' },
  { label: 'About', href: '/about/' },
] as { label: string; href: string; external?: boolean }[];
