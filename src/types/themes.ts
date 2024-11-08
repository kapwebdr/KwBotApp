
export type ThemeType = 'light' | 'dark' | 'dim' | 'system' | 'ocean' | 'forest';

export const THEME_OPTIONS: Record<ThemeType, { label: string; icon: string }> = {
  light: { label: 'Clair', icon: 'sunny-outline' },
  dark: { label: 'Sombre', icon: 'moon-outline' },
  dim: { label: 'Tamisé', icon: 'contrast-outline' },
  system: { label: 'Système', icon: 'phone-portrait-outline' },
  ocean: { label: 'Océan', icon: 'water-outline' },
  forest: { label: 'Forêt', icon: 'leaf-outline' }
} as const;

export interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
    userBubble: string;
    aiBubble: string;
    userText: string;
    aiText: string;
    inputBackground: string;
    border: string;
    gray0: string;
    gray25: string;
    gray50: string;
    gray75: string;
    gray100: string;
    gray150: string;
    gray200: string;
    gray250: string;
    gray300: string;
    gray350: string;
    gray400: string;
    gray450: string;
    gray500: string;
    gray550: string;
    gray600: string;
    gray650: string;
    gray700: string;
    gray750: string;
    gray800: string;
    gray850: string;
    gray900: string;
    gray950: string;
    gray1000: string;
    error: string;
    info: string;
    success: string;
    warning: string;
    codeBackground: string;
    codeBorder: string;
    codeText: string;
  };
  fontSizes: {
    small: number;
    medium: number;
    large: number;
  };
} 
