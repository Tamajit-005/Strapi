import { client } from "@/sanity/client";
import {
  ALL_POSTS_FULL_QUERY,
  ALL_CATEGORIES_QUERY,
  POST_BY_SLUG_QUERY,
  POSTS_BY_CATEGORY_QUERY,
  SEARCH_POSTS_QUERY,
} from "@/lib/queries";
import type { BlogPost, Category } from "@/lib/types";

let postsCache: BlogPost[] | null = null;
let categoriesCache: Category[] | null = null;

let postsFetchPromise: Promise<BlogPost[]> | null = null;
let categoriesFetchPromise: Promise<Category[]> | null = null;

let postsCachedAt: number = 0;
let categoriesCachedAt: number = 0;

const CACHE_TTL_MS = 0; // TEMP: cache disabled for dev — restore to 24*60*60*1000 before production

const postBySlugCache = new Map<string, BlogPost>();
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
  postBySlugCache.clear();
  postsByCategoryCache.clear();
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const now = Date.now();
  if (postsCache && now - postsCachedAt < CACHE_TTL_MS) return postsCache;
  if (postsFetchPromise) return postsFetchPromise;

  postsFetchPromise = (async () => {
    try {
      const posts = await fetchWithRetry(() =>
        client.fetch<BlogPost[]>(ALL_POSTS_FULL_QUERY, {}, { cache: "no-store" } as any),
      );

      if (!posts || posts.length === 0) {
        console.warn("⚠️ getAllPosts: empty response from Sanity, keeping stale cache");
        return postsCache ?? [];
      }

      postsCache = posts;
      postsCachedAt = Date.now();
      postBySlugCache.clear();
      postsByCategoryCache.clear();

      for (const post of posts) {
        if (post.slug) postBySlugCache.set(post.slug, post);
        for (const cat of post.categories ?? []) {
          if (!postsByCategoryCache.has(cat.slug)) {
            postsByCategoryCache.set(cat.slug, []);
          }
          postsByCategoryCache.get(cat.slug)!.push(post);
        }
      }

      return posts;
    } catch (err) {
      console.error("❌ getAllPosts failed — serving stale cache:", err);
      postsCachedAt = Date.now();
      return postsCache ?? [];
    } finally {
      postsFetchPromise = null;
    }
  })();

  return postsFetchPromise;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return postBySlugCache.get(slug);
}

// Backwards-compat alias — old code used documentId, now slug
export const getPostById = getPostBySlug;

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  return postsByCategoryCache.get(categorySlug) ?? [];
}

export async function getPostBySlugFetch(slug: string): Promise<BlogPost | null> {
  try {
    const post = await client.fetch<BlogPost | null>(
      POST_BY_SLUG_QUERY,
      { slug },
      { cache: "no-store" } as any,
    );
    return post;
  } catch (err) {
    console.error(`❌ getPostBySlugFetch(${slug}) failed:`, err);
    return getPostBySlug(slug) ?? null;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const now = Date.now();
  if (categoriesCache && now - categoriesCachedAt < CACHE_TTL_MS) return categoriesCache;
  if (categoriesFetchPromise) return categoriesFetchPromise;

  categoriesFetchPromise = (async () => {
    try {
      const categories = await fetchWithRetry(() =>
        client.fetch<Category[]>(ALL_CATEGORIES_QUERY, {}, { next: { revalidate: 86400 } }),
      );

      if (!categories || categories.length === 0) {
        console.warn("⚠️ getAllCategories: empty response from Sanity, keeping stale cache");
        return categoriesCache ?? [];
      }

      categoriesCache = categories;
      categoriesCachedAt = Date.now();
      return categoriesCache;
    } catch (err) {
      console.error("❌ getAllCategories failed — serving stale cache:", err);
      categoriesCachedAt = Date.now();
      return categoriesCache ?? [];
    } finally {
      categoriesFetchPromise = null;
    }
  })();

  return categoriesFetchPromise;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoriesCache?.find((c) => c.slug === slug);
}

// Backwards-compat alias
export const getCategoryById = getCategoryBySlug;

export async function searchPosts(searchQuery: string): Promise<BlogPost[]> {
  if (!searchQuery.trim()) return [];
  try {
    const posts = await client.fetch<BlogPost[]>(
      SEARCH_POSTS_QUERY,
      { query: searchQuery } as any,
      { cache: "no-store" } as any,
    );
    return posts ?? [];
  } catch (err) {
    console.error(`❌ searchPosts(${searchQuery}) failed:`, err);
    return [];
  }
}

export async function getPostsByCategoryFetch(categorySlug: string): Promise<BlogPost[]> {
  try {
    const posts = await client.fetch<BlogPost[]>(
      POSTS_BY_CATEGORY_QUERY,
      { slug: categorySlug },
      { cache: "no-store" } as any,
    );
    return posts ?? [];
  } catch (err) {
    console.error(`❌ getPostsByCategoryFetch(${categorySlug}) failed:`, err);
    return getPostsByCategory(categorySlug);
  }
}
