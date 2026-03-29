import React, { Suspense } from "react";
import SearchClient from "./SearchClient";
import Loader from "@/components/Loader";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <Loader />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
