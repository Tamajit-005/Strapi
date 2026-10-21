"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

const pill =
  "flex h-9 min-w-9 items-center justify-center rounded-full border px-3 font-serif text-[12px] leading-3.75 tracking-[0.01em] uppercase transition-colors duration-200";

export default function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: BlogPaginationProps) {
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        title="Previous page"
        className={`${pill} border-white/20 text-white/70 hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white/70`}
      >
        <ChevronLeft size={16} strokeWidth={1.75} />
      </button>

      {getPages().map((page, i) =>
        page === "..." ? (
          <span
            key={`e${i}`}
            aria-hidden
            className="flex h-9 w-9 items-center justify-center font-serif text-[12px] leading-3.75 text-white/40"
          >
            …
          </span>
        ) : (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange?.(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
            className={`${pill} ${
              page === currentPage
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/70 hover:border-white hover:text-white"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        title="Next page"
        className={`${pill} border-white/20 text-white/70 hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white/70`}
      >
        <ChevronRight size={16} strokeWidth={1.75} />
      </button>
    </nav>
  );
}
