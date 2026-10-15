import { type ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">
        <div className="mb-12 flex items-center justify-center gap-5">
          <span
            aria-hidden="true"
            className="flex size-20 items-center justify-center rounded-3xl bg-primary text-3xl font-extrabold text-white shadow-lg"
          >
            US
          </span>
          <h1 className="text-3xl font-bold text-gray-900">US Alliance</h1>
        </div>
        {children}
      </div>
    </main>
  );
}
