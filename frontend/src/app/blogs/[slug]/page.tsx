import { notFound } from "next/navigation";
import { type BlogPost } from "@/lib/queries";
import { getAllPosts, getPostById } from "@/lib/buildCache";
import BlogPostClient from "./BlogPostClient";

// ISR window
export const revalidate = 3600;

// Force static rendering (important for CDN + ISR)
export const dynamic = "force-static";

// Generate all static paths at build time
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((p) => ({
    slug: p.documentId,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ONLY read from cache (no API calls)
  const post: BlogPost | undefined = getPostById(slug);

  // ❌ If not found → don't fetch → just 404
  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}
