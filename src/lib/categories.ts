import type { CollectionEntry } from 'astro:content';
import categories from '../data/categories.json';

type Template = CollectionEntry<'templates'>;

// A category gets its own search page only with 2 or more templates: a page with one template
// would repeat that template's page. Smaller categories still work in the catalog filter.
const MIN_TEMPLATES_FOR_PAGE = 2;

export const inCategory = (all: Template[], slug: string) => all.filter((t) => t.data.types.includes(slug));

// Categories that have at least one template, in the order of the list.
export const usedCategories = (all: Template[]) => categories.filter((c) => inCategory(all, c.slug).length > 0);

export const categoryPages = (all: Template[]) =>
  categories.filter((c) => inCategory(all, c.slug).length >= MIN_TEMPLATES_FOR_PAGE);

export const categoryHref = (slug: string) => `/templates/category/${slug}/`;
