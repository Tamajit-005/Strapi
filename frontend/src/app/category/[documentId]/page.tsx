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

// Fallback ISR window — on-demand revalidation webhook handles instant updates
export const revalidate = 3600;

// 1 API call for all category slugs — no per-category calls needed
export async function generateStaticParams() {
  // Run both in parallel — neither depends on the other
  const [, categories] = await Promise.all([
    getAllPosts(), // pre-warms postsByCategoryCache
    getAllCategories(), // pre-warms categoriesCache
  ]);
  return categories.map((c) => ({ documentId: c.documentId }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  // Ensure caches are warm (no-op if generateStaticParams already ran)
  await Promise.all([getAllPosts(), getAllCategories()]);

  const cat = getCategoryById(documentId);
  if (!cat) notFound();

  const category: Category = {
    documentId: cat.documentId,
    name: cat.name,
    slug: cat.slug ?? "",
    description: cat.description ?? "",
  };

  // Posts grouped by category — derived from the already-cached posts, 0 extra calls
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
