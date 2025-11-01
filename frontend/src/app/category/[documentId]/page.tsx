"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Loader from "@/components/Loader";
import BlogPagination from "@/components/Pagination";
import type { BlogPost, Category } from "@/lib/types";
import { client } from "@/lib/apolloClient";
import { gql } from "@apollo/client";

const GET_CATEGORY_BY_DOCUMENT_ID = gql`
  query GetCategoryByDocumentId($documentId: ID!) {
    category(documentId: $documentId) {
      documentId
      name
      slug
      description
      blogs {
        title
        documentId
        slug
        description
        content
        createdAt
        updatedAt
        cover {
          url
        }
        author {
          name
          email
        }
      }
    }
  }
`;

type GetCategoryByDocumentIdResult = {
  category?: {
    documentId: string;
    name: string;
    slug: string;
    description?: string | null;
    blogs: Array<{
      documentId: string;
      title: string;
      slug?: string | null;
      description?: string | null;
      content?: string | null;
      createdAt?: string | null;
      updatedAt?: string | null;
      cover?: { url?: string | null } | null;
      author?: { name: string; email?: string | null } | null;
    }>;
  };
};

export default function CategoryPage() {
  const params = useParams();
  // Route: /category/[documentId]
  const raw = (params as Record<string, unknown>)?.documentId;
  const documentId = Array.isArray(raw) ? raw[0] : ((raw as string) ?? "");

  const [category, setCategory] = useState<Category | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_LIMIT || "6");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!documentId) return;

    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await client.query<GetCategoryByDocumentIdResult>({
          query: GET_CATEGORY_BY_DOCUMENT_ID,
          variables: { documentId },
          fetchPolicy: "no-cache",
        });

        const cat = data?.category;
        if (!cat) {
          setCategory(null);
          setBlogs([]);
          setError("Category not found.");
          return;
        }

        setCategory({
          documentId: cat.documentId,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
        } as Category);

        // blogs is a flat array of Blog objects (no data/attributes)
        const mapped: BlogPost[] = (cat.blogs || []).map((b) => ({
          documentId: b.documentId,
          title: b.title,
          slug: b.slug || undefined,
          description: b.description || undefined,
          content: b.content || undefined,
          createdAt: b.createdAt || undefined,
          updatedAt: b.updatedAt || undefined,
          cover: b.cover?.url ? { url: b.cover.url } : undefined,
          author: b.author
            ? {
                name: b.author.name,
                email: b.author.email ?? undefined, // <- coerce null to undefined
              }
            : undefined,
        }));

        setBlogs(mapped);
        setCurrentPage(1);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Error fetching category data.");
        setCategory(null);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [documentId]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(blogs.length / pageSize)),
    [blogs.length, pageSize]
  );

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return blogs.slice(start, start + pageSize);
  }, [blogs, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-slate-950">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-400">No category found.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-teal-500 text-center">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-400 text-center mb-8">
            {category.description}
          </p>
        )}

        {paginatedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBlogs.map((post) => (
              <div
                key={post.documentId}
                className="cursor-pointer bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Link href={`/blogs/${post.documentId}`} className="block">
                  {post.cover?.url ? (
                    <div className="relative h-40 w-full">
                      <img
                        src={
                          post.cover.url.startsWith("http")
                            ? post.cover.url
                            : `${process.env.NEXT_PUBLIC_STRAPI_URL}${post.cover.url}`
                        }
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-800 text-gray-500 text-sm">
                      No Image
                    </div>
                  )}

                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-white line-clamp-2 mb-2">
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
            No blogs found in this category.
          </p>
        )}

        {blogs.length > 0 && (
          <div className="mt-12">
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/category/${encodeURIComponent(documentId)}`}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
