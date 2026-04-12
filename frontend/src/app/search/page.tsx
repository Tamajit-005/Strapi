import React, { Suspense } from "react";
import SearchClient from "./SearchClient";
import Loader from "@/components/Loader";
import { getAllPosts } from "@/lib/buildCache";

// Optional but recommended for consistency
export const dynamic = "force-static";
export const revalidate = 60;

export default async function SearchPage() {
  // Fetch ALL posts once (cached via buildCache)
  const allPosts = await getAllPosts();

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
