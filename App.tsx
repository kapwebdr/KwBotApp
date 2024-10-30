import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ChatBot from './src/ChatBot';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from './src/ThemeContext';

export default function App() {
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        ...Ionicons.font,
      });
    }
    loadFonts();
  }, []);

  return (
    <ThemeProvider>
      <View style={styles.container}>
        <ChatBot />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh', // Ceci est spécifique au web
  },
});
