import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import { client } from "@/lib/apolloClient";
import {
  GET_ALL_POSTS,
  type GetAllPostsResult,
  type BlogPost,
} from "@/lib/queries";
import BlogListClient from "./BlogListClient";

// Fallback ISR window — on-demand revalidation webhook handles instant updates
export const revalidate = 60;

export default async function Page() {
  let initialPosts: BlogPost[] = [];

  try {
    const { data } = await client.query<GetAllPostsResult>({
      query: GET_ALL_POSTS,
    });
    initialPosts = (data?.blogs ?? []) as BlogPost[];
  } catch {
    // Server fetch failed — BlogListClient will show empty state
  }

  return (
    // Suspense required because BlogListClient uses useSearchParams()
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
