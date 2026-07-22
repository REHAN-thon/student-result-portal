import type { Role } from '../types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const STORAGE_KEY = 'srp_session';

export function saveSession(token: string, role: Role, userId: string) {
  localStorage.setItem(STORAGE_KEY + '_' + role, JSON.stringify({ token, role, userId }));
}

export function getSession(role: Role) {
  const raw = localStorage.getItem(STORAGE_KEY + '_' + role);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { token: string; role: Role; userId: string };
  } catch {
    return null;
  }
}

export function clearSession(role: Role) {
  localStorage.removeItem(STORAGE_KEY + '_' + role);
}

async function parseError(res: Response): Promise<never> {
  let detail = `Request failed (${res.status})`;
  try {
    const data = await res.json();
    if (data?.detail) detail = data.detail;
  } catch {
    /* ignore parse errors */
  }
  throw new ApiError(detail, res.status);
}

export async function apiPostJson<T>(path: string, body: unknown, role?: Role): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (role) {
    const session = getSession(role);
    if (session) headers['Authorization'] = `Bearer ${session.token}`;
  }
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, role?: Role): Promise<T> {
  const headers: Record<string, string> = {};
  if (role) {
    const session = getSession(role);
    if (session) headers['Authorization'] = `Bearer ${session.token}`;
  }
  const res = await fetch(path, { headers });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string, role: Role): Promise<T> {
  const headers: Record<string, string> = {};
  const session = getSession(role);
  if (session) headers['Authorization'] = `Bearer ${session.token}`;
  const res = await fetch(path, { method: 'DELETE', headers });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}

export async function apiUpload<T>(path: string, formData: FormData, role: Role): Promise<T> {
  const headers: Record<string, string> = {};
  const session = getSession(role);
  if (session) headers['Authorization'] = `Bearer ${session.token}`;
  const res = await fetch(path, { method: 'POST', headers, body: formData });
  if (!res.ok) return parseError(res);
  return res.json() as Promise<T>;
}

export function resultPdfUrl(rollNumber: string): string {
  return `/api/results/${encodeURIComponent(rollNumber)}/pdf`;
}

export async function fetchPdfBlob(rollNumber: string): Promise<Blob> {
  const session = getSession('student');
  const headers: Record<string, string> = {};
  if (session) headers['Authorization'] = `Bearer ${session.token}`;
  const res = await fetch(resultPdfUrl(rollNumber), { headers });
  if (!res.ok) return parseError(res);
  return res.blob();
}
