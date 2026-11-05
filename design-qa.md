# Interior redesign — design QA

Date: 2026-11-05. Final result: passed.

The approved review board and the production build were compared at 1100 × 760 on the split-case diesel product, catalog page 2, and application overview. The product was also compared at 390 × 844. Captures are retained locally under `.migration/interior-release-2026-11-05/`.

- Typography and colors: same system font, navy and red palette, heading hierarchy and visible control states. Catalog titles retain the approved bold weight. The archived-data note uses live wording.
- Spacing and layout: product gallery and specs share the desktop row and stack on mobile. Catalog cards retain their spacing and order. Pagination now opens the next URL at the top, verified with a real page-2 click.
- Images and icons: the same real product images, case thumbnails, and line icons are used. Application covers load above the fold. The application hero uses the approved illustrative image with a separate caption.
- Copy and behavior: gallery thumbnails, keyboard-capable product tabs, the 29-row model table, desktop image menu, mobile menu, filter and scoped search were checked. The inquiry link preselects the product; delivery is explicitly unavailable.
- Responsive checks: 17 representative pages at 390 px, four key pages at 320 and 640 px. No page-level horizontal overflow was found; the wide technical table scrolls within its panel.
- Release checks: `pnpm lint` and `pnpm build` passed. All 2,240 canonical archive URLs, including the homepage and 89 pagination routes, returned 200 from the local production build. Canonicals and indexing signals matched the existing rules; 2,041 sitemap URLs were identical. Homepage header, main and footer matched the production baseline once deployment cache query keys were removed.

Production follow-up: the first Vercel build rendered its generic 404 for an unlisted catch-all path. The archive route now explicitly disables runtime generation for unlisted slugs. The local production build returns HTTP 404 with the designed page, and the full archive and sitemap checks passed again.
