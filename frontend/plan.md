# Strapi to Sanity Migration Plan

## Current System Overview

**Stack:** Next.js App Router + Apollo Client (GraphQL) + Strapi CMS

**Content Types:**
- Blog (title, description, slug, cover, content-as-Markdown, author→Author, category→Category[], writer→User)
- Author (name, avatar, email, blogs→Blog[])
- Category (name, slug, description, blogs→Blog[])
- User (username, email, provider, password, etc.) — Strapi built-in auth, NOT migrated to Sanity

**Key Frontend Files:**
- `src/lib/queries.ts` — GraphQL queries + result types
- `src/lib/types.ts` — TypeScript interfaces
- `src/lib/buildCache.ts` — Server-side cache layer with retry/stale-serve
- `src/lib/apolloClient.ts` — Apollo Client setup
- `src/app/page.tsx` — Blog listing (SSR + ISR 24h)
- `src/app/blogs/[slug]/page.tsx` — Single blog post
- `src/app/category/[documentId]/page.tsx` — Category filter page
- `src/app/search/page.tsx` — Client-side search

**Routing:** Currently uses Strapi `documentId` as URL param (e.g. `/blogs/abc123`)

---

## What Changes (and What Doesn't)

| Concern | Strapi (Current) | Sanity (Target) |
|---------|-------------------|-----------------|
| CMS | Self-hosted Strapi | Sanity Cloud (Content Lake) |
| Query language | GraphQL via Apollo | GROQ via `@sanity/client` or GraphQL |
| Schema definition | Content-Type Builder (GUI) | Code files (`schemas/*.ts`) |
| Rich text content | Markdown (raw string) | Portable Text (structured JSON) |
| Image handling | Raw Strapi URL | Sanity Image CDN + `@sanity/image-url` builder |
| Document IDs | Strapi `documentId` in URLs | Sanity `_id` (auto-generated), use `slug` in URLs instead |
| Auth/User | Strapi users-permissions | Not in Sanity — handle separately or drop |
| Caching | Custom `buildCache.ts` + ISR | Sanity CDN is already cached; use `@sanity/client` built-in CDN |

---

## Step 1: Sanity Schemas (Code Files)

These replace Strapi's Content-Type Builder. Create in `studio-post-palette/schemaTypes/`.

> **Important:** Your existing studio already has `postType.ts` with `name: 'post'` (not `blog`), field `image` (not `cover`), and field `body` (not `content`). The plan aligns with these existing names to minimize frontend churn — and GROQ queries above already use `post` / `image` / `body`.

### `schemas/postType.ts` (update existing — align with current field names)
```typescript
import { defineType, defineField } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'

export const postType = defineType({
  name: 'post',               // Keep existing name — GROQ queries use _type == "post"
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },   // ADD — was missing
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (rule) => rule.required().warning('Alt text is important for SEO'),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',           // Portable Text — already correct
      of: [{ type: 'block' }],
    }),
    // NEW — add these two relations:
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    // NOTE: No "writer" / User reference — Strapi auth concept, not in Sanity.
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'image',
    },
  },
})
```

**What changed vs. current `postType.ts`:**
- Added `description` field (was missing — Strapi Blog has it)
- Added `hotspot: true` + `alt` subfield to `image`
- Added `author` reference and `categories` array-of-references
- Kept `name: 'post'` / `image` / `body` to match existing GROQ and minimize frontend churn

**Key differences from Strapi:**
- `body` is Portable Text (`array of block`), NOT a Markdown string (`richtext`)
- `author` is a single `reference` (not `manyToOne` relation), points to `author` doc
- `categories` is an array of references (replaces `manyToMany` relation)
- `image` has `hotspot: true` for focal-point cropping
- No `writer` field — Strapi's User was auth; Sanity auth is separate
- Auto `_createdAt` / `_updatedAt` exist on all Sanity docs (no need to define)

### `schemas/author.ts`
```typescript
import { defineType, defineField } from 'sanity'
import { UserIcon } from '@sanity/icons/User'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', media: 'avatar' },
  },
})
```

