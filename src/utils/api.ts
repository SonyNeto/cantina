import { useWorkspaceStore } from '../stores/useWorkspaceStore';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_URL}${normalizedPath}`;
}

export function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(apiUrl(path), {
    ...options,
    credentials: 'include',
  });
}

export function workspaceApiFetch(path: string, options: RequestInit = {}) {
  const workspaceId = useWorkspaceStore.getState().workspace?.id;

  if (!workspaceId) {
    throw new Error('Workspace nao selecionado');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return apiFetch(`/workspaces/${workspaceId}${normalizedPath}`, options);
}
