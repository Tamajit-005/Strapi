import { notFound } from "next/navigation";
import { client } from "@/lib/apolloClient";
import {
  GET_POST_BY_DOCUMENT_ID,
  type GetPostByDocumentIdResult,
  type BlogPost,
} from "@/lib/queries";
import { getAllPosts, getPostById } from "@/lib/buildCache";
import BlogPostClient from "./BlogPostClient";

// Fallback ISR window — on-demand revalidation webhook handles instant updates
export const revalidate = 3600;

// 1 API call for all slugs — populates the entire build cache
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

  // Cache hit → 0 API calls (normal build after generateStaticParams ran)
  let post: BlogPost | undefined = getPostById(slug);

  // Cache miss → 1 API call (on-demand revalidation via webhook)
  if (!post) {
    const { data } = await client.query<GetPostByDocumentIdResult>({
      query: GET_POST_BY_DOCUMENT_ID,
      variables: { documentId: slug },
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
