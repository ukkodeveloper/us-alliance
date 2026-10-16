type TableSkeletonProps = {
  label: string;
  columnWidths: string[];
  rowCount: number;
};

export function TableSkeleton({ label, columnWidths, rowCount }: TableSkeletonProps) {
  const rows = Array.from({ length: rowCount }, (_, index) => index);

  return (
    <div role="status" aria-label={label} className="overflow-x-auto">
      <div aria-hidden="true" className="min-w-[640px] animate-pulse">
        <div className="flex border-b border-gray-100 py-3">
          {columnWidths.map((width, index) => (
            <div key={index} className={width === '' ? 'flex-1' : `${width} shrink-0`}>
              <span className="mx-auto block h-3 w-8 rounded bg-gray-100" />
            </div>
          ))}
        </div>
        {rows.map(row => (
          <div key={row} className="flex border-b border-gray-50 py-5">
            {columnWidths.map((width, index) => (
              <div key={index} className={width === '' ? 'flex-1' : `${width} shrink-0`}>
                <span className={`block h-5 rounded bg-gray-100 ${width === '' ? 'w-3/4' : 'mx-auto w-10'}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
