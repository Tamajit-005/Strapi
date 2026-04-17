import React, { Suspense } from "react";
import SearchClient from "./SearchClient";
import Loader from "@/components/Loader";
import { client } from "@/lib/apolloClient";
import { getAllPosts } from "@/lib/buildCache";
import { GET_ALL_POSTS, type GetAllPostsResult } from "@/lib/queries";
import type { BlogPost } from "@/lib/types";

// Optional but recommended for consistency
export const dynamic = "force-static";
export const revalidate = 60;

function mapPosts(posts: GetAllPostsResult["blogs"]): BlogPost[] {
  return posts.map((post) => ({
    documentId: post.documentId,
    title: post.title,
    slug: post.slug ?? undefined,
    description: post.description ?? undefined,
    createdAt: post.createdAt ?? undefined,
    updatedAt: post.updatedAt ?? undefined,
    cover: post.cover?.url ? { url: post.cover.url } : undefined,
    author: post.author ? { name: post.author.name } : undefined,
    writer: post.writer ? { username: post.writer.username } : undefined,
    category: post.category?.map((c) => ({
      documentId: c.documentId,
      name: c.name,
    })),
  }));
}

export default async function SearchPage() {
  let allPosts = await getAllPosts();

  // Fallback only if build cache came back empty
  if (!allPosts.length) {
    try {
      const { data } = await client.query<GetAllPostsResult>({
        query: GET_ALL_POSTS,
        fetchPolicy: "no-cache",
      });

      allPosts = mapPosts(data?.blogs ?? []);
    } catch {
      allPosts = [];
    }
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <Loader />
        </div>
      }
    >
      <SearchClient allPosts={allPosts} />
    </Suspense>
  );
}
