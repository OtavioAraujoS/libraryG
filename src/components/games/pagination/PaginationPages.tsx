import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginationItem } from "./usePaginationRange";

interface PaginationPagesProps {
  currentPage: number;
  paginationRange: PaginationItem[];
  onPageChange: (page: number) => void;
}

export function PaginationPages({
  currentPage,
  paginationRange,
  onPageChange,
}: PaginationPagesProps) {
  return (
    <div className="flex items-center gap-1">
      {paginationRange.map((pageItem, index) => {
        if (typeof pageItem === "string") {
          return (
            <div
              key={`dots-${index}`}
              className="flex h-7 w-7 items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              <MoreHorizontal className="h-4 w-4" />
            </div>
          );
        }

        const isCurrentPage = pageItem === currentPage;

        return (
          <Button
            key={pageItem}
            variant={isCurrentPage ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onPageChange(pageItem)}
            aria-current={isCurrentPage ? "page" : undefined}
            aria-label={`Página ${pageItem}`}
            className={cn(
              "h-7 w-7 text-xs transition-colors",
              isCurrentPage &&
                "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
            )}
          >
            {pageItem}
          </Button>
        );
      })}
    </div>
  );
}