### `schemas/category.ts`
```typescript
import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons/Tag'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'description' },
  },
})
```

---

## Step 2: Replace Apollo Client with Sanity Client

**Delete:** `src/lib/apolloClient.ts`

**Status:** `next-sanity` and `@sanity/image-url` are **already installed** in `frontend/package.json`. You already have `src/sanity/client.ts` with `projectId: "xxv30rrb"` / `dataset: "production"`, but `useCdn: false` needs to change to `true` for production ISR pages (keep `false` only inside `generateStaticParams`). See `image.md` reference for the recommended pattern.

**Action:** Update existing `src/sanity/client.ts`:

```typescript
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, // "xxv30rrb"
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-05-15', // Keep existing, or bump to current date
  useCdn: true,             // Sanity CDN = faster, already cached
})

// Image URL builder — uses hotspot/crop data automatically
import createImageUrlBuilder from '@sanity/image-url'

const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
})

export const urlFor = (source: any) => builder.image(source)
```

For `generateStaticParams`, override per-request:

```typescript
const slugs = await client.withConfig({ useCdn: false }).fetch(SLUGS_QUERY)
```

**Create:** `src/sanity/image.ts` (optional, for `next/image` integration — see `image.md`)

> `next-sanity` already provides `defineQuery`, `PortableText`, `SanityLive`, and Visual Editing hooks.

---

## Step 3: Replace GraphQL Queries with GROQ Queries

**Replace** `src/lib/queries.ts` entirely. Example:

```typescript
import { defineQuery } from 'next-sanity'

// 1. GET_ALL_POSTS (listing page)
export const ALL_POSTS_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current)] | order(_createdAt desc) [0...100] {
    _id,
    title,
    "slug": slug.current,
    description,
    image {
      asset->{ url, metadata { lqip, dimensions } },
      alt,
      hotspot,
      crop
    },
    "author": author->{ name, email },
    categories[]->{ _id, name, "slug": slug.current, description },
    _createdAt,
    _updatedAt
  }
`)

// 2. GET_ALL_POSTS_FULL (with Portable Text body, for buildCache)
export const ALL_POSTS_FULL_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current)] | order(_createdAt desc) [0...100] {
    _id,
    title,
    "slug": slug.current,
    description,
    body,
    image {
      asset->{ url, metadata { lqip, dimensions } },
      alt,
      hotspot,
      crop
    },
    "author": author->{ name, email },
    categories[]->{ _id, name, "slug": slug.current, description },
    _createdAt,
    _updatedAt
  }
`)

// 3. GET_POST_BY_SLUG (replaces GET_POST_BY_DOCUMENT_ID)
export const POST_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    body,
    image {
      asset->{ url, metadata { lqip, dimensions } },
      alt,
      hotspot,
      crop
    },
    "author": author->{ name, email },
    categories[]->{ _id, name, "slug": slug.current, description },
    _createdAt,
    _updatedAt
  }
`)

// 4. GET_ALL_CATEGORIES
export const ALL_CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[_type == "category" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    _createdAt,
    _updatedAt
  }
`)

// 5. GET_BLOGS_BY_SEARCH (replaces Strapi's containsi filter with GROQ match)
export const BLOGS_BY_SEARCH_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current) && (title match $query || description match $query)] | order(_createdAt desc) [0...50] {
    _id,
    title,
    "slug": slug.current,
    description,
    image {
      asset->{ url },
      alt
    },
    categories[]->{ _id, name, "slug": slug.current },
    _createdAt
  }
`)

// 6. POSTS_BY_CATEGORY (filter by category _ref for performance)
export const POSTS_BY_CATEGORY_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && $catId in categories[]._ref] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    image {
      asset->{ url },
      alt
    },
    _createdAt
  }
`)
```

**GROQ performance notes:**
- `defined(slug.current)` is an optimizable filter (uses indexes)
- `slug.current == $slug` is optimizable
- Use `_ref` comparison in filters instead of `->field` (avoids expensive reference resolution)
- `/* groq */` comment prefix enables VS Code syntax highlighting
- Order BEFORE slice: `| order(...)[0...100]` not `[0...100] | order(...)`
- `match` is GROQ's full-text search operator (replaces Strapi's `containsi`)

