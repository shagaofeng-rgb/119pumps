# Industrial pump website

Next.js App Router website prepared for a future brand and domain. The English content and page structure are stored locally. Brand identity, contact details, company claims, and form delivery remain pending until replacement information is supplied.

The local archive contains 2,241 routes: 2,073 pages with imported content and 168 linked pages whose source content was unavailable. Those 168 routes show a content placeholder. Images with the former identity or company certificates were replaced with neutral placeholders. The other language sites are outside this migration.

## Local run

The project requires Node.js 20.9 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:3000`. To test the production build, run `pnpm build` and `pnpm start`.

## Content

- `src/data/site.json`: imported page text, page templates, and local image paths.
- `src/data/interior.json`: structured content and original pagination for the redesigned inner pages. After editing the archive, regenerate it with `python3 scripts/build-interior-data.py` (requires `beautifulsoup4`) and commit the output.
- `public/assets`: local content images.
- `src/app/legacy.css` and `public/images`: existing home styles and assets.
- `src/components/interior`, `src/app/interior.css`, and `public/interior`: shared inner page templates, scoped styles, and assets.
- `public/hero`: new brand-neutral hero artwork.
- `src/components`: shared header, footer, hero, and page renderer.
- `src/config/identity.ts`: new brand and contact fields to fill later.

## Before public launch

Replace the brand placeholder, company-specific copy, certifications, contact details, social links, and form delivery settings. The production canonical origin is `https://www.119pumps.com`, configured in `src/config/site.ts`. Inquiry delivery remains unavailable until a destination is configured. Confirm archived product specifications against model datasheets before using them for selection.

## Google Search Console

The Search Console service account key stays in `.secrets/google-search-console.json`, which Git ignores. The account must have Full user or Owner access to the `sc-domain:119pumps.com` property. To check access or submit the public sitemap after the domain works:

```bash
node scripts/google-search-console.mjs --check
node scripts/google-search-console.mjs --submit
```

The site uses a sitemap for its product and article pages. Google's separate Indexing API is limited to eligible job posting and live video pages.
