"use client";

import { useRouter } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { BlogPost } from "@/lib/types";
import { urlFor } from "@/sanity/image";
import moment from "moment";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Plus, Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Oswald } from "next/font/google";

const titleFont = Oswald({ weight: "600", subsets: ["latin"] });

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
        className="bg-black/10 rounded-lg p-4 pr-12 overflow-x-auto cursor-pointer transition-colors"
        onClick={doCopy}
        title="Tap to copy"
      >
        <code className="text-black text-sm block whitespace-pre font-mono">{text}</code>
      </pre>
      <button
        onClick={doCopy}
        aria-label="Copy code"
        title={copied ? "Copied!" : "Tap to copy"}
        className="absolute top-2 right-2 p-2 rounded-md bg-black/10 hover:bg-black/20 text-black transition-colors"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

export default function BlogPostClient({ post }: Props) {
  const router = useRouter();
  const coverUrl = post.image ? urlFor(post.image).width(1000).url() : undefined;
  const color = post.cardColor || "#EB4F2F";

  /* Lock background scroll while the overlay is open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const portableComponents = {
    block: {
      h1: ({ children }: any) => (
        <h1 className={`${titleFont.className} text-3xl uppercase leading-[0.95] text-black mt-8 mb-3`}>{children}</h1>
      ),
      h2: ({ children }: any) => (
        <h2 className={`${titleFont.className} text-2xl uppercase leading-none text-black mt-7 mb-3`}>{children}</h2>
      ),
      h3: ({ children }: any) => (
        <h3 className={`${titleFont.className} text-xl uppercase text-black mt-6 mb-2`}>{children}</h3>
      ),
      h4: ({ children }: any) => <h4 className="text-lg font-bold text-black mt-5 mb-2">{children}</h4>,
      h5: ({ children }: any) => <h5 className="text-base font-bold text-black mt-4 mb-2">{children}</h5>,
      h6: ({ children }: any) => <h6 className="text-sm font-bold text-black mt-4 mb-2">{children}</h6>,
      normal: ({ children }: any) => <p className="text-black/85 leading-relaxed my-3.5 text-[15px]">{children}</p>,
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-black pl-4 ml-2 italic text-black/70 my-4">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: any) => (
        <ul className="list-disc list-inside my-4 pl-2 text-black/85 space-y-1">{children}</ul>
      ),
      number: ({ children }: any) => (
        <ol className="list-decimal list-inside my-4 pl-2 text-black/85 space-y-1">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }: any) => <li className="ml-2">{children}</li>,
      number: ({ children }: any) => <li className="ml-2">{children}</li>,
    },
    marks: {
      code: ({ children }: any) => (
        <code className="bg-black/10 text-black px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
      ),
      strong: ({ children }: any) => <strong className="font-bold text-black">{children}</strong>,
      em: ({ children }: any) => <em className="italic">{children}</em>,
      underline: ({ children }: any) => <u className="underline">{children}</u>,
      link: ({ children, value }: any) => (
        <a
          href={value?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black font-semibold underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity"
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
            className="rounded-xl w-full my-4 object-cover"
            loading="lazy"
          />
        );
      },
      code: CodeBlock,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-40 overflow-y-auto bg-black/60 backdrop-blur-xl"
    >
      <div className="w-full px-4 pt-28 md:pt-32 pb-16">
        {/* ── Article card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-167.5 rounded-2xl"
          style={{ backgroundColor: color }}
        >
          <div className="p-3 sm:p-8">
            {/* Title + close */}
            <header className="flex flex-col gap-y-3.5 mb-10">
              <div className="flex justify-between gap-x-3.5">
                <h1 className={`${titleFont.className} text-4xl xl:text-5xl uppercase leading-[0.95] text-black text-ellipsis overflow-hidden`}>
                  {post.title}
                </h1>
                <button
                  onClick={() => router.back()}
                  aria-label="Close article"
                  title="Close"
                  className="rotate-45 shrink-0 flex items-center justify-center w-9 h-9 text-black hover:opacity-60 transition-opacity"
                >
                  <span className="flex items-center justify-center w-9 h-9 border border-current border-solid rounded-full">
                    <Plus size={20} />
                  </span>
                </button>
              </div>

              {/* Category pills */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex gap-x-1 gap-y-2 flex-wrap">
                  {post.categories.map((cat) => (
                    <span
                      key={cat._id}
                      className="inline-block text-[11px] font-normal px-4 py-2 rounded-full uppercase tracking-[0.14em] text-black border border-black"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="uppercase text-xs mt-1 mb-1 flex flex-col gap-1 text-black/70 font-semibold tracking-wider">
                {post.publishedAt && (
                  <span suppressHydrationWarning>{moment(post.publishedAt).format("MMM D, YYYY")}</span>
                )}
                {post.author?.name && <span>By {post.author.name}</span>}
              </div>
            </header>

            {/* Hero image */}
            {coverUrl && (
              <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                <img
                  src={coverUrl}
                  alt={post.image?.alt || ""}
                  title={post.image?.alt || undefined}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            {post.description && (
              <p className="text-black/85 leading-relaxed mt-6 mb-2 text-base font-semibold">
                {post.description}
              </p>
            )}

            {/* Body */}
            <div className="w-full leading-relaxed">
              {post.body ? <PortableText value={post.body} components={portableComponents as any} /> : null}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
