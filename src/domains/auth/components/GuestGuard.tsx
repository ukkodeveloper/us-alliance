import { Navigate, Outlet } from 'react-router';

import { getTokens } from '../../../api/tokenStorage';

export function GuestGuard() {
  if (getTokens() != null) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