---

## Step 4: Replace Types

**What changes in `src/lib/types.ts`:**

| Current field | New field | Notes |
|---------------|-----------|-------|
| `documentId: string` | `_id: string` | Sanity auto-generates `_id` |
| `content: string` (Markdown) | `body: PortableTextBlock[]` | Matches existing studio `body` field |
| `cover: ImageData` | `image: SanityImage` | Matches existing studio `image` field |
| `category: Category[]` (singular name) | `categories: Category[]` | Pluralized |
| `writer: Writer` | **Removed** | Strapi auth user — not in Sanity |
| `publishedAt` | `publishedAt` + `_createdAt` | Studio has `publishedAt: datetime` |

**Replace** `src/lib/types.ts` key interfaces:

```typescript
import type { PortableTextBlock } from 'next-sanity'

export interface SanityImage {
  asset?: {
    _id?: string
    url?: string
    metadata?: {
      lqip?: string
      dimensions?: { width: number; height: number }
    }
  }
  alt?: string
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export interface Author {
  _id?: string
  name: string
  email?: string | null
  avatar?: SanityImage
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string | null
  _createdAt?: string
  _updatedAt?: string
}

export interface BlogPost {
  _id: string              // was documentId
  title: string
  slug: string             // now always present (filtered by defined(slug.current))
  description?: string | null
  body?: PortableTextBlock[]  // was content: string (Markdown), now Portable Text
  image?: SanityImage | null  // was cover: ImageData
  author?: Author | null
  categories?: Category[]  // was category (singular name)
  publishedAt?: string
  _createdAt?: string
  _updatedAt?: string
}

// Remove Writer interface — Strapi auth concept, not in Sanity
```

---

## Step 5: Replace buildCache.ts

**Replace** the Apollo-based cache with Sanity client calls. Key changes:
- `client.query<>({ query: X })` → `client.fetch(QUERY)`
- Cache lookups now by **slug** (not documentId) to match slug-based routing
- Sanity's `useCdn: true` already provides CDN caching, but in-memory cache adds resilience

**Import path:** `@/lib/apolloClient` → `@/sanity/client` (your existing Sanity client location)

