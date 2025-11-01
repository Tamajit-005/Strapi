"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAllPosts } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import Loader from "@/components/Loader";
import BlogPagination from "@/components/Pagination";

export default function BlogListClient() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_LIMIT || "7");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const blogs = await getAllPosts();
        setAllPosts(blogs);
      } catch (err) {
        console.error(err);
        setError("Error fetching posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Sort posts by updatedAt or createdAt descending
  const sortedPosts = useMemo(() => {
    return [...allPosts].sort((a, b) => {
      const dateA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const dateB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return dateB - dateA;
    });
  }, [allPosts]);

  // Page-local slice: this page's items only
  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / pageSize));

  const currentSlice = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedPosts.slice(startIndex, startIndex + pageSize);
  }, [sortedPosts, currentPage, pageSize]);

  const featuredPost = currentSlice[0];
  const regularPosts = currentSlice.slice(1); // pageSize - 1 cards

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    router.push(`?${newParams.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCategoryName = (post: BlogPost): string | null => {
    if (post.category && post.category.length > 0) {
      return post.category[0].name;
    }
    return null;
  };

  if (loading)
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-slate-950">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );

  if (!sortedPosts.length)
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-center text-gray-400">No posts found.</p>
      </div>
    );

  return (
    <div className="w-full">
      {/* Page-local Featured Post */}
      {featuredPost && (
        <Link href={`/blogs/${featuredPost.documentId}`}>
          <div className="relative w-full h-[500px] overflow-hidden cursor-pointer group">
            {featuredPost.cover?.url && (
              <img
                src={
                  featuredPost.cover.url.startsWith("http")
                    ? featuredPost.cover.url
                    : `${process.env.NEXT_PUBLIC_STRAPI_URL}${featuredPost.cover.url}`
                }
                alt={featuredPost.title}
                className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto">
              {getCategoryName(featuredPost) && (
                <span className="inline-block bg-teal-500 text-gray-900 text-xs font-bold px-4 py-2 rounded mb-4 uppercase tracking-wider">
                  {getCategoryName(featuredPost)}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-4xl">
                {featuredPost.title}
              </h1>
              <p className="text-gray-200 text-base md:text-lg max-w-2xl line-clamp-2">
                {featuredPost.description}
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Regular Posts Grid for this page (pageSize - 1 cards) */}
      <div className="w-full bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {regularPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <Link
                  key={post.documentId}
                  href={`/blogs/${post.documentId}`}
                  className="block p-6 border-t-2 border-gray-700 hover:border-teal-500 transition-colors duration-300 group"
                >
                  {getCategoryName(post) && (
                    <div className="mb-4">
                      <span className="inline-block text-teal-400 text-xs font-bold uppercase tracking-wider bg-teal-950/50 px-3 py-1 rounded">
                        {getCategoryName(post)}
                      </span>
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-teal-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              No more posts on this page.
            </p>
          )}

          {/* Pagination Controls (full list) */}
          {sortedPosts.length > pageSize && (
            <div className="mt-12">
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/"
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
