import React, { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking auth...');
      const token = await storage.getItem('authToken');
      const userData = await storage.getItem('user');
      console.log('Token:', token ? 'exists' : 'none');
      console.log('User:', userData);
      if (token && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
      console.log('Auth check complete');
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Attempting login...');
      const response = await authApi.login(credentials);
      console.log('Login response:', response);

      // Handle different response structures
      const token = response.token || response.data?.token;
      const userData = response.user || response.data?.user || { email: credentials.email };

      if (!token) {
        return { success: false, error: 'No token received' };
      }

      await storage.setItem('authToken', token);
      await storage.setItem('user', userData);
      setUser(userData);
      console.log('Login successful');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    await storage.removeItem('authToken');
    await storage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
