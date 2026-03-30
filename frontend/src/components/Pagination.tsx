import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  onPageChange?: (page: number) => void;
  queryString?: string;
}

export default function BlogPagination({
  currentPage,
  totalPages,
  basePath,
  onPageChange,
  queryString = "",
}: BlogPaginationProps) {
  // Generate simple pagination logic (1, 2, ..., 5, 6, ..., 10)
  const getPages = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const createHref = (page: number) => {
    if (!basePath) return "#";
    return `${basePath}?${queryString}${queryString ? "&" : ""}page=${page}`;
  };

  const pages = getPages();

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            href={createHref(Math.max(1, currentPage - 1))}
            onClick={(e) => {
              if (onPageChange) {
                e.preventDefault();
                onPageChange(Math.max(1, currentPage - 1));
              }
            }}
          />
        </PaginationItem>

        {/* Pages */}
        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={createHref(page)}
                isActive={page === currentPage}
                onClick={(e) => {
                  if (onPageChange) {
                    e.preventDefault();
                    onPageChange(page);
                  }
                }}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            href={createHref(Math.min(totalPages, currentPage + 1))}
            onClick={(e) => {
              if (onPageChange) {
                e.preventDefault();
                onPageChange(Math.min(totalPages, currentPage + 1));
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
