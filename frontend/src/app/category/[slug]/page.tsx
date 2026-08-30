import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getAllPosts,
  getAllCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/lib/buildCache";
import type { BlogPost, Category } from "@/lib/types";
import CategoryClient from "./CategoryClient";
import Loader from "@/components/Loader";

export const revalidate = 0; // TEMP: no cache for dev
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const [, categories] = await Promise.all([getAllPosts(), getAllCategories()]);
  if (!categories || categories.length === 0) return [];
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await Promise.all([getAllPosts(), getAllCategories()]);

  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const category: Category = {
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? null,
  };

  const blogs: BlogPost[] = getPostsByCategory(slug)
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col items-center justify-center min-h-screen bg-slate-950">
          <Loader />
          <p className="text-gray-400 mt-4">Loading category...</p>
        </div>
      }
    >
      <CategoryClient initialCategory={category} initialBlogs={blogs} slug={slug} />
    </Suspense>
  );
}
