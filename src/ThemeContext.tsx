import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme, getTheme, saveTheme } from './theme';

const ThemeContext = createContext(lightTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedTheme = await getTheme();
      setTheme(savedTheme);
    };
    loadSavedTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    await saveTheme(newTheme === darkTheme);
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
