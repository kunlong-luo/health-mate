import { apiFetch } from '../lib/api';
import React, { createContext, useContext, useState, useEffect } from 'react';

type User = { id: string; phone?: string; email?: string; email_verified?: number; name?: string; is_pro?: number; avatar_emoji?: string };

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('hm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('hm_token');
  });

  useEffect(() => {
    if (token && user) {
      // Fetch latest user data from server to check Pro status
      apiFetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
         if (res.status === 401) {
            setToken(null);
            setUser(null);
            localStorage.removeItem('hm_token');
            localStorage.removeItem('hm_user');
            return null;
         }
         return res.json();
      })
      .then(data => {
        if (data && data.user) {
           setUser(data.user);
           localStorage.setItem('hm_user', JSON.stringify(data.user));
        }
      })
      .catch(() => console.log('Could not refresh user profile'));
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('hm_token', newToken);
    localStorage.setItem('hm_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_user');
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("Global 401 unauthorized intercepted. Logging out...");
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('hm_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
