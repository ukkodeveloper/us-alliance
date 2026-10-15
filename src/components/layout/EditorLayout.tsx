import { type ReactNode } from 'react';

type EditorLayoutProps = {
  title: string;
  onBack: () => void;
  actions: ReactNode;
  children: ReactNode;
};

export function EditorLayout({ title, onBack, actions, children }: EditorLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="뒤로 가기"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-lg text-gray-900 hover:bg-gray-100"
            >
              ←
            </button>
            <h1 className="truncate text-base font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </header>
      <main className="mx-auto max-w-[660px] px-6 py-10">{children}</main>
    </div>
  );
}
