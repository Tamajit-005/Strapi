"use client";

import LoadingAnimation from "@/components/LoadingAnimation";

const Loader = () => {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center justify-center">
        <LoadingAnimation className="w-64 h-64" />
        <p className="mt-6 text-gray-500 text-sm font-bold uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loader;
