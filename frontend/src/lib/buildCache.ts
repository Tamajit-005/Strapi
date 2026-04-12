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
  postByIdCache.clear();
  postsByCategoryCache.clear();
}

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

export async function getAllPosts(): Promise<BlogPost[]> {
  if (postsCache) return postsCache;

  try {
    const { data } = await fetchWithRetry(() =>
      client.query<GetAllPostsFullResult>({
        query: GET_ALL_POSTS_FULL,
        fetchPolicy: "no-cache",
      }),
    );

    const posts = (data?.blogs ?? []).map(mapToBlogPost);
    postsCache = posts;

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
    console.error("❌ getAllPosts failed:", err);
    postsCache = [];
    return [];
  }
}

export function getPostById(documentId: string): BlogPost | undefined {
  return postByIdCache.get(documentId);
}

export function getPostsByCategory(categoryDocumentId: string): BlogPost[] {
  return postsByCategoryCache.get(categoryDocumentId) ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;

  try {
    const { data } = await fetchWithRetry(() =>
      client.query<GetAllCategoriesResult>({
        query: GET_ALL_CATEGORIES,
        fetchPolicy: "no-cache",
      }),
    );

    categoriesCache = (data?.categories ?? []).map((c) => ({
      documentId: c.documentId,
      name: c.name,
      slug: c.slug,
      description: c.description ?? undefined,
    }));

    return categoriesCache;
  } catch (err) {
    console.error("❌ getAllCategories failed:", err);
    categoriesCache = [];
    return [];
  }
}

export function getCategoryById(documentId: string): Category | undefined {
  return categoriesCache?.find((c) => c.documentId === documentId);
}