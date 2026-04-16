const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('portal_token');
  }
  return null;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    // ... same logic for error handling and return
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `API error: ${res.status} ${res.statusText}` };
    }
    return await res.json();
  } catch (err) {
    console.error('API call failed:', err);
    return { success: false, message: 'Network error or server is down.' };
  }
}

export const api = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body: unknown) => {
    const isFD = body instanceof FormData;
    return apiFetch(path, { method: 'POST', body: isFD ? (body as any) : JSON.stringify(body) });
  },
  put: (path: string, body: unknown) => {
    const isFD = body instanceof FormData;
    return apiFetch(path, { method: 'PUT', body: isFD ? (body as any) : JSON.stringify(body) });
  },
  patch: (path: string, body: unknown) => {
    const isFD = body instanceof FormData;
    return apiFetch(path, { method: 'PATCH', body: isFD ? (body as any) : JSON.stringify(body) });
  },
  delete: (path: string, body?: unknown) => {
    const isFD = body instanceof FormData;
    return apiFetch(path, { method: 'DELETE', body: body ? (isFD ? (body as any) : JSON.stringify(body)) : undefined });
  },
};
