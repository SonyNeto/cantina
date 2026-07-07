import { useEffect, type FC } from 'react';
import { Outlet } from 'react-router';
import { NavBar } from './NavBar';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { useWorkspaceStore, type Workspace } from '../stores/useWorkspaceStore';

type WorkspacesResponse = {
  workspaces: Workspace[];
};

const getWorkspaces = async (): Promise<WorkspacesResponse> => {
  const res = await apiFetch('/workspaces');
  return res.json();
};

export const Layout: FC = () => {
  const setDefaultWorkspace = useWorkspaceStore.getState().setDefaultWorkspace;

  const { data: userWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
    select: (data) => data.workspaces,
  });

  useEffect(() => {
    if (!userWorkspaces) return;

    setDefaultWorkspace(userWorkspaces);
  }, [setDefaultWorkspace, userWorkspaces]);

  return (
    <div className="bg-primary flex min-h-screen w-full flex-col overflow-x-hidden">
      <NavBar />
      <main className="w-full flex-1">
        <Outlet />
      </main>
    </div>
  );
};
