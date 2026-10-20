import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getAllPosts,
  getAllCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/lib/buildCache";
import type { BlogPost, Category } from "@/lib/types";
import PostBrowser from "@/components/PostBrowser";
import Loader from "@/components/Loader";

// Dynamic on purpose: PostBrowser reads the URL via useSearchParams, so a static
// route would drop the cards from the HTML. The data itself comes from the 24h cache.
export const revalidate = 0;

export const dynamicParams = true;

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
  const [, categories]: [BlogPost[], Category[]] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const blogs: BlogPost[] = getPostsByCategory(slug)
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col items-center justify-center min-h-screen bg-black">
          <Loader />
          <p className="text-gray-400 mt-4">Loading category...</p>
        </div>
      }
    >
      <PostBrowser
        title={cat.name}
        posts={blogs}
        categories={categories}
        showSearch={false}
      />
    </Suspense>
  );
}
