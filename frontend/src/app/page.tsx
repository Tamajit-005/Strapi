import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import { getAllPosts } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/types";
import BlogListClient from "./BlogListClient";

// Dynamic on purpose: BlogListClient reads ?page= via useSearchParams, so a static
// route would drop the cards from the HTML. The data itself comes from the 24h cache.
export const revalidate = 0;

export default async function Page() {
  const initialPosts: BlogPost[] = await getAllPosts();
  return (
    <Suspense fallback={<div className="w-full flex items-center justify-center min-h-screen bg-black"><Loader /></div>}>
      <BlogListClient initialPosts={initialPosts} />
    </Suspense>
  );
}
