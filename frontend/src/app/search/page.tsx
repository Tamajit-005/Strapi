import React, { Suspense } from "react";
import SearchClient from "./SearchClient";
import Loader from "@/components/Loader";
import { getAllPosts } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/types";

export const revalidate = 0; // TEMP: no cache for dev
export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const allPosts: BlogPost[] = await getAllPosts();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Loader />
        </div>
      }
    >
      <SearchClient allPosts={allPosts} />
    </Suspense>
  );
}
