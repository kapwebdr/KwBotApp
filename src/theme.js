import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
  colors: {
    primary: '#4A90E2',
    background: '#F5F5F5',
    text: '#333333',
    userBubble: '#4A90E2',
    aiBubble: '#FFFFFF',
    userText: '#FFFFFF',
    aiText: '#333333',
    inputBackground: '#F0F0F0',
    border: '#E0E0E0',
  },
  fontSizes: {
    small: 12,
    medium: 16,
    large: 18,
  },
};

export const darkTheme = {
  colors: {
    primary: '#61DAFB',
    background: '#202123',
    text: '#ECECF1',
    userBubble: '#61DAFB',
    aiBubble: '#353740',
    userText: '#000000',
    aiText: '#ECECF1',
    inputBackground: '#353740',
    border: '#565869',
    gray0: '#000000',
    gray25: '#101014',
    gray50: '#202123',
    gray75: '#282832',
    gray100: '#353740',
    gray150: '#46464D',
    gray200: '#565869',
    gray250: '#5F5F75',
    gray300: '#6E6E80',
    gray350: '#7E7E90',
    gray400: '#8E8EA0',
    gray450: '#9D9DAE',
    gray500: '#ACACBE',
    gray550: '#B8B8CB',
    gray600: '#C5C5D2',
    gray650: '#D1D1DC',
    gray700: '#D9D9E3',
    gray750: '#E3E3EB',
    gray800: '#ECECF1',
    gray850: '#F2F2F5',
    gray900: '#F7F7F8',
    gray950: '#FCFCFD',
    gray1000: '#FFFFFF',
  },
  fontSizes: {
    small: 12,
    medium: 16,
    large: 18,
  },
};

export const getTheme = async () => {
  try {
    const savedTheme = await AsyncStorage.getItem('theme');
    return savedTheme === 'dark' ? darkTheme : lightTheme;
  } catch (error) {
    console.error('Erreur lors de la récupération du thème:', error);
    return lightTheme; // Thème par défaut en cas d'erreur
  }
};

export const saveTheme = async (isDark) => {
  try {
    await AsyncStorage.setItem('theme', isDark ? 'dark' : 'light');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du thème:', error);
  }
};
