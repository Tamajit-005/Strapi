import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getAllPosts,
  getAllCategories,
  getCategoryById,
  getPostsByCategory,
} from "@/lib/buildCache";
import type { BlogPost } from "@/lib/queries";
import type { Category } from "@/lib/types";
import CategoryClient from "./CategoryClient";
import Loader from "@/components/Loader";

// ISR
export const revalidate = 3600;

// Force static rendering (important for CDN + ISR)
export const dynamic = "force-static";

// Static params
export async function generateStaticParams() {
  const [, categories] = await Promise.all([getAllPosts(), getAllCategories()]);

  // prevent bad cache
  if (!categories || categories.length === 0) {
    throw new Error("❌ Failed to fetch categories");
  }

  return categories.map((c) => ({ documentId: c.documentId }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  // prevent bad cache
  if (!categories || categories.length === 0) {
    throw new Error("❌ Categories fetch failed");
  }

  const cat = getCategoryById(documentId);
  if (!cat) notFound();

  const category: Category = {
    documentId: cat.documentId,
    name: cat.name,
    slug: cat.slug ?? "",
    description: cat.description ?? "",
  };

  const blogs: BlogPost[] = getPostsByCategory(documentId)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? "").getTime() -
        new Date(a.createdAt ?? "").getTime(),
    );

  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col items-center justify-center min-h-screen bg-slate-950">
          <Loader />
          <p className="text-gray-400 mt-4">Loading category...</p>
        </div>
      }
    >
      <CategoryClient
        initialCategory={category}
        initialBlogs={blogs}
        documentId={documentId}
      />
    </Suspense>
  );
}