```typescript
import { client } from '@/sanity/client'
import {
  ALL_POSTS_FULL_QUERY,
  ALL_CATEGORIES_QUERY,
} from '@/lib/queries'
import type { BlogPost, Category } from '@/lib/types'

let postsCache: BlogPost[] | null = null
let categoriesCache: Category[] | null = null
let postsFetchPromise: Promise<BlogPost[]> | null = null
let categoriesFetchPromise: Promise<Category[]> | null = null
let postsCachedAt = 0
let categoriesCachedAt = 0

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

const postBySlugCache = new Map<string, BlogPost>()
const postsByCategorySlugCache = new Map<string, BlogPost[]>()

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
    }
  }
  throw new Error('Retry failed')
}

export function clearBuildCache() {
  postsCache = null
  categoriesCache = null
  postsFetchPromise = null
  categoriesFetchPromise = null
  postsCachedAt = 0
  categoriesCachedAt = 0
  postBySlugCache.clear()
  postsByCategorySlugCache.clear()
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const now = Date.now()
  if (postsCache && now - postsCachedAt < CACHE_TTL_MS) return postsCache
  if (postsFetchPromise) return postsFetchPromise

  postsFetchPromise = (async () => {
    try {
      const data = await fetchWithRetry(() =>
        client.fetch<BlogPost[]>(ALL_POSTS_FULL_QUERY)
      )

      const posts = data ?? []

      if (posts.length === 0 && !data) {
        console.warn('⚠️ getAllPosts: empty response from Sanity, keeping stale cache')
        return postsCache ?? []
      }

      postsCache = posts
      postsCachedAt = Date.now()
      postBySlugCache.clear()
      postsByCategorySlugCache.clear()

      for (const post of posts) {
        if (post.slug) postBySlugCache.set(post.slug, post)
        for (const cat of post.categories ?? []) {
          if (cat.slug) {
            if (!postsByCategorySlugCache.has(cat.slug)) {
              postsByCategorySlugCache.set(cat.slug, [])
            }
            postsByCategorySlugCache.get(cat.slug)!.push(post)
          }
        }
      }

      return posts
    } catch (err) {
      console.error('❌ Sanity fetch failed — serving stale cache:', err)
      postsCachedAt = Date.now()
      return postsCache ?? []
    } finally {
      postsFetchPromise = null
    }
  })()

  return postsFetchPromise
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return postBySlugCache.get(slug)
}

export function getPostsByCategorySlug(categorySlug: string): BlogPost[] {
  return postsByCategorySlugCache.get(categorySlug) ?? []
}

export async function getAllCategories(): Promise<Category[]> {
  const now = Date.now()
  if (categoriesCache && now - categoriesCachedAt < CACHE_TTL_MS) return categoriesCache
  if (categoriesFetchPromise) return categoriesFetchPromise

  categoriesFetchPromise = (async () => {
    try {
      const data = await fetchWithRetry(() =>
        client.fetch<Category[]>(ALL_CATEGORIES_QUERY)
      )
      const categories = data ?? []

      if (categories.length === 0 && !data) {
        console.warn('⚠️ getAllCategories: empty response from Sanity, keeping stale cache')
        return categoriesCache ?? []
      }

      categoriesCache = categories
      categoriesCachedAt = Date.now()
      return categoriesCache
    } catch (err) {
      console.error('❌ Sanity categories fetch failed — serving stale cache:', err)
      categoriesCachedAt = Date.now()
      return categoriesCache ?? []
    } finally {
      categoriesFetchPromise = null
    }
  })()

  return categoriesFetchPromise
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoriesCache?.find((c) => c.slug === slug)
}
```

**Rename callers:**
- `getPostById(slug)` → `getPostBySlug(slug)`
- `getPostsByCategory(id)` → `getPostsByCategorySlug(slug)`
- `getCategoryById(id)` → `getCategoryBySlug(slug)`

---

## Step 6: Replace Markdown Rendering with Portable Text

**This is the biggest frontend change.** Your `BlogPostClient` currently uses `react-markdown` to render a Markdown string (`post.content`).

Sanity stores rich text as Portable Text in `post.body`. The existing studio `body` field is already `array of block` — no schema change needed there.

You need (if not already installed):

```bash
npm install @portabletext/react
```
> `next-sanity` re-exports `PortableText`, so `import { PortableText } from 'next-sanity'` also works.

**Replace** the `<Markdown>` component in `src/app/blogs/[slug]/BlogPostClient.tsx`:

```tsx
import { PortableText } from 'next-sanity'
import type { PortableTextComponents } from 'next-sanity'
import { urlFor } from '@/sanity/client'

// Define typed components — structure MUST be: block: {}, types: {}, marks: {}, list: {}
const components: PortableTextComponents = {
  // Block styles (paragraphs, headings) — nested under "block"
  block: {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-teal-400 mt-10 mb-4 border-b border-teal-800 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold text-teal-300 mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-teal-300 mt-6 mb-2">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold text-teal-200 mt-4 mb-2">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-teal-600 pl-4 italic text-gray-300 my-4">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
    ),
  },

  // Custom types (non-text blocks like images) — nested under "types"
  types: {
    image: ({ value }) => (
      <img
        src={urlFor(value).width(800).fit('crop').url()}
        alt={value.alt || ''}
        className="rounded-lg my-6"
      />
    ),
    // Code blocks — replaces the Markdown pre/code handling with copy button
    code: ({ value }) => (
      <pre
        className="bg-slate-900 border border-slate-800 rounded-lg p-4 my-4 overflow-x-auto cursor-pointer relative group"
        onClick={(e) => handleCopyCode(e.currentTarget.innerText)}
      >
        <code className="text-teal-300 text-sm block whitespace-pre">{value.code}</code>
      </pre>
    ),
  },

  // Marks (inline: bold, italic, links) — nested under "marks"
  marks: {
    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value.href}
        className="text-teal-400 underline hover:text-teal-300"
        target={!value.href.startsWith('/') ? '_blank' : undefined}
        rel={!value.href.startsWith('/') ? 'noreferrer noopener' : undefined}
      >
        {children}
      </a>
    ),
  },

  // Lists — nested under "list"
  list: {
    bullet: ({ children }) => <ul className="list-disc ml-6 mb-4 text-gray-300">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal ml-6 mb-4 text-gray-300">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="ml-2">{children}</li>,
    number: ({ children }) => <li className="ml-2">{children}</li>,
  },
}

// In BlogPostClient, replace:
//   <Markdown remarkPlugins={[...]} rehypePlugins={[...]}>{post.content}</Markdown>
// With:
<PortableText value={post.body} components={components} />
```

