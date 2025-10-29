"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/types";
import { getPostByDocumentId } from "@/lib/api";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Loader from "@/components/Loader";
import moment from "moment";
import { toast } from "react-hot-toast";

const handleCopyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy code: ", err);
    toast.error("Failed to copy code!");
  }
};

function buildAssetUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  return `${base}${path}`;
}

const BlogPostPage = () => {
  const router = useRouter();
  const params = useParams();

  // Extract slug param (assumed to be documentId per your API)
  const slug = useMemo(() => {
    const raw = (params as Record<string, unknown>)?.slug;
    return Array.isArray(raw) ? raw[0] : ((raw as string) ?? "");
  }, [params]);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      if (!slug) {
        setError("Invalid post identifier");
        setLoading(false);
        return;
      }
      try {
        const fetchedPost = await getPostByDocumentId(slug);
        if (!active) return;
        setPost(fetchedPost);
      } catch (err: any) {
        console.error(err);
        if (!active) return;
        setError(err?.message || "Error fetching post.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPost();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!post)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-gray-300">No post found.</p>
      </div>
    );

  const coverUrl = buildAssetUrl(post.cover?.url);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-gray-200">
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-4xl leading-[60px] capitalize text-center font-bold text-teal-500 font-jet-brains">
          {post.title}
        </h1>

        <div className="w-full flex items-center justify-center font-light text-gray-400 mt-1">
          {post.createdAt
            ? `Published ${moment(post.createdAt).fromNow()}`
            : ""}
        </div>

        {post.category && post.category.length > 0 && (
          <div className="flex flex-wrap space-x-2 my-4 justify-center">
            {post.category.map(({ name, documentId }) => (
              <span
                key={documentId}
                className="border border-teal-800 text-teal-300 px-2 py-1 text-sm rounded bg-teal-950/40 font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {coverUrl && (
          <div className="relative h-72 w-full my-6">
            <img
              src={coverUrl}
              alt={post.title}
              className="rounded-lg w-full h-full object-cover"
            />
          </div>
        )}

        {post.description && (
          <p className="text-gray-400 leading-8 tracking-wide italic mt-2 mb-6 text-center">
            {post.description}
          </p>
        )}

        <div className="prose prose-invert max-w-none leading-relaxed">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-teal-400 mt-10 mb-4 border-b border-teal-800 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-teal-300 mt-8 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-medium text-teal-200 mt-6 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 leading-relaxed my-3">{children}</p>
              ),
              code: ({ children }) => (
                <code
                  className="bg-slate-800/70 text-teal-300 px-1 py-0.5 rounded"
                  onClick={() => handleCopyCode(String(children))}
                >
                  {children}
                </code>
              ),
            }}
          >
            {post.content || ""}
          </Markdown>
        </div>

        <div className="flex flex-col items-center justify-center text-gray-400 font-light mb-6 mt-8 text-sm">
          {post.createdAt && (
            <p>
              Published {moment(post.createdAt).fromNow()}
              {post.author?.name && (
                <>
                  {" "}
                  by{" "}
                  <span className="font-medium text-teal-300">
                    {post.author.name}
                  </span>
                </>
              )}
            </p>
          )}
          {post.author?.email && (
            <p className="text-gray-400 mt-1">
              Email:{" "}
              <span className="font-medium text-teal-500">
                {post.author.email}
              </span>
            </p>
          )}
        </div>

        <button
          onClick={() => router.back()}
          className="text-teal-500 mt-4 inline-block hover:underline"
        >
          Back to Blogs
        </button>
      </div>
    </div>
  );
};

export default BlogPostPage;
