import { CATEGORIES } from '../../../api/contents';

export function ContentFormSkeleton() {
  return (
    <div role="status" aria-label="콘텐츠를 불러오는 중입니다." className="flex animate-pulse flex-col gap-8">
      <div aria-hidden="true" className="flex flex-col gap-3">
        <span className="block h-4 w-16 rounded bg-gray-100" />
        <span className="block h-3 w-72 max-w-full rounded bg-gray-100" />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <span key={category} className="block h-8 w-20 rounded-full bg-gray-100" />
          ))}
        </div>
      </div>
      <hr className="border-gray-100" />
      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="block h-4 w-10 rounded bg-gray-100" />
          <span className="block h-12 rounded-lg bg-gray-100" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="block h-4 w-10 rounded bg-gray-100" />
          <span className="block h-40 rounded-lg bg-gray-100" />
        </div>
      </div>
      <hr className="border-gray-100" />
      <div aria-hidden="true" className="flex flex-col gap-2">
        <span className="block h-4 w-10 rounded bg-gray-100" />
        <span className="block h-12 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}
