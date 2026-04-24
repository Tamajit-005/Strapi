import { client } from "@/lib/apolloClient";
import {
  GET_ALL_POSTS_FULL,
  GET_ALL_CATEGORIES,
  type GetAllPostsFullResult,
  type GetAllCategoriesResult,
  type BlogPost,
  type Category,
} from "@/lib/queries";

let postsCache: BlogPost[] | null = null;
let categoriesCache: Category[] | null = null;

// In-flight deduplication: if a fetch is already running, reuse the same promise
let postsFetchPromise: Promise<BlogPost[]> | null = null;
let categoriesFetchPromise: Promise<Category[]> | null = null;

// Timestamps to track when cache was last successfully populated
// Used to serve stale data when Strapi is down (free plan cold starts)
let postsCachedAt: number = 0;
let categoriesCachedAt: number = 0;

// Must match revalidate = 3600 in page.tsx
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const postByIdCache = new Map<string, BlogPost>();
const postsByCategoryCache = new Map<string, BlogPost[]>();

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
  throw new Error("Retry failed");
}

export function clearBuildCache() {
  postsCache = null;
  categoriesCache = null;
  postsFetchPromise = null;
  categoriesFetchPromise = null;
  postsCachedAt = 0;
  categoriesCachedAt = 0;
  postByIdCache.clear();
  postsByCategoryCache.clear();
}

function mapToBlogPost(blog: GetAllPostsFullResult["blogs"][number]): BlogPost {
  return {
    documentId: blog.documentId,
    title: blog.title,
    slug: blog.slug ?? undefined,
    description: blog.description ?? undefined,
    content: blog.content ?? undefined,
    createdAt: blog.createdAt ?? undefined,
    updatedAt: blog.updatedAt ?? undefined,
    cover: blog.cover?.url ? { url: blog.cover.url } : undefined,
    author: blog.author
      ? { name: blog.author.name, email: blog.author.email ?? undefined }
      : undefined,
    writer: blog.writer
      ? { username: blog.writer.username, email: blog.writer.email ?? undefined }
      : undefined,
    category: blog.category ?? undefined,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const now = Date.now();

  // Return cache if it exists AND is still within TTL
  // After TTL expires, fall through to re-fetch even if postsCache is non-null
  if (postsCache && now - postsCachedAt < CACHE_TTL_MS) return postsCache;

  // Deduplicate: if a fetch is already in-flight, wait for it instead of firing a second GraphQL request
  if (postsFetchPromise) return postsFetchPromise;

  postsFetchPromise = (async () => {
    try {
      const { data } = await fetchWithRetry(() =>
        client.query<GetAllPostsFullResult>({
          query: GET_ALL_POSTS_FULL,
          fetchPolicy: "no-cache",
        }),
      );

      const posts = (data?.blogs ?? []).map(mapToBlogPost);

      if (posts.length === 0 && !data?.blogs) {
        console.warn("⚠️ getAllPosts: empty response from Strapi, keeping stale cache");
        // Strapi returned nothing — keep whatever we had before
        return postsCache ?? [];
      }

      postsCache = posts;
      postsCachedAt = Date.now(); // ← stamp successful fetch time
      postByIdCache.clear();
      postsByCategoryCache.clear();

      for (const post of posts) {
        postByIdCache.set(post.documentId, post);
        for (const cat of post.category ?? []) {
          if (!postsByCategoryCache.has(cat.documentId)) {
            postsByCategoryCache.set(cat.documentId, []);
          }
          postsByCategoryCache.get(cat.documentId)!.push(post);
        }
      }

      return posts;
    } catch (err) {
      console.error("❌ getAllPosts failed — serving stale cache:", err);
      // Strapi is down (cold start on free plan):
      // - Serve existing stale data so pages don't go empty
      // - Stamp the time so we don't hammer a sleeping Strapi on every request for the next hour — wait for next TTL window to retry
      postsCachedAt = Date.now();
      return postsCache ?? [];
    } finally {
      // Clear in-flight promise so the next TTL window can trigger a fresh fetch
      postsFetchPromise = null;
    }
  })();

  return postsFetchPromise;
}

export function getPostById(documentId: string): BlogPost | undefined {
  return postByIdCache.get(documentId);
}

export function getPostsByCategory(categoryDocumentId: string): BlogPost[] {
  return postsByCategoryCache.get(categoryDocumentId) ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const now = Date.now();

  // Return cache if it exists AND is still within TTL
  if (categoriesCache && now - categoriesCachedAt < CACHE_TTL_MS) return categoriesCache;

  // Deduplicate in-flight category fetches
  if (categoriesFetchPromise) return categoriesFetchPromise;

  categoriesFetchPromise = (async () => {
    try {
      const { data } = await fetchWithRetry(() =>
        client.query<GetAllCategoriesResult>({
          query: GET_ALL_CATEGORIES,
          fetchPolicy: "no-cache",
        }),
      );

      const categories = (data?.categories ?? []).map((c) => ({
        documentId: c.documentId,
        name: c.name,
        slug: c.slug,
        description: c.description ?? undefined,
      }));

      if (categories.length === 0 && !data?.categories) {
        console.warn("⚠️ getAllCategories: empty response from Strapi, keeping stale cache");
        return categoriesCache ?? [];
      }

      categoriesCache = categories;
      categoriesCachedAt = Date.now(); // ← stamp successful fetch time
      return categoriesCache;
    } catch (err) {
      console.error("❌ getAllCategories failed — serving stale cache:", err);
      // Same pattern: serve stale, stamp time to prevent retry storm
      categoriesCachedAt = Date.now();
      return categoriesCache ?? [];
    } finally {
      categoriesFetchPromise = null;
    }
  })();

  return categoriesFetchPromise;
}

export function getCategoryById(documentId: string): Category | undefined {
  return categoriesCache?.find((c) => c.documentId === documentId);
}