import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { apiPostJson, clearSession, getSession, saveSession } from '../api/client';
import type { Role } from '../types';

interface TokenResponse {
  access_token: string;
  token_type: string;
  role: Role;
}

interface AuthContextValue {
  studentUserId: string | null;
  adminUserId: string | null;
  isStudentAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  loginStudent: (userId: string, password: string) => Promise<void>;
  loginAdmin: (userId: string, password: string) => Promise<void>;
  logoutStudent: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [studentUserId, setStudentUserId] = useState<string | null>(getSession('student')?.userId ?? null);
  const [adminUserId, setAdminUserId] = useState<string | null>(getSession('admin')?.userId ?? null);

  const loginStudent = async (userId: string, password: string) => {
    const data = await apiPostJson<TokenResponse>('/api/auth/login', { user_id: userId, password });
    saveSession(data.access_token, 'student', userId);
    setStudentUserId(userId);
  };

  const loginAdmin = async (userId: string, password: string) => {
    const data = await apiPostJson<TokenResponse>('/api/admin/login', { user_id: userId, password });
    saveSession(data.access_token, 'admin', userId);
    setAdminUserId(userId);
  };

  const logoutStudent = () => {
    clearSession('student');
    setStudentUserId(null);
  };

  const logoutAdmin = () => {
    clearSession('admin');
    setAdminUserId(null);
  };

  const value = useMemo(
    () => ({
      studentUserId,
      adminUserId,
      isStudentAuthenticated: !!studentUserId,
      isAdminAuthenticated: !!adminUserId,
      loginStudent,
      loginAdmin,
      logoutStudent,
      logoutAdmin,
    }),
    [studentUserId, adminUserId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
