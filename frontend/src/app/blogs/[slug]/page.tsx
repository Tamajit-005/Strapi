"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getPostByDocumentId } from "@/lib/api";
import type { BlogPost } from "@/lib/types";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";

import Loader from "@/components/Loader";
import moment from "moment";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const handleCopyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  } catch (err) {
    toast.error("Copy failed");
  }
};

function buildAssetUrl(path?: string) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_STRAPI_URL}${path}`;
}

export default function BlogPostPage() {
  const router = useRouter();
  const params = useParams();

  const slug = useMemo(() => {
    const raw = (params as Record<string, unknown>)?.slug;
    return Array.isArray(raw) ? raw[0] : (raw as string);
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
        <p className="text-gray-300">Post not found.</p>
      </div>
    );

  const coverUrl = buildAssetUrl(post.cover?.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full min-h-screen bg-slate-950 text-gray-200"
    >
      <div className="max-w-3xl mx-auto p-6 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl leading-[60px] text-center font-bold text-teal-400 capitalize"
        >
          {post.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full flex items-center justify-center font-light text-gray-400 mt-1"
        >
          {post.createdAt
            ? `Published ${moment(post.createdAt).fromNow()}`
            : ""}
        </motion.div>

        {post.category && post.category.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap space-x-2 my-4 justify-center"
          >
            {post.category.map(({ name, documentId }) => (
              <span
                key={documentId}
                className="border border-teal-800 text-teal-300 px-2 py-1 text-sm rounded bg-teal-950/40 font-medium"
              >
                {name}
              </span>
            ))}
          </motion.div>
        )}

        {coverUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative h-72 w-full my-6"
          >
            <img
              src={coverUrl}
              alt={post.title}
              className="rounded-lg w-full h-full object-cover"
            />
          </motion.div>
        )}

        {post.description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-gray-400 leading-8 tracking-wide italic mt-2 mb-6 text-center"
          >
            {post.description}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="prose prose-invert max-w-none leading-relaxed"
        >
          <Markdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
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
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-teal-500 pl-4 ml-2 italic text-gray-400 my-4">
                  {children}
                </blockquote>
              ),
              u: ({ children }) => (
                <u className="underline decoration-teal-500">{children}</u>
              ),
              code: ({ children }) => (
                <code
                  className="bg-slate-800/70 text-teal-300 px-2 py-1 rounded block my-3 whitespace-pre"
                  onClick={() => handleCopyCode(String(children))}
                >
                  {children}
                </code>
              ),
              text: ({ children }) =>
                String(children).includes("\n")
                  ? String(children)
                      .split("\n")
                      .map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))
                  : children,
            }}
          >
            {post.content || ""}
          </Markdown>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center justify-center text-gray-400 font-light mb-6 mt-10 text-sm"
        >
          {(post.author?.name || post.writer?.username) && (
            <p>
              Written by{" "}
              <span className="font-medium text-teal-300">
                {post.author?.name || post.writer?.username}
              </span>{" "}
              — {moment(post.createdAt).fromNow()}
            </p>
          )}

          {(post.author?.email || post.writer?.email) && (
            <p className="text-gray-400 mt-1">
              Contact:{" "}
              <span className="font-medium text-teal-500">
                {post.author?.email || post.writer?.email}
              </span>
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full flex justify-center mt-8"
        >
          <button
            onClick={() => router.back()}
            className="text-teal-500 font-medium hover:underline"
          >
            ← Back to Blogs
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
