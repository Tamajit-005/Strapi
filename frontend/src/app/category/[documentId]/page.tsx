import { notFound } from "next/navigation";
import { Suspense } from "react";
import { client } from "@/lib/apolloClient";
import {
  GET_ALL_CATEGORIES,
  GET_CATEGORY_BY_DOCUMENT_ID,
  type GetAllCategoriesResult,
  type GetCategoryByDocumentIdResult,
} from "@/lib/queries";
import type { BlogPost, Category } from "@/lib/types";
import CategoryClient from "./CategoryClient";
import Loader from "@/components/Loader";

// Fallback ISR window — on-demand revalidation webhook handles instant updates
export const revalidate = 3600;

// Called once at build — generates a static HTML page per category
export async function generateStaticParams() {
  const { data } = await client.query<GetAllCategoriesResult>({
    query: GET_ALL_CATEGORIES,
  });
  return (data?.categories ?? []).map((c) => ({ documentId: c.documentId }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const { data } = await client.query<GetCategoryByDocumentIdResult>({
    query: GET_CATEGORY_BY_DOCUMENT_ID,
    variables: { documentId },
  });

  const cat = data?.category;
  if (!cat) notFound();

  const category: Category = {
    documentId: cat.documentId,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || "",
  };

  // Sort and map blogs (same logic as the old useEffect)
  const blogs: BlogPost[] = [...(cat.blogs || [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime(),
    )
    .map((b) => ({
      documentId: b.documentId,
      title: b.title,
      description: b.description || undefined,
      createdAt: b.createdAt || undefined,
      cover: b.cover?.url ? { url: b.cover.url } : undefined,
    }));

  return (
    // Suspense required because CategoryClient uses useSearchParams()
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
