import { type ReactNode } from 'react';

type GnbLayoutProps = {
  nav: ReactNode;
  actions: ReactNode;
  children: ReactNode;
};

export function GnbLayout({ nav, actions, children }: GnbLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0 })}
            aria-label="맨 위로 이동"
            className="rounded-md border border-primary bg-primary-light px-1.5 py-0.5 text-xs font-extrabold text-primary"
          >
            US
          </button>
          <nav aria-label="주요 메뉴" className="flex flex-1 items-center gap-2">
            {nav}
          </nav>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </header>
      <main className="mx-auto max-w-[1080px] px-6 py-12">{children}</main>
    </div>
  );
}
