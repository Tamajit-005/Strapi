# Post Palette

A blog where every post gets its own card color. Content lives in Sanity; a Next.js 15 site renders it as a color-blocked post grid with pagination, search and category pages.

## Structure

```
frontend/             Next.js 15 site (App Router, Tailwind CSS v4)
studio-post-palette/  Sanity Studio for writing posts
```

## Run locally

Both packages need `npm install --legacy-peer-deps` (the Sanity client declares a newer Next peer than the site uses).

```bash
# site — http://localhost:3000
cd frontend && cp .env.example .env   # fill in the values
npm run dev

# studio — http://localhost:3333
cd ../studio-post-palette && npm run dev
```

Environment variables are documented in [`frontend/README.md`](frontend/README.md) and listed in [`frontend/.env.example`](frontend/.env.example).

## Deploy

- Site: Vercel, root directory `frontend`.
- Studio: `npm run deploy` in `studio-post-palette` (hosts it on sanity.studio).
- Point a Sanity webhook at `POST /api/revalidate?secret=…` so publishes go live immediately.
