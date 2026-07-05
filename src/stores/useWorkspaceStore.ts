import { create } from 'zustand';

export type Workspace = {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'systemAdmin';
};

type WorkspaceStore = {
  workspace: Workspace | null;
  setWorkspace: (workspace: Workspace) => void;
  setDefaultWorkspace: (workspaces: Workspace[]) => void;
  clearWorkspace: () => void;
};

export const useWorkspaceStore = create<WorkspaceStore>()((set, get) => ({
  workspace: null,

  setWorkspace: (workspace) => set({ workspace }),

  setDefaultWorkspace: (workspaces) => {
    const currentWorkspace = get().workspace;

    if (currentWorkspace || workspaces.length === 0) {
      return;
    }

    set({ workspace: workspaces[0] });
  },

  clearWorkspace: () => set({ workspace: null }),
}));
