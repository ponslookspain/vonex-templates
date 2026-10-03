// Line icons on a 24x24 grid, drawn with a stroke. One source for Icon and InlineIcon.
// To add an icon: add its path data here, then use <Icon name="…" />.
export const icons = {
  pick: ['M9 9l5.5 13 2.2-5.3L22 14.5 9 9z', 'M5 5l2 2M3 10h3M10 3v3M14.5 5l-2 2'],
  remix: ['M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5'],
  make: ['M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'],
  ship: [
    'M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z',
    'M12 15 9 12a22 22 0 0 1 2-4 12.9 12.9 0 0 1 11-6c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z',
    'M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5',
  ],
  responsive: ['M3 4h13v10H3zM7.5 18H12M9.75 14v4', 'M18 9h2.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5H18a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5z'],
  blocks: ['M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'],
  tag: ['M3 12V4h8l10 10-8 8L3 12z', 'M7.5 7.5h.01'],
  sparkles: [
    'M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z',
    'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z',
  ],
  check: ['M5 12l5 5L20 7'],
  arrow: ['M5 12h14M13 6l6 6-6 6'],
  lock: ['M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z'],
  plus: ['M12 5v14M5 12h14'],
} satisfies Record<string, string[]>;

export type IconName = keyof typeof icons;
