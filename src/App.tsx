import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { ApiError } from './api/http';
import { router } from './router';

const MAX_RETRY_COUNT = 1;

function shouldRetry(failureCount: number, error: Error) {
  const isClientError = error instanceof ApiError && error.status >= 400 && error.status < 500;
  return !isClientError && failureCount < MAX_RETRY_COUNT;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry, refetchOnWindowFocus: false },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
