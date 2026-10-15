import { createBrowserRouter, Navigate } from 'react-router';

import { setUnauthorizedHandler } from './api/http';
import { AuthGuard, GuestGuard } from './domains/auth';
import { ListPage } from './pages/ListPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

export const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [{ path: '/', element: <ListPage /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

setUnauthorizedHandler(() => {
  void router.navigate('/login', { replace: true });
});
