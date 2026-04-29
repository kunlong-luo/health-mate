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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('hm_token');
    const savedUser = localStorage.getItem('hm_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Fetch latest user data from server to check Pro status
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
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
