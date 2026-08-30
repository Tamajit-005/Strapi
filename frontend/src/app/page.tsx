import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import { getAllPosts } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/types";
import BlogListClient from "./BlogListClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Page() {
  const initialPosts: BlogPost[] = await getAllPosts();
  return (
    <Suspense fallback={<div className="w-full flex items-center justify-center min-h-screen bg-slate-950"><Loader /></div>}>
      <BlogListClient initialPosts={initialPosts} />
    </Suspense>
  );
}
