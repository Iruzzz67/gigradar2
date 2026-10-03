import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  role: Role;
  token: string | null;
  isOnboarded: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, requestedRole: 'User' | 'Artist' | 'EO') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleQuick: (role: Role) => void;
  updatePreferences: (genreIds: number[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => storage.getToken());

  useEffect(() => {
    storage.setCurrentUser(currentUser);
  }, [currentUser]);

  const role: Role = currentUser?.role || 'User';
  const isOnboarded = (currentUser?.preferences && currentUser.preferences.length > 0) || false;

  const login = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    const res = await api.login(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setToken(res.token || 'mock_token');
      return { success: true };
    }
    return { success: false, error: res.error || 'Email atau password salah.' };
  };

  const register = async (name: string, email: string, password: string, requestedRole: 'User' | 'Artist' | 'EO'): Promise<{ success: boolean; error?: string }> => {
    const res = await api.register(name, email, password, requestedRole);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setToken('mock_token_' + Date.now());
      return { success: true };
    }
    return { success: false, error: res.error || 'Gagal mendaftar.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    storage.setCurrentUser(null);
    storage.setToken(null);
  };

  const switchRoleQuick = (targetRole: Role) => {
    const users = storage.getUsers();
    const found = users.find(u => u.role === targetRole);
    if (found) {
      setCurrentUser(found);
      storage.setCurrentUser(found);
    }
  };

  const updatePreferences = (genreIds: number[]) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, preferences: genreIds };
    setCurrentUser(updated);
    storage.updateUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        token,
        isOnboarded,
        login,
        register,
        logout,
        switchRoleQuick,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
