import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from './types';

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    userBubble: '#007AFF',
    aiBubble: '#E9E9EB',
    userText: '#FFFFFF',
    aiText: '#000000',
    inputBackground: '#F2F2F7',
    border: '#C6C6C8',
    gray0: '#FFFFFF',
    gray25: '#FAFAFA',
    gray50: '#F5F5F5',
    gray75: '#F0F0F0',
    gray100: '#E6E6E6',
    gray150: '#D9D9D9',
    gray200: '#CCCCCC',
    gray250: '#BFBFBF',
    gray300: '#B3B3B3',
    gray350: '#A6A6A6',
    gray400: '#999999',
    gray450: '#8C8C8C',
    gray500: '#808080',
    gray550: '#737373',
    gray600: '#666666',
    gray650: '#595959',
    gray700: '#4D4D4D',
    gray750: '#404040',
    gray800: '#333333',
    gray850: '#262626',
    gray900: '#1A1A1A',
    gray950: '#0D0D0D',
    gray1000: '#000000',
  },
  fontSizes: {
    small: 12,
    medium: 14,
    large: 16,
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    text: '#FFFFFF',
    userBubble: '#0A84FF',
    aiBubble: '#1C1C1E',
    userText: '#FFFFFF',
    aiText: '#FFFFFF',
    inputBackground: '#1C1C1E',
    border: '#38383A',
    gray0: '#000000',
    gray25: '#0D0D0D',
    gray50: '#1A1A1A',
    gray75: '#262626',
    gray100: '#333333',
    gray150: '#404040',
    gray200: '#4D4D4D',
    gray250: '#595959',
    gray300: '#666666',
    gray350: '#737373',
    gray400: '#808080',
    gray450: '#8C8C8C',
    gray500: '#999999',
    gray550: '#A6A6A6',
    gray600: '#B3B3B3',
    gray650: '#BFBFBF',
    gray700: '#CCCCCC',
    gray750: '#D9D9D9',
    gray800: '#E6E6E6',
    gray850: '#F0F0F0',
    gray900: '#F5F5F5',
    gray950: '#FAFAFA',
    gray1000: '#FFFFFF',
  },
  fontSizes: {
    small: 12,
    medium: 14,
    large: 16,
  },
};

const THEME_STORAGE_KEY = 'app_theme';

export const getTheme = async (): Promise<Theme> => {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark') {
      return darkTheme;
    }
    return lightTheme;
  } catch (error) {
    console.error('Erreur lors de la récupération du thème:', error);
    return lightTheme;
  }
};

export const saveTheme = async (isDark: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du thème:', error);
  }
}; 