import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import { getAllPosts } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/queries";
import BlogListClient from "./BlogListClient";

// ISR window
export const revalidate = 60;

// Force static rendering (good for CDN)
export const dynamic = "force-static";

export default async function Page() {
  const initialPosts: BlogPost[] = await getAllPosts();

  // ❌ If data is empty → throw error (prevents bad cache)
  if (!initialPosts || initialPosts.length === 0) {
    throw new Error("❌ Failed to fetch posts — preventing empty cache");
  }

  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center min-h-screen bg-slate-950">
          <Loader />
        </div>
      }
    >
      <BlogListClient initialPosts={initialPosts} />
    </Suspense>
  );
}
