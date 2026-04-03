import { client } from "@/lib/apolloClient";
import {
  GET_ALL_POSTS_FULL,
  GET_ALL_CATEGORIES,
  type GetAllPostsFullResult,
  type GetAllCategoriesResult,
  type BlogPost,
  type Category,
} from "@/lib/queries";

// ─── Module-level singletons ───────────────────────────────────────────────
// Node.js modules are singletons within a process.
// During `next build`, all pages share this same module instance,
// so whichever page calls first populates the cache — the rest get it free.

let postsCache: BlogPost[] | null = null;
let categoriesCache: Category[] | null = null;

const postByIdCache = new Map<string, BlogPost>();
const postsByCategoryCache = new Map<string, BlogPost[]>();

// ─── Mapper ────────────────────────────────────────────────────────────────
function mapToBlogPost(
  blog: GetAllPostsFullResult["blogs"][number],
): BlogPost {
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
      ? {
          username: blog.writer.username,
          email: blog.writer.email ?? undefined,
        }
      : undefined,
    category: blog.category ?? undefined,
  };
}

// ─── Posts ─────────────────────────────────────────────────────────────────
// 1 Strapi call total for the entire build — all post pages reuse this cache

export async function getAllPosts(): Promise<BlogPost[]> {
  if (postsCache) return postsCache;

  const { data } = await client.query<GetAllPostsFullResult>({
    query: GET_ALL_POSTS_FULL,
  });

  const posts = (data?.blogs ?? []).map(mapToBlogPost);
  postsCache = posts;

  // Populate secondary lookup caches in the same pass
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
}

export function getPostById(documentId: string): BlogPost | undefined {
  return postByIdCache.get(documentId);
}

export function getPostsByCategory(categoryDocumentId: string): BlogPost[] {
  return postsByCategoryCache.get(categoryDocumentId) ?? [];
}

// ─── Categories ────────────────────────────────────────────────────────────
// 1 Strapi call total — category pages reuse this cache

export async function getAllCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;

  const { data } = await client.query<GetAllCategoriesResult>({
    query: GET_ALL_CATEGORIES,
  });

  categoriesCache = (data?.categories ?? []).map((c) => ({
    documentId: c.documentId,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
  }));

  return categoriesCache;
}

export function getCategoryById(documentId: string): Category | undefined {
  return categoriesCache?.find((c) => c.documentId === documentId);
}