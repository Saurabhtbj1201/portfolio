import React, { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export const ThemeContext = createContext();

const lightTheme = {
  primary: '#6366f1',
  secondary: '#ec4899',
  accent: '#14b8a6',
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  white: '#ffffff',
  black: '#000000',
};

const darkTheme = {
  primary: '#6366f1',
  secondary: '#ec4899',
  accent: '#14b8a6',
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#475569',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  white: '#ffffff',
  black: '#000000',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await storage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await storage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