**Also update** prop usage: `post.content` → `post.body`, `post.cover` → `post.image` throughout the file.

**Remove:** `react-markdown`, `remark-gfm`, `remark-breaks`, `rehype-raw` dependencies.

> **Tip:** For a simpler approach, wrap `<PortableText>` in `<div className="prose prose-invert">` using `@tailwindcss/typography` (already installed) instead of manually styling every block.

---

## Step 7: Routing Changes

**Critical:** Your current routes use `documentId` as URL param. Sanity's auto-generated `_id` is ugly and not SEO-friendly.

**Change routes from:**
- `/blogs/[slug]` where slug = Strapi documentId (e.g. `abc123`)
- `/category/[documentId]` where documentId = Strapi documentId (e.g. `zxhivhcsvvo4bwsv8lrijpop`)

**To:**
- `/blogs/[slug]` where slug = Sanity `slug.current` (e.g. "my-first-post") — **no folder rename needed**
- `/category/[slug]` where slug = Sanity category slug (e.g. "technology") — **requires folder rename** `[documentId]` → `[slug]`

Slug-based URLs are human-readable and SEO-friendly.

**Files that generate links with documentId (must switch to slug):**

| File | Current | Target |
|------|---------|--------|
| `src/app/blogs/[slug]/page.tsx` | `params.slug` = documentId, `getPostById(slug)` | `params.slug` = slug string, `getPostBySlug(slug)` |
| `src/app/category/[documentId]/page.tsx` | `params.documentId`, `getCategoryById`, `getPostsByCategory` | `params.slug`, `getCategoryBySlug`, `getPostsByCategorySlug` |
| `src/app/BlogListClient.tsx` | `href={`/blogs/${post.documentId}`}` (×2) | `href={`/blogs/${post.slug}`}` |
| `src/app/category/[documentId]/CategoryClient.tsx` | `href={`/blogs/${post.documentId}`}`, `getImageUrl` with Strapi | `href={`/blogs/${post.slug}`}`, `urlFor(post.image)` |
| `src/app/search/SearchClient.tsx` | `href={`/blogs/${post.documentId}`}`, `key={post.documentId}` | `href={`/blogs/${post.slug}`}`, `key={post._id}` or `key={post.slug}` |
| `src/components/Navbar.tsx` | Hardcoded `documentId` map (6 categories) | Hardcoded `slug` map (same 6 labels) |
| `src/components/Footer.tsx` | Hardcoded `documentId` map + `href={`/category/${documentId}`}` | `href={`/category/${slug}`}` |
| `src/app/api/revalidate/route.ts` | `body.entry.category[].documentId`, `revalidatePath("/category/[documentId]")` | `body.entry.slug`, `revalidatePath("/category/[slug]")` |

**In pages after migration:**
- `params.slug` maps to `slug.current` (GROQ returns it as `slug`)
- `generateStaticParams()` queries all slugs: `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`
- `generateStaticParams()` should use `client.withConfig({ useCdn: false })` for fresh data at build time

