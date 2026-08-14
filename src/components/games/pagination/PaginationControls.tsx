import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationPages } from "./PaginationPages";
import type { PaginationItem } from "./usePaginationRange";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  paginationRange: PaginationItem[];
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  paginationRange,
  onPageChange,
}: PaginationControlsProps) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(1)}
        disabled={isFirstPage}
        aria-label="Ir para a primeira página"
        className="hidden sm:inline-flex"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        aria-label="Ir para a página anterior"
        className="gap-1 px-2.5"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      <PaginationPages
        currentPage={currentPage}
        paginationRange={paginationRange}
        onPageChange={onPageChange}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        aria-label="Ir para a próxima página"
        className="gap-1 px-2.5"
      >
        <span className="hidden sm:inline">Próximo</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(totalPages)}
        disabled={isLastPage}
        aria-label="Ir para a última página"
        className="hidden sm:inline-flex"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
