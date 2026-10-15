import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { logout as requestLogout } from '../../../api/auth';
import { clearTokens } from '../../../api/tokenStorage';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async function logout() {
    await requestLogout().catch(() => undefined);
    clearTokens();
    queryClient.clear();
    navigate('/login', { replace: true });
  };
}
