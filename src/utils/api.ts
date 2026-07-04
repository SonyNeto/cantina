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
