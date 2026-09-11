import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setEmail(null);
      setLoading(false);
      return;
    }
    api.me()
      .then((data) => setEmail(data.email))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token } = await api.login(email, password);
    localStorage.setItem('token', token);
    setToken(token);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setEmail(null);
  }, []);

  return {
    user: token ? { email } : null,
    loading,
    signIn,
    signOut,
  };
}
