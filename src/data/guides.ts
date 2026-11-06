// Every guide on the site, newest first. The /guides/ index, the footer and the sitemap read
// this list, so a new guide needs one entry here and its page in src/pages/guides/.
//   group 'guide'   — practical: set up, edit, publish, pay. Shown first on /guides/.
//   group 'article' — comparisons and roundups, mostly read by people still choosing.
export interface Guide {
  href: string;
  title: string;
  description: string;
  group: 'guide' | 'article';
  // What kind of article it is, shown as a small label on the index.
  kind: 'How-to' | 'Walkthrough' | 'Pricing' | 'Roundup' | 'Comparison';
  updated: string;
}

export const guides: Guide[] = [
  {
    href: '/guides/how-to-make-a-portfolio-website/',
    title: 'How to make a portfolio website',
    description: 'Seven steps from choosing your work to publishing the site.',
    group: 'guide',
    kind: 'How-to',
    updated: 'November 6, 2026',
  },
  {
    href: '/guides/therapist-website/',
    title: 'What to put on a therapist website',
    description: 'Your approach, fees, openings and a simple contact page.',
    group: 'guide',
    kind: 'How-to',
    updated: 'November 6, 2026',
  },
  {
    href: '/guides/portfolio-website-examples/',
    title: 'Portfolio website examples',
    description: 'Six real portfolios and what you can take from each.',
    group: 'article',
    kind: 'Roundup',
    updated: 'November 6, 2026',
  },
  {
    href: '/guides/how-to-use-framer-templates/',
    title: 'How to use a Framer template',
    description: 'Copy a template, replace the content, check every screen size and publish.',
    group: 'guide',
    kind: 'How-to',
    updated: 'November 3, 2026',
  },
  {
    href: '/guides/framer-pricing/',
    title: 'Is Framer free? Framer pricing explained',
    description: 'What the free plan includes, Basic or Pro, what a domain costs and which plan each template needs.',
    group: 'guide',
    kind: 'Pricing',
    updated: 'November 3, 2026',
  },
  {
    href: '/guides/framer-or-code/',
    title: 'Framer template or code',
    description: 'Use a Framer template or buy the same design as code? Cost, editing, hosting and who each one fits.',
    group: 'guide',
    kind: 'Comparison',
    updated: 'November 3, 2026',
  },
  {
    href: '/guides/framer-cms/',
    title: 'Framer CMS: add projects and posts',
    description: 'Collections, fields, CMS pages and lists: how to add content to a template without touching the design.',
    group: 'guide',
    kind: 'How-to',
    updated: 'November 3, 2026',
  },
  {
    href: '/guides/framer-portfolio-template/',
    title: 'How to build a portfolio with a Framer template',
    description: 'A step-by-step portfolio setup on Ethan Walker: projects in the CMS, contact form, publishing.',
    group: 'guide',
    kind: 'Walkthrough',
    updated: 'November 3, 2026',
  },
  {
    href: '/guides/framer-vs-webflow/',
    title: 'Framer vs Webflow',
    description: 'Price, CMS, editing and learning curve compared for portfolios and landing pages.',
    group: 'article',
    kind: 'Comparison',
    updated: 'November 3, 2026',
  },
  {
    href: '/guides/free-framer-portfolio-templates/',
    title: 'Best free Framer portfolio templates',
    description: 'Ten free Framer portfolio templates for designers, photographers and studios.',
    group: 'article',
    kind: 'Roundup',
    updated: 'November 3, 2026',
  },
  {
    href: '/guides/framer-saas-app-templates/',
    title: 'Best free Framer SaaS and app templates',
    description: 'Free Framer templates for SaaS products, AI tools and mobile app launches.',
    group: 'article',
    kind: 'Roundup',
    updated: 'November 3, 2026',
  },
];
