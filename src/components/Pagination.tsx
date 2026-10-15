const PAGE_WINDOW_SIZE = 5;

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const firstVisiblePage = Math.max(
    1,
    Math.min(page - Math.floor(PAGE_WINDOW_SIZE / 2), totalPages - PAGE_WINDOW_SIZE + 1)
  );
  const lastVisiblePage = Math.min(totalPages, firstVisiblePage + PAGE_WINDOW_SIZE - 1);
  const visiblePages = Array.from(
    { length: lastVisiblePage - firstVisiblePage + 1 },
    (_, index) => firstVisiblePage + index
  );

  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
        className="flex size-8 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
      >
        ‹
      </button>
      {visiblePages.map(visiblePage => {
        const isCurrent = visiblePage === page;
        return (
          <button
            key={visiblePage}
            type="button"
            onClick={() => onChange(visiblePage)}
            aria-current={isCurrent ? 'page' : undefined}
            className={`flex size-8 items-center justify-center rounded-md text-sm ${isCurrent ? 'bg-primary-light font-semibold text-primary-dark' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {visiblePage}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        className="flex size-8 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
      >
        ›
      </button>
    </nav>
  );
}
