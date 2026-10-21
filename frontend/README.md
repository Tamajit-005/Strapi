# Post Palette — Frontend

Next.js 15 (App Router) frontend for **Post Palette**. Content comes from Sanity, card colors from a MongoDB collection, and the site is styled with Tailwind CSS v4.

## Stack

- Next.js 15 · React 18 · TypeScript
- Tailwind CSS v4
- Sanity (`next-sanity`) + a Sanity Studio in `../studio-post-palette` (Sanity 6.20, React 19)
- MongoDB (mongoose) — per-post card colors
- Framer Motion, `lucide-react` and `react-icons` for icons and motion

## Scripts

```bash
npm run dev     # dev server on http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

## Environment

Copy `.env.example` to `.env` and fill in the values.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project id (falls back to the baked-in default) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (falls back to the baked-in default) |
| `NEXT_PUBLIC_PAGE_LIMIT` | Posts per page on listings, search and category pages (default 10) |
| `MONGODB_URI` | MongoDB connection for card colors |
| `RESEND_API_KEY`, `ADMIN_EMAIL` | Contact form delivery |
| `REVALIDATE_SECRET` | Secret for the revalidate webhook |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` | CDN cache purge on revalidate |

`NEXT_PUBLIC_*` values are inlined at build time — rebuild after changing them.

## Routes

| Route | File |
| --- | --- |
| `/` | `src/app/page.tsx` — latest posts |
| `/blogs/[slug]` | `src/app/blogs/[slug]/page.tsx` |
| `/category/[slug]` | `src/app/category/[slug]/page.tsx` |
| `/search` | `src/app/search/page.tsx` — `?query=&page=` |
| `/about`, `/contact` | `src/app/about`, `src/app/contact` |
| `POST /api/contact` | Contact form submission |
| `POST /api/revalidate?secret=…` | Sanity webhook: clears the build cache, revalidates pages, purges Cloudflare |

## Structure

```
src/app        routes (pages, API handlers) + global CSS
src/components Navbar, Footer, PostBrowser, SearchBar, Pagination, CategoryPills, Loader
src/lib        Sanity queries, in-memory build cache, Mongo connection + model, types
src/sanity     client + image URL builder
```

## Notes

- **Caching:** content comes from a 5-minute in-memory cache (`src/lib/buildCache.ts`) over Next's Data Cache (24h, tagged `posts`/`categories`). The routes stay dynamic (`revalidate = 0`) because the listing reads the URL, so the served HTML always matches the request — a static route would drop the cards from the HTML.
- `POST /api/revalidate` clears the in-memory cache, invalidates the `posts`/`categories` tags, revalidates the routes and purges Cloudflare. Point the Sanity webhook at it.
