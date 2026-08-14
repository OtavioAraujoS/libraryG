import { useMemo } from "react";

export const DOTS_LEFT = "dots-left" as const;
export const DOTS_RIGHT = "dots-right" as const;

export type PaginationItem = number | typeof DOTS_LEFT | typeof DOTS_RIGHT;

interface UsePaginationRangeParams {
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}

export function usePaginationRange({
  currentPage,
  totalPages,
  siblingCount = 1,
}: UsePaginationRangeParams): PaginationItem[] {
  return useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from(
        { length: leftItemCount },
        (_, index) => index + 1,
      );
      return [...leftRange, DOTS_RIGHT, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, index) => totalPages - rightItemCount + index + 1,
      );
      return [1, DOTS_LEFT, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, index) => leftSiblingIndex + index,
      );
      return [1, DOTS_LEFT, ...middleRange, DOTS_RIGHT, totalPages];
    }

    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [currentPage, totalPages, siblingCount]);
}
