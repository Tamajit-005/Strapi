"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { type BlogPost } from "@/lib/types";
import { urlFor } from "@/sanity/image";
import BlogPagination from "@/components/Pagination";
import { motion } from "framer-motion";
import moment from "moment";
import { ChevronDown, ArrowRight } from "lucide-react";

interface Props {
  initialPosts: BlogPost[];
}

export default function BlogListClient({ initialPosts }: Props) {
  const [allPosts] = useState<BlogPost[]>(initialPosts);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [sortOpen, setSortOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get("page");
  const parsedPage = parseInt(pageParam || "1");
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_LIMIT || "10");

  const sortedPosts = useMemo(() => {
    return [...allPosts].sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [allPosts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / pageSize));

  const currentSlice = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedPosts.slice(startIndex, startIndex + pageSize);
  }, [sortedPosts, currentPage, pageSize]);

  const featuredPost = currentSlice[0];
  const regularPosts = currentSlice.slice(1);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    router.replace(`?${newParams.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!sortedPosts.length)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#02050a]">
        <p className="text-center text-gray-400">No posts found.</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-[#02050a] min-h-screen"
    >
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* ── Featured Post (hero card) ── */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/blogs/${featuredPost.slug}`}>
              <div className="relative w-full rounded-2xl overflow-hidden cursor-pointer group" style={{ minHeight: "420px" }}>
                {/* Background image */}
                {featuredPost.image && (
                  <img
                    src={urlFor(featuredPost.image).width(1200).url()}
                    alt={featuredPost.image.alt || ""}
                    title={featuredPost.image.alt || undefined}
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.58] group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                {/* Gradient overlays — lighter for brighter hero */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12" style={{ minHeight: "420px" }}>
                  {/* LATEST STORY label */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                    <span className="text-teal-400 text-xs font-bold uppercase tracking-[0.15em]">Latest Story</span>
                  </div>

                  {/* Category badge */}
                  {featuredPost.categories && featuredPost.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredPost.categories.map((cat) => (
                        <span
                          key={cat._id}
                          className="inline-block bg-teal-500/90 text-gray-900 text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-3xl md:text-[42px] font-bold text-white mb-3 leading-tight max-w-3xl font-serif">
                    {featuredPost.title}
                  </h1>

                  {/* Teal underline */}
                  <div className="w-14 h-0.75 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.6)] mb-5" />

                  {/* Description */}
                  <p className="text-gray-300 text-[15px] md:text-base leading-relaxed max-w-2xl mb-6 line-clamp-3">
                    {featuredPost.description}
                  </p>

                  {/* Author + date */}
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
                    {featuredPost.author?.name && (
                      <span className="text-gray-200 font-medium">{featuredPost.author.name}</span>
                    )}
                    {featuredPost.author?.name && featuredPost.publishedAt && (
                      <span className="text-gray-600">•</span>
                    )}
                    {featuredPost.publishedAt && (
                      <span suppressHydrationWarning>{moment(featuredPost.publishedAt).format("MMM D, YYYY")}</span>
                    )}
                  </div>

                  {/* Read Full Story button */}
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-2 border border-teal-400 text-teal-400 text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-teal-400 hover:text-gray-900 transition-all duration-300 group/btn">
                      Read Full Story
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── All Stories section ── */}
        <div className="mt-14">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">All Stories</h2>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                Sort by: <span className="text-teal-400">{sortBy === "latest" ? "Latest" : "Oldest"}</span>
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl border border-white/10 bg-[#080c18] backdrop-blur-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => { setSortBy("latest"); setSortOpen(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm transition ${sortBy === "latest" ? "text-teal-400 bg-teal-500/10" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => { setSortBy("oldest"); setSortOpen(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-sm transition ${sortBy === "oldest" ? "text-teal-400 bg-teal-500/10" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                  >
                    Oldest
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post cards — grid like reference photo */}
          {regularPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {regularPosts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.4 }}
                  className="h-full"
                >
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="group flex flex-col h-full rounded-2xl overflow-hidden border border-white/5 bg-[#080c18] hover:border-teal-500/25 transition-all duration-300 hover:shadow-[0_0_40px_rgba(45,212,191,0.08)] hover:-translate-y-1"
                  >
                    {/* Image — top */}
                    {post.image && (
                      <div className="relative w-full h-52 shrink-0 overflow-hidden">
                        <img
                          src={urlFor(post.image).width(600).url()}
                          alt={post.image.alt || ""}
                          title={post.image.alt || undefined}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#080c18]/70 to-transparent" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-6">
                      {/* Category badge */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.map((cat) => (
                            <span
                              key={cat._id}
                              className="inline-block text-teal-400 text-[11px] font-bold uppercase tracking-wider bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-teal-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                        {post.description}
                      </p>

                      {/* Author + date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-4 border-t border-white/5">
                        {post.author?.name && (
                          <span className="text-gray-300 font-medium">{post.author.name}</span>
                        )}
                        {post.author?.name && post.publishedAt && (
                          <span>•</span>
                        )}
                        {post.publishedAt && (
                          <span suppressHydrationWarning>{moment(post.publishedAt).format("MMM D, YYYY")}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-10">No more posts on this page.</p>
          )}
        </div>

        {/* ── Pagination ── */}
        {sortedPosts.length > pageSize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-14"
          >
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/"
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
