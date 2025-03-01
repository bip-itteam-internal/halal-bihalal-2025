type PaginatedResult<T> = {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export function paginate<T>(
  items: T[],
  currentPage: number = 1,
  pageSize: number = 10
): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ensure currentPage is within valid range
  const validPage = Math.max(1, Math.min(currentPage, totalPages));

  const startIndex = (validPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage: validPage,
    pageSize,
  };
}