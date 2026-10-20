import React, { Suspense } from "react";
import PostBrowser from "@/components/PostBrowser";
import Loader from "@/components/Loader";
import { getAllPosts, getAllCategories } from "@/lib/buildCache";
import type { BlogPost, Category } from "@/lib/types";

// Stays dynamic: the server render must reflect ?query= so the HTML matches the results.
// The data itself is served from the 24h in-memory build cache, so this costs no Sanity call.
export const revalidate = 0;

export default async function SearchPage() {
  const [allPosts, categories]: [BlogPost[], Category[]] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Loader />
        </div>
      }
    >
      <PostBrowser title="Search for" posts={allPosts} categories={categories} filter />
    </Suspense>
  );
}