**Navbar/Footer hardcoded categories** — Replace documentIds with slugs:

```typescript
const categories = [
  { label: "Gaming", slug: "gaming" },
  { label: "Tech", slug: "tech" },
  { label: "Food", slug: "food" },
  { label: "Nature", slug: "nature" },
  { label: "Culture", slug: "culture" },
  { label: "Entertainment", slug: "entertainment" },
]
```

---

## Step 8: Image Handling Changes

**Current patterns to replace:**

| File | Current helper | What it does |
|------|---------------|--------------|
| `BlogPostClient.tsx` | `buildAssetUrl(path)` | Prepends `NEXT_PUBLIC_STRAPI_URL` |
| `CategoryClient.tsx` | `getImageUrl(url)` | Same pattern |
| `BlogListClient.tsx` | Inline ternary `startsWith("http") ? url : STRAPI_URL + url` | Same pattern |
| `SearchClient.tsx` | Inline ternary (same) | Same pattern |

**New:** Use `@sanity/image-url` (already installed) via `urlFor()` from `src/sanity/client.ts`:

```typescript
import { urlFor } from '@/sanity/client'

// Before:
<img src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${post.cover?.url}`} />

// After:
<img src={urlFor(post.image).width(800).fit('crop').url()} alt={post.image?.alt || post.title} />
```

Benefits:
- Auto WebP/AVIF serving from Sanity CDN
- Hotspot-aware cropping (studio `image` field should add `options: { hotspot: true }`)
- LQIP blur placeholders: query `asset->{ metadata { lqip, dimensions } }` then use `placeholder="blur"` with `next/image`
- For `CategoryClient.tsx` which already uses `next/image`, keep `next/image` but swap the `src`:

```tsx
import { urlFor } from '@/sanity/client'

<Image
  src={urlFor(post.image).width(400).url()}
  alt={post.image?.alt || post.title}
  fill
  className="object-cover"
/>
```

**Studio fix needed:** The existing `postType.ts` has `image: { type: 'image' }` without hotspot. Add `options: { hotspot: true }` and an `alt` field (see Step 1).

---

## Step 9: Environment Variables

```env
# Remove (after migration is complete):
NEXT_PUBLIC_STRAPI_URL=...
NEXT_PUBLIC_STRAPI_GRAPHQL_URL=...

