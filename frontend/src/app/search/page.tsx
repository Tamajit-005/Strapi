import React, { Suspense } from "react";
import SearchClient from "./SearchClient";
import Loader from "@/components/Loader";
import { getAllPosts } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/types";

// Rebuild this static page at most once per hour (ISR fallback)
// Webhook revalidation handles instant updates when posts change
export const revalidate = 86400; // 24 hours

// Force static rendering (important for CDN + ISR)

export default async function SearchPage() {
  const allPosts: BlogPost[] = await getAllPosts();

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
