import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllPosts, getPostBySlug, getPostBySlugFetch } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/types";
import BlogPostClient from "./BlogPostClient";
import BlogListClient from "@/app/BlogListClient";
import Loader from "@/components/Loader";

// Dynamic on purpose: BlogListClient reads ?page= via useSearchParams, so a static
// route would drop the listing from the HTML. The data itself comes from the 24h cache.
export const revalidate = 0;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // getAllPosts fills the slug cache and the cardColor enrichment; read it
  // after, or a cold instance serves a raw post without its color.
  const allPosts: BlogPost[] = await getAllPosts();

  let post: BlogPost | undefined = getPostBySlug(slug);

  if (!post) {
    const fetched = await getPostBySlugFetch(slug);
    if (!fetched) notFound();
    post = fetched;
  }

  return (
    <>
      {/* Homepage listing behind the overlay (auto-scroll frozen) */}
      <Suspense fallback={<div className="w-full flex items-center justify-center min-h-screen bg-black"><Loader /></div>}>
        <BlogListClient initialPosts={allPosts} disableAutoScroll />
      </Suspense>
      {/* Translucent article overlay */}
      <BlogPostClient post={post} />
    </>
  );
}
