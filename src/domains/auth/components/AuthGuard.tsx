import { Navigate, Outlet } from 'react-router';

import { getTokens } from '../../../api/tokenStorage';

export function AuthGuard() {
  if (getTokens() == null) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
