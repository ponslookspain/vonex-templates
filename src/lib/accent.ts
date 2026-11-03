// Headlines set one word in italic serif, like "Selected *templates*." The page passes the
// title and the word; this returns safe HTML with that word wrapped in .type-accent.
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function withAccent(title: string, word?: string): string {
  const safe = escape(title);
  if (!word) return safe;
  const i = title.indexOf(word);
  if (i < 0) return safe;
  return escape(title.slice(0, i)) + `<em class="type-accent">${escape(word)}</em>` + escape(title.slice(i + word.length));
}
