"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BlogPagination from "@/components/Pagination";
import { motion } from "framer-motion";
import type { BlogPost } from "@/lib/types";
import { urlFor } from "@/sanity/image";
import moment from "moment";

const FALLBACK_COLORS = ["#FF6B35", "#00D4FF", "#FF2D7B", "#FFD700", "#7B2FFF", "#00FF88"];
function fallbackColor(i: number) { return FALLBACK_COLORS[i % FALLBACK_COLORS.length]; }
function darken(hex: string, f: number) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.round(r * (1 - f)).toString(16).padStart(2, "0")}${Math.round(g * (1 - f)).toString(16).padStart(2, "0")}${Math.round(b * (1 - f)).toString(16).padStart(2, "0")}`;
}

interface Props { allPosts: BlogPost[]; }

export default function SearchClient({ allPosts }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawQuery = (searchParams.get("query") || "").trim().toLowerCase();
  const pageFromUrl = Number(searchParams.get("page") || 1);
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const pageSize = 6;

  useEffect(() => { const t = setTimeout(() => setDebouncedQuery(rawQuery), 400); return () => clearTimeout(t); }, [rawQuery]);
  useEffect(() => {
    if (!debouncedQuery) { setSearchResults([]); return; }
    setSearchResults(allPosts.filter((p) => (p.title?.toLowerCase() || "").includes(debouncedQuery) || (p.description?.toLowerCase() || "").includes(debouncedQuery)));
  }, [debouncedQuery, allPosts]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(searchResults.length / pageSize)), [searchResults.length, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [debouncedQuery]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);
  useEffect(() => { const params = new URLSearchParams(); if (debouncedQuery) params.set("query", debouncedQuery); params.set("page", String(currentPage)); router.replace(`/search?${params.toString()}`); }, [currentPage, debouncedQuery, router]);

  const paginatedResults = useMemo(() => { const s = (currentPage - 1) * pageSize; return searchResults.slice(s, s + pageSize); }, [searchResults, currentPage, pageSize]);

  if (!allPosts.length) return <div className="min-h-screen flex items-center justify-center bg-black text-gray-500">No data available</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-white text-center mb-4">Search</h1>
        {debouncedQuery ? (
          <p className="text-center text-gray-400 mb-10">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for{" "}
            <span className="text-white font-semibold">"{debouncedQuery}"</span>
          </p>
        ) : (
          <p className="text-center text-gray-500 mb-10">Enter a search term to find posts.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedResults.map((post, i) => {
            const color = post.cardColor || fallbackColor(i);
            return (
              <motion.div key={post._id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 * i, duration: 0.45 }} className="h-full">
                <Link href={`/blogs/${post.slug}`} className="group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5" style={{ backgroundColor: darken(color, 0.8), border: `1px solid ${darken(color, 0.6)}` }}>
                  {post.image ? (
                    <div className="relative w-full h-56 shrink-0 overflow-hidden">
                      <img src={urlFor(post.image).width(600).url()} alt={post.image.alt || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 mix-blend-multiply opacity-30" style={{ backgroundColor: color }} />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative w-full h-56 shrink-0 flex items-center justify-center" style={{ backgroundColor: darken(color, 0.5) }}>
                      <span className="text-6xl font-black uppercase opacity-20" style={{ color }}>{post.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-6">
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories.map((cat) => (
                          <span key={cat._id} className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest" style={{ backgroundColor: color, color: "#000" }}>{cat.name}</span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-xl font-black uppercase leading-[1.05] mb-3 line-clamp-3" style={{ color }}>{post.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-5 flex-1">{post.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-4 border-t border-white/5">
                      {post.publishedAt && <span suppressHydrationWarning>{moment(post.publishedAt).format("MMM D, YYYY")}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {searchResults.length > pageSize && (
          <div className="mt-12">
            <BlogPagination currentPage={currentPage} totalPages={totalPages} basePath="/search" queryString={`query=${encodeURIComponent(debouncedQuery)}`} onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
