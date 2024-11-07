import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeType } from '../types/themes';
import { themes, getTheme, saveTheme } from '../styles/theme';

interface ThemeContextType {
  theme: Theme;
  currentTheme: ThemeType;
  setTheme: (themeType: ThemeType) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Export explicite du hook useTheme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('light');
  const [theme, setThemeObject] = useState<Theme>(themes.light);

  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedTheme = await getTheme();
      if (savedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeObject(prefersDark ? themes.dark : themes.light);
      } else {
        setThemeObject(themes[savedTheme]);
      }
      setCurrentTheme(savedTheme);
    };
    loadSavedTheme();
  }, []);

  const setTheme = async (themeType: ThemeType) => {
    setCurrentTheme(themeType);
    if (themeType === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeObject(prefersDark ? themes.dark : themes.light);
    } else {
      setThemeObject(themes[themeType]);
    }
    await saveTheme(themeType);
  };

  const value = {
    theme,
    currentTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
