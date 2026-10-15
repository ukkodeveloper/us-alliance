import { createBrowserRouter, Navigate } from 'react-router';

import { setUnauthorizedHandler } from './api/http';
import { AuthGuard, GuestGuard } from './domains/auth';
import { ContentWritePage } from './pages/ContentWritePage';
import { ListPage } from './pages/ListPage';
import { LoginPage } from './pages/LoginPage';
import { NotificationWritePage } from './pages/NotificationWritePage';
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
    children: [
      { path: '/', element: <ListPage /> },
      { path: '/contents/new', element: <ContentWritePage /> },
      { path: '/contents/:id/edit', element: <ContentWritePage /> },
      { path: '/notifications/new', element: <NotificationWritePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

setUnauthorizedHandler(() => {
  void router.navigate('/login', { replace: true });
});