# Add (already have projectId "xxv30rrb" — just need to wire it):
NEXT_PUBLIC_SANITY_PROJECT_ID=xxv30rrb
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...  # Only if using Live Content API / draft previews
```

> `RESEND_API_KEY`, `ADMIN_EMAIL`, `CLOUDFLARE_*`, `REVALIDATE_SECRET` remain unchanged — the revalidate and contact routes stay, just with updated internals.

---

## Step 10: Data Migration (Content)

You need to migrate existing blog content from Strapi to Sanity. Options:

1. **Manual** — Recreate in Sanity Studio (only if few posts)
2. **Script** — Write a migration script:
   - Fetch all posts from Strapi GraphQL API
   - Convert Markdown content → Portable Text blocks (use `@portabletext/markdown` or `marked` + `@portabletext/block-tools`)
   - Upload cover images to Sanity Asset Pipeline
   - Create documents in Sanity via `@sanity/client`
3. **Sanity CLI import** — Export Strapi data as JSON, transform, import

---

## File Change Summary

| Action | File | Detail |
|--------|------|--------|
| **UPDATE** | `studio-post-palette/schemaTypes/postType.ts` | Add `hotspot: true`, `alt` field, `author` ref, `categories` refs |
| **CREATE** | `studio-post-palette/schemaTypes/authorType.ts` | Author schema |
| **CREATE** | `studio-post-palette/schemaTypes/categoryType.ts` | Category schema |
| **UPDATE** | `studio-post-palette/schemaTypes/index.ts` | Export all three types |
| **UPDATE** | `frontend/src/sanity/client.ts` | Set `useCdn: true`, add `urlFor` builder |
| **REWRITE** | `frontend/src/lib/queries.ts` | GROQ via `defineQuery` from `next-sanity` (6 queries) |
| **REWRITE** | `frontend/src/lib/types.ts` | `documentId`→`_id`, `content`→`body`, `cover`→`image` |
| **REWRITE** | `frontend/src/lib/buildCache.ts` | Sanity `client.fetch` + slug-keyed Maps |
| **REWRITE** | `frontend/src/app/blogs/[slug]/page.tsx` | `getPostBySlug`, `withConfig({ useCdn: false })` in `generateStaticParams` |
| **RENAME+REWRITE** | `frontend/src/app/category/[documentId]/` → `[slug]/` | `getCategoryBySlug`, `getPostsByCategorySlug` |
| **MODIFY** | `frontend/src/app/blogs/[slug]/BlogPostClient.tsx` | PortableText + `post.body`/`post.image` + `urlFor` |
| **MODIFY** | `frontend/src/app/BlogListClient.tsx` | `post.slug` links + `urlFor(post.image)` |
| **MODIFY** | `frontend/src/app/category/[slug]/CategoryClient.tsx` | `post.slug` links + `urlFor(post.image)` |
| **MODIFY** | `frontend/src/app/search/SearchClient.tsx` | `post.slug` links/keys + `urlFor` |
| **MODIFY** | `frontend/src/components/Navbar.tsx` | Hardcoded `slug` map instead of `documentId` |
| **MODIFY** | `frontend/src/components/Footer.tsx` | Hardcoded `slug` map + `href={`/category/${slug}`}` |
| **MODIFY** | `frontend/src/app/api/revalidate/route.ts` | Sanity webhook payload + slug-based purge paths |
| **UPDATE** | `frontend/.env` / `.env.local` | Add `NEXT_PUBLIC_SANITY_PROJECT_ID`, keep others |
| **DELETE** | `frontend/src/lib/apolloClient.ts` | After migration complete |
| **DELETE** | `react-markdown`, `remark-gfm`, `remark-breaks`, `rehype-raw` | After PortableText works |
| **ALREADY INSTALLED** | `next-sanity`, `@sanity/image-url` | No install needed |

**Not migrated (out of scope for this phase):**

| Content | Decision |
|---------|----------|
| `About` singleType (dynamiczone) | Keep Strapi or rebuild as Sanity `about` singleton later |
| `Global` singleType (siteName, favicon, seo) | Keep Strapi or rebuild as Sanity `settings` singleton later |
| `shared.*` components (media, quote, slider, etc.) | Only if About/Global are migrated |
| `User` / `writer` relation | Dropped — Strapi auth concept, not in Sanity |
| `/about` page | Currently hardcoded, no CMS dependency — no change needed |

---

## Migration Order

1. Update Sanity schemas — patch `postType.ts`, create `authorType.ts` + `categoryType.ts`, deploy (`npm run build` in `studio-post-palette/` auto-deploys via `autoUpdates: true`)
2. Update `src/sanity/client.ts` — flip `useCdn` + add `urlFor` (Step 2)
3. Write GROQ queries — replace `src/lib/queries.ts` (Step 3)
4. Update TypeScript types — `src/lib/types.ts` (Step 4)
5. Migrate content — Strapi → Sanity via script (Step 10 — biggest task, do before frontend changes so you can test against real data)
6. Update `buildCache.ts` — Sanity client + slug-keyed Maps (Step 5)
7. Replace Markdown with Portable Text — `BlogPostClient.tsx` (Step 6)
8. Update routing — folder rename + all link sites (Step 7)
9. Update image handling — `urlFor` across 4 components (Step 8)
10. Update env vars — add `NEXT_PUBLIC_SANITY_PROJECT_ID` (Step 9)
11. Update `api/revalidate` — Sanity webhook payload (Step 7 table)
12. Remove old Apollo deps — `src/lib/apolloClient.ts` + `react-markdown` family
13. Test everything — `npm run build` must pass, verify ISR + revalidation

> Studio already exists at `studio-post-palette/` with `projectId: "xxv30rrb"` — no `npx sanity init` needed.
