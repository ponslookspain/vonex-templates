# UI8 and Craftwork

Free listings of a Framer template on outside marketplaces. They bring people to the template and to vonexdesign.com. Everything local goes to `.work/marketing/marketplaces/<slug>/` (git-ignored). Talk to Vladimir in Russian.

## Files for a template

| File | What |
| --- | --- |
| `cover.png` | Cover, 1400x600 |
| `detail-1.png` to `detail-4.png` | Previews, 1800x1360 |
| `<slug>-framer.zip` | `README.txt` with the Framer remix link, live preview, steps and support contact |
| `<slug>-ui8.png` | UI8 listing image |

## Craftwork

Follow the author guide at https://craftwork.design/AUTHOR-SKILL.md. Access is an API key in `CRAFTWORK_API_KEY`, created by Vladimir at https://craftwork.design/dashboard/api. Never print it or write it to a file.

- Use the REST API, one pack at a time: upload the zip, create the import with the Framer Marketplace page as `sourceUrl`, then save it as a draft.
- The import takes extra pictures from the Marketplace page, such as other templates. Always replace them with `detail-1.png` to `detail-4.png`.
- Every update of an import replaces the whole draft, so send all fields in one call: name, short description, description, categories, subcategories, tags, compatibility, previews, price.
- Links (Framer preview, Framer remix, website) cannot be set through an import. Add them in the draft form on the site.
- Sending to review is a separate approval by Vladimir. Authors cannot delete packs themselves.
- Read the draft back after every change, and check the gallery by eye.

## UI8

Vladimir uploads the listing himself from the same files.
