import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../types';
import { lightTheme, darkTheme, getTheme, saveTheme } from '../theme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedTheme = await getTheme();
      setTheme(savedTheme);
      setIsDark(savedTheme === darkTheme);
    };
    loadSavedTheme();
  }, []);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    const newTheme = newIsDark ? darkTheme : lightTheme;
    setIsDark(newIsDark);
    setTheme(newTheme);
    await saveTheme(newIsDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
