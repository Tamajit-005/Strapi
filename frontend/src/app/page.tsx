import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import { getAllPosts } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/queries";
import BlogListClient from "./BlogListClient";

export const revalidate = 60;

export default async function Page() {
  const initialPosts: BlogPost[] = await getAllPosts();

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
