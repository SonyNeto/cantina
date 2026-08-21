import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workspaceApiFetch } from '../../../utils/api';
import type { WorkspaceListKey, WorkspaceParentFilter } from '../types';

type DeleteWorkspaceListItemOptions = {
  key: WorkspaceListKey;
  page: number;
  search: string;
  workspaceId?: string;
  parent?: WorkspaceParentFilter;
};

export const useDeleteWorkspaceListItem = ({
  key,
  page,
  search,
  workspaceId,
  parent,
}: DeleteWorkspaceListItemOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const parentRoute = parent?.id ? `/${parent.key}/${parent.id}` : '';
      const response = await workspaceApiFetch(`${parentRoute}/${key}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        const fallbackMessage =
          response.status === 409 ? 'Existem alunos cadastrados' : 'Não foi possível remover';

        throw new Error(data?.message ?? fallbackMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', key, workspaceId, page, search, parent?.id],
      });
      toast.success('Removido com sucesso!');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível deletar';
      toast.error(message);
    },
  });
};
