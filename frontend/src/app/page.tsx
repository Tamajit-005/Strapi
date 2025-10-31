import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const BlogListClient = dynamic(() => import("./BlogListClient"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogListClient />
    </Suspense>
  );
}
