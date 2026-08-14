interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
}: PaginationInfoProps) {
  if (totalItems === undefined) {
    return (
      <div className="text-xs text-muted-foreground sm:text-sm">
        <span>
          Página <strong className="text-foreground">{currentPage}</strong> de{" "}
          <strong className="text-foreground">{totalPages}</strong>
        </span>
      </div>
    );
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const itemLabel = totalItems === 1 ? "jogo" : "jogos";

  return (
    <div className="text-xs text-muted-foreground sm:text-sm">
      <span>
        Exibindo{" "}
        <strong className="font-semibold text-foreground">
          {startItem}–{endItem}
        </strong>{" "}
        de{" "}
        <strong className="font-semibold text-foreground">{totalItems}</strong>{" "}
        {itemLabel}
      </span>
    </div>
  );
}
