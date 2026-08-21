import { useQuery } from '@tanstack/react-query';
import { workspaceApiFetch } from '../../../utils/api';
import type { WorkspaceListKey, WorkspaceListResponse, WorkspaceParentFilter } from '../types';

const PAGE_SIZE = 10;

const getWorkspaceList = async <K extends WorkspaceListKey>(
  key: K,
  page: number,
  search: string,
  parent?: WorkspaceParentFilter,
): Promise<WorkspaceListResponse<K>> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    search,
  });

  if (parent?.id) {
    params.set(parent.param, parent.id);
  }

  const response = await workspaceApiFetch(`/${key}?${params}`);

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message ?? 'Não foi possível carregar os dados');
  }

  return response.json();
};

export const useWorkspaceListQuery = <K extends WorkspaceListKey>(
  key: K,
  page: number,
  search: string,
  workspaceId?: string,
  parent?: WorkspaceParentFilter,
) =>
  useQuery({
    queryKey: ['workspaces', key, workspaceId, page, search, parent?.id],
    queryFn: () => getWorkspaceList(key, page, search, parent),
    enabled: Boolean(workspaceId),
  });
