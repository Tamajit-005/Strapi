"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAllPosts } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import Loader from "@/components/Loader";
import BlogPagination from "@/components/Pagination";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("query") || "").trim().toLowerCase();

  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_LIMIT || "6");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const posts = await getAllPosts();
        setAllPosts(posts);
      } catch (err) {
        console.error(err);
        setError("Error searching blogs.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return allPosts;
    return allPosts.filter((p) => {
      const inTitle = p.title?.toLowerCase().includes(query);
      const inDesc = p.description?.toLowerCase().includes(query);
      const inContent = p.content?.toLowerCase().includes(query);
      const inCategory = (p.category || []).some((c) =>
        c.name?.toLowerCase().includes(query)
      );
      return inTitle || inDesc || inContent || inCategory;
    });
  }, [allPosts, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
  }, [filtered.length, pageSize]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );

  return (
    <div className="w-full bg-slate-950 min-h-screen text-gray-200">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-teal-500 text-center">
          Search Results
        </h1>

        {query && (
          <p className="text-gray-400 text-center mb-8">
            Showing results for:{" "}
            <span className="text-teal-400 font-medium">"{query}"</span>
          </p>
        )}

        {paginatedResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResults.map((post) => (
              <div
                key={post.documentId}
                className="cursor-pointer bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform duration-300"
              >
                <Link href={`/blogs/${post.documentId}`} className="block">
                  {post.cover?.url ? (
                    <div className="relative h-40 w-full">
                      <img
                        src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${post.cover.url}`}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-800 text-gray-500 text-sm">
                      No Image
                    </div>
                  )}

                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-white line-clamp-2 mb-2 group-hover:text-teal-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-6 line-clamp-3">
                      {post.description}
                    </p>
                    <p className="text-teal-400 text-sm mt-4 inline-block font-medium hover:underline">
                      Read More →
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-12">
            {query ? `No results found for "${query}".` : "No posts available."}
          </p>
        )}

        {paginatedResults.length > 0 && (
          <div className="mt-12">
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/search"
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
