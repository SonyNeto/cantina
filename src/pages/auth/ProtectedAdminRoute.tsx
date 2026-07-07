import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Loader } from '../../components/commons/Loader';
import ROUTES from '../../constants/routes';
import { useWorkspaceStore, type Workspace } from '../../stores/useWorkspaceStore';
import { apiFetch } from '../../utils/api';
import { canManageWorkspace } from '../../utils/workspaceAccess';

type WorkspacesResponse = {
  workspaces: Workspace[];
};

const getWorkspaces = async (): Promise<WorkspacesResponse> => {
  const res = await apiFetch('/workspaces');

  if (!res.ok) {
    throw new Error('Não autenticado');
  }

  return res.json();
};

export const ProtectedAdminRoute = () => {
  const location = useLocation();
  const selectedWorkspace = useWorkspaceStore((state) => state.workspace);
  const setDefaultWorkspace = useWorkspaceStore((state) => state.setDefaultWorkspace);

  const {
    data: userWorkspaces,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
    select: (data) => data.workspaces,
    retry: false,
  });

  useEffect(() => {
    if (!userWorkspaces) return;

    setDefaultWorkspace(userWorkspaces);
  }, [setDefaultWorkspace, userWorkspaces]);

  if (isLoading) return <Loader />;

  if (isError) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const workspace = selectedWorkspace ?? userWorkspaces?.[0];

  if (!canManageWorkspace(workspace?.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};
