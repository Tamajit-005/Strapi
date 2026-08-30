"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BlogPagination from "@/components/Pagination";
import type { BlogPost, Category } from "@/lib/types";
import { urlFor } from "@/sanity/image";
import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  initialCategory: Category;
  initialBlogs: BlogPost[];
  slug: string;
}

export default function CategoryClient({ initialCategory, initialBlogs, slug }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = initialCategory;
  const blogs = initialBlogs;

  const pageFromUrl = Number(searchParams.get("page") || 1);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const pageSize = useMemo(() => parseInt(process.env.NEXT_PUBLIC_PAGE_LIMIT || "6"), []);

  useEffect(() => {
    if (!slug) return;
    router.replace(`/category/${encodeURIComponent(slug)}?page=${currentPage}`);
  }, [currentPage, slug, router]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(blogs.length / pageSize));
    if (currentPage > total) setCurrentPage(total);
  }, [blogs.length, pageSize, currentPage]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(blogs.length / pageSize)),
    [blogs.length, pageSize],
  );

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return blogs.slice(start, start + pageSize);
  }, [blogs, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-slate-950 min-h-screen text-gray-200"
    >
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-teal-500 text-center mb-2">{category.name}</h1>
        {category.description && <p className="text-gray-400 text-center mb-4">{category.description}</p>}
        <p className="text-center text-gray-400 mb-8">{blogs.length} posts in this category</p>

        {paginatedBlogs.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedBlogs.map((post) => {
              const imageUrl = post.image ? urlFor(post.image).width(600).url() : null;
              return (
                <motion.div
                  key={post._id}
                  variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-md"
                >
                  <Link href={`/blogs/${post.slug}`}>
                    {imageUrl ? (
                      <div className="relative h-40 w-full">
                        <Image
                          src={imageUrl}
                          alt={post.image?.alt || ""}
                          title={post.slug}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gray-800 text-gray-500 text-sm">
                        No Image
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-white line-clamp-2 mb-2">{post.title}</h2>
                      <p className="text-gray-400 text-sm line-clamp-3">{post.description}</p>
                      <p className="text-teal-400 text-sm mt-4 font-medium hover:underline">Read More →</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p className="text-center text-gray-400 mt-12">No blogs yet in this category. Check back later 👀</p>
        )}

        {blogs.length > 0 && (
          <div className="mt-12">
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/category/${encodeURIComponent(slug)}`}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
