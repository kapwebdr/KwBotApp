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
    primary: '#00FF9C',
    background: '#1A1B1E',
    text: '#E0E0E0',
    userBubble: '#00FF9C',
    aiBubble: '#2A2B2E',
    userText: '#1A1B1E',
    aiText: '#E0E0E0',
    inputBackground: '#2A2B2E',
    border: '#3A3B3E',
    gray0: '#1A1B1E',
    gray25: '#1E1F22',
    gray50: '#222326',
    gray75: '#26272A',
    gray100: '#2A2B2E',
    gray150: '#2E2F32',
    gray200: '#323336',
    gray250: '#36373A',
    gray300: '#3A3B3E',
    gray350: '#3E3F42',
    gray400: '#424346',
    gray450: '#46474A',
    gray500: '#4A4B4E',
    gray550: '#4E4F52',
    gray600: '#525356',
    gray650: '#56575A',
    gray700: '#5A5B5E',
    gray750: '#5E5F62',
    gray800: '#626366',
    gray850: '#66676A',
    gray900: '#6A6B6E',
    gray950: '#6E6F72',
    gray1000: '#727376',
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