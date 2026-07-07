import type { Workspace } from '../stores/useWorkspaceStore';

export type WorkspaceAccessLevel = 'member' | 'admin';

const roleRank: Record<Workspace['role'], number> = {
  member: 1,
  admin: 2,
  owner: 2,
  systemAdmin: 2,
};

const accessLevelRank: Record<WorkspaceAccessLevel, number> = {
  member: 1,
  admin: 2,
};

export function canAccessWorkspaceRole(
  role: Workspace['role'] | undefined,
  accessLevel: WorkspaceAccessLevel,
) {
  if (!role) return false;

  return roleRank[role] >= accessLevelRank[accessLevel];
}

export function canManageWorkspace(role: Workspace['role'] | undefined) {
  return canAccessWorkspaceRole(role, 'admin');
}
