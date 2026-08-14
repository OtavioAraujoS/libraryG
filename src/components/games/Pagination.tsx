"use client";

import { cn } from "@/lib/utils";
import { PaginationInfo } from "./pagination/PaginationInfo";
import { PaginationControls } from "./pagination/PaginationControls";
import { usePaginationRange } from "./pagination/usePaginationRange";
import type { PaginationProps } from "./types";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  className,
  siblingCount = 1,
}: PaginationProps) {
  const paginationRange = usePaginationRange({
    currentPage,
    totalPages,
    siblingCount,
  });

  const shouldHidePagination =
    totalPages <= 1 && (!totalItems || totalItems <= pageSize);

  if (shouldHidePagination) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Paginação"
      className={cn(
        "flex flex-col items-center justify-between gap-4 py-4 sm:flex-row",
        className,
      )}
    >
      <PaginationInfo
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        paginationRange={paginationRange}
        onPageChange={onPageChange}
      />
    </nav>
  );
}
