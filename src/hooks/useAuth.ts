import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';

export function useAuth() {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const response = await apiFetch('/check-auth');

      if (response.status === 401) {
        return false;
      }

      if (!response.ok) {
        throw new Error('Não foi possível verificar a autenticação');
      }

      return true;
    },
    retry: false,
    staleTime: 60_000,
  });
}