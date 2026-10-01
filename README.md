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
- `public/assets`: local content images.
- `src/app/legacy.css` and `public/images`: styles and decorative assets used to preserve the existing page layouts.
- `public/hero`: new brand-neutral hero artwork.
- `src/components`: shared header, footer, hero, and page renderer.
- `src/config/identity.ts`: new brand and contact fields to fill later.

## Before public launch

Replace the brand placeholder, company-specific copy, certifications, contact details, social links, and form delivery settings. Set `NEXT_PUBLIC_SITE_URL` to the new domain. The current inquiry blocks are intentionally inactive until a new destination is configured.
