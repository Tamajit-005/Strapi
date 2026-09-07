import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllPosts, getPostBySlug, getPostBySlugFetch } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/types";
import BlogPostClient from "./BlogPostClient";
import BlogListClient from "@/app/BlogListClient";
import Loader from "@/components/Loader";

// TEMP: no cache for dev — restore 86400 before production
export const revalidate = 0;
export const dynamic = "force-dynamic";

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: BlogPost | undefined = getPostBySlug(slug);

  if (!post) {
    const fetched = await getPostBySlugFetch(slug);
    if (!fetched) notFound();
    post = fetched;
  }

  const allPosts: BlogPost[] = await getAllPosts();

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
