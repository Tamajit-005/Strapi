import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getPostBySlugFetch } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/types";
import BlogPostClient from "./BlogPostClient";

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

  return <BlogPostClient post={post} />;
}
