// Single place for site-wide settings. To add a page or a tool, add an entry to `nav`
// and create a file in src/pages/.
export const site = {
  name: 'Vonex Design',
  tagline: 'Framer templates, designed with care.',
  description:
    'Minimal, modern Framer templates by Vonex Design. Browse the collection and remix any template on Framer.',
  framerProfile: 'https://www.framer.com/@vonexdesign/',
  email: '',
  socials: [] as { label: string; href: string }[],
};

export const nav = [
  { label: 'Templates', href: '/templates/' },
  { label: 'Framer profile', href: site.framerProfile, external: true },
];
