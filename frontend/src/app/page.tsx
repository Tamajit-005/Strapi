import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/Loader";

export const revalidate = 60;

const BlogListClient = dynamic(() => import("./BlogListClient"));

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center min-h-screen bg-slate-950">
          <Loader />
        </div>
      }
    >
      <BlogListClient />
    </Suspense>
  );
}
