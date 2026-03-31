import { notFound } from "next/navigation";
import { client } from "@/lib/apolloClient";
import {
  GET_ALL_POSTS,
  GET_POST_BY_DOCUMENT_ID,
  type GetAllPostsResult,
  type GetPostByDocumentIdResult,
} from "@/lib/queries";
import type { BlogPost } from "@/lib/types";
import BlogPostClient from "./BlogPostClient";

// Fallback ISR window — on-demand revalidation webhook handles instant updates
export const revalidate = 3600;

// Called once at build — generates a static HTML page per post
export async function generateStaticParams() {
  const { data } = await client.query<GetAllPostsResult>({
    query: GET_ALL_POSTS,
  });
  return (data?.blogs ?? []).map((b) => ({ slug: b.documentId }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data } = await client.query<GetPostByDocumentIdResult>({
    query: GET_POST_BY_DOCUMENT_ID,
    variables: { documentId: slug },
  });

  const blog = data?.blog;
  if (!blog) notFound();

  // Map GQL result → BlogPost shape (same logic as the old useEffect)
  const post: BlogPost = {
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

  return <BlogPostClient post={post} />;
}
