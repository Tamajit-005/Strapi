import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  onPageChange?: (page: number) => void;
}

export default function BlogPagination({
  currentPage,
  totalPages,
  basePath,
  onPageChange,
}: BlogPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onPageChange && currentPage > 1)
                onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {/* Page numbers */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault();
                if (onPageChange) onPageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Next button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onPageChange && currentPage < totalPages)
                onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
