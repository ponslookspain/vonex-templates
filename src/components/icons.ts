// Lucide icons (ISC, https://lucide.dev): 24x24 grid, 2px stroke, round caps and joins.
// To add an icon: copy its path data from lucide.dev here, then use <Icon name="…" />.
export const icons = {
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-up-right': ['M7 7h10v10', 'M7 17 17 7'],
  check: ['M20 6 9 17l-5-5'],
  plus: ['M5 12h14', 'M12 5v14'],
  'layout-grid': ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  'grid-3x3': ['M3 3h18v18H3z', 'M3 9h18', 'M3 15h18', 'M9 3v18', 'M15 3v18'],
  menu: ['M4 8h16', 'M4 16h16'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
} satisfies Record<string, string[]>;

export type IconName = keyof typeof icons;
