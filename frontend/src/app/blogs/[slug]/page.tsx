import { notFound } from "next/navigation";
import { client } from "@/lib/apolloClient";
import {
  GET_POST_BY_DOCUMENT_ID,
  type GetPostByDocumentIdResult,
} from "@/lib/queries";
import { getAllPosts, getPostById } from "@/lib/buildCache";
import type { BlogPost } from "@/lib/types";
import BlogPostClient from "./BlogPostClient";

// ISR fallback window — webhook handles instant updates
export const revalidate = 3600;

// Allow new posts (published after last build) to be rendered on first visit
export const dynamicParams = true;

// Pre-render all known posts at build time for best performance and SEO

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.documentId }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Build-time: cache hit → 0 Strapi calls
  // Runtime cold-start: cache miss → fallback fetch below
  let post: BlogPost | undefined = getPostById(slug);

  if (!post) {
    const { data } = await client.query<GetPostByDocumentIdResult>({
      query: GET_POST_BY_DOCUMENT_ID,
      variables: { documentId: slug },
      fetchPolicy: "no-cache",
    });

    if (!data?.blog) notFound();

    const blog = data.blog;

    post = {
      documentId: slug,
      title: blog.title,
      slug: blog.slug ?? undefined,
      description: blog.description ?? undefined,
      content: blog.content ?? undefined,
      createdAt: blog.createdAt ?? undefined,
      updatedAt: blog.updatedAt ?? undefined,
      cover: blog.cover?.url ? { url: blog.cover.url } : undefined,
      author: blog.author
        ? { name: blog.author.name, email: blog.author.email ?? undefined }
        : undefined,
      writer: blog.writer
        ? {
            username: blog.writer.username,
            email: blog.writer.email ?? undefined,
          }
        : undefined,
      category: blog.category ?? undefined,
    };
  }

  return <BlogPostClient post={post} />;
}
