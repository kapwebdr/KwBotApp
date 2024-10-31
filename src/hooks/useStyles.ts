import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';

export const useStyles = (currentTool?: string) => {
  const { theme, isDark } = useTheme();
  
  return useMemo(() => 
    createStyles({ theme }, currentTool), 
    [theme, currentTool, isDark]
  );
}; 