"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "@/components/Loader";
import BlogPagination from "@/components/Pagination";
import { motion } from "framer-motion";
import type { BlogPost } from "@/lib/types";

interface Props {
  allPosts: BlogPost[];
}

export default function SearchClient({ allPosts }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawQuery = (searchParams.get("query") || "").trim().toLowerCase();
  const pageFromUrl = Number(searchParams.get("page") || 1);

  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const pageSize = 6;

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 400);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  // LOCAL SEARCH (NO API)
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      return;
    }

    const results = allPosts.filter((post) => {
      const title = post.title?.toLowerCase() || "";
      const desc = post.description?.toLowerCase() || "";

      return title.includes(debouncedQuery) || desc.includes(debouncedQuery);
    });

    setSearchResults(results);
  }, [debouncedQuery, allPosts]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(searchResults.length / pageSize)),
    [searchResults.length, pageSize],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("query", debouncedQuery);
    params.set("page", String(currentPage));
    router.replace(`/search?${params.toString()}`);
  }, [currentPage, debouncedQuery, router]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchResults.slice(start, start + pageSize);
  }, [searchResults, currentPage, pageSize]);

  if (!allPosts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-950 min-h-screen text-gray-200"
    >
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-teal-500 mb-4">
          Search Results
        </h1>

        {debouncedQuery ? (
          <p className="text-center text-gray-400 mb-6">
            {searchResults.length} results for{" "}
            <span className="text-teal-400">"{debouncedQuery}"</span>
          </p>
        ) : (
          <p className="text-center text-gray-400 mb-6">
            Enter a search term to find posts.
          </p>
        )}

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedResults.map((post) => (
            <motion.div
              key={post.documentId}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-md"
            >
              <Link href={`/blogs/${post.documentId}`}>
                <div className="relative h-40 w-full">
                  <img
                    src={
                      post.cover?.url?.startsWith("http")
                        ? post.cover.url
                        : `${process.env.NEXT_PUBLIC_STRAPI_URL}${post.cover?.url}`
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-white line-clamp-2 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {post.description}
                  </p>
                  <p className="text-teal-400 text-sm mt-4 font-medium hover:underline">
                    Read More →
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {searchResults.length > pageSize && (
          <div className="mt-10">
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/search"
              queryString={`query=${encodeURIComponent(debouncedQuery)}`}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
