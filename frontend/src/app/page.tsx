import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import { getAllPosts } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/queries";
import BlogListClient from "./BlogListClient";

// Fallback ISR window — on-demand revalidation webhook handles instant updates
export const revalidate = 60;

export default async function Page() {
  let initialPosts: BlogPost[] = [];

  try {
    // Cache hit if blogs/[slug] page built first — 0 extra Strapi calls
    initialPosts = await getAllPosts();
  } catch {
    // Server fetch failed — BlogListClient will show empty state
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
