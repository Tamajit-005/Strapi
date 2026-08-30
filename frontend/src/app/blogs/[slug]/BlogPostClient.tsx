"use client";

import { useRouter } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { BlogPost } from "@/lib/types";
import { urlFor } from "@/sanity/image";
import moment from "moment";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  post: BlogPost;
}

function CodeBlock({ value }: any) {
  const [copied, setCopied] = useState(false);
  const raw: unknown = value?.code;
  const text = typeof raw === "string" ? raw : raw != null ? String(raw) : "";

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="relative group my-6">
      <pre
        className="bg-slate-900 border border-slate-800 rounded-lg p-4 pr-12 overflow-x-auto cursor-pointer hover:border-slate-700 transition-colors"
        onClick={doCopy}
        title="Tap to copy"
      >
        <code className="text-teal-300 text-sm block whitespace-pre font-mono">{text}</code>
      </pre>
      <button
        onClick={doCopy}
        aria-label="Copy code"
        title={copied ? "Copied!" : "Tap to copy"}
        className="absolute top-2 right-2 p-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 transition-colors"
      >
        {copied ? <Check size={16} className="text-teal-400" /> : <Copy size={16} />}
      </button>
    </div>
  );
}

const portableComponents = {
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-bold text-teal-400 mt-10 mb-4 border-b border-teal-800 pb-2">{children}</h1>
    ),
    h2: ({ children }: any) => <h2 className="text-3xl font-bold text-teal-400 mt-8 mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-2xl font-semibold text-teal-400 mt-6 mb-2">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-xl font-semibold text-teal-400 mt-6 mb-2">{children}</h4>,
    h5: ({ children }: any) => <h5 className="text-lg font-semibold text-teal-400 mt-4 mb-2">{children}</h5>,
    h6: ({ children }: any) => <h6 className="text-base font-semibold text-teal-400 mt-4 mb-2">{children}</h6>,
    normal: ({ children }: any) => <p className="text-gray-300 leading-relaxed my-3">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-teal-500 pl-4 ml-2 italic text-gray-400 my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside my-4 pl-2 text-gray-300 space-y-1">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside my-4 pl-2 text-gray-300 space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="ml-2">{children}</li>,
    number: ({ children }: any) => <li className="ml-2">{children}</li>,
  },
  marks: {
    code: ({ children }: any) => (
      <code className="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ),
    strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    underline: ({ children }: any) => <u className="underline decoration-teal-500">{children}</u>,
    link: ({ children, value }: any) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-300 underline decoration-teal-600 underline-offset-4 decoration-2 hover:text-teal-200 hover:decoration-teal-400 transition-colors"
      >
        {children}↗
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      return (
        <img
          src={urlFor(value).width(800).url()}
          alt={value.alt || ""}
          title={value.alt || undefined}
          className="rounded-lg w-full my-4 object-cover max-h-125"
          loading="lazy"
        />
      );
    },
    code: CodeBlock,
  },
};

export default function BlogPostClient({ post }: Props) {
  const router = useRouter();
  const coverUrl = post.image ? urlFor(post.image).width(1200).url() : undefined;

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
          className="text-4xl leading-15 text-center font-bold text-teal-400 capitalize"
        >
          {post.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full flex items-center justify-center font-light text-gray-400 mt-1"
        >
          {post.publishedAt ? `Published ${moment(post.publishedAt).fromNow()}` : ""}
        </motion.div>

        {post.categories && post.categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap space-x-2 my-4 justify-center"
          >
            {post.categories.map((cat) => (
              <span
                key={cat._id}
                className="border border-teal-800 text-teal-300 px-2 py-1 text-sm rounded bg-teal-950/40 font-medium"
              >
                {cat.name}
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
              alt={post.image?.alt || ""}
              title={post.image?.alt || undefined}
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
          {post.body ? <PortableText value={post.body} components={portableComponents as any} /> : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center justify-center text-gray-400 font-light mb-6 mt-10 text-sm"
        >
          {post.author?.name && (
            <p>
              Written by <span className="font-medium text-teal-300">{post.author.name}</span> —{" "}
              {moment(post.publishedAt).fromNow()}
            </p>
          )}
          {post.author?.email && (
            <p className="mt-1">
              Contact:{" "}
              <a href={`mailto:${post.author.email}`} className="text-teal-300 hover:underline">
                {post.author.email}
              </a>
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full flex justify-center mt-8"
        >
          <button onClick={() => router.back()} className="text-teal-500 font-medium hover:underline">
            ← Back to Blogs
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
