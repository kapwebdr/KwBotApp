import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ConversationProvider } from './src/contexts/ConversationContext';
import { ToolProvider } from './src/contexts/ToolContext';
import { NotificationManager } from './src/components/NotificationManager';
import { useNotification } from './src/hooks/useNotification';
import { notificationService } from './src/services/notificationService';
import ChatBot from './src/ChatBot';

const AppContent: React.FC = () => {
  const { addNotification } = useNotification();

  React.useEffect(() => {
    notificationService.init((type, message, isPermanent) => 
      addNotification(type, message, isPermanent)
    );
  }, [addNotification]);

  React.useEffect(() => {
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
        <NotificationManager />
        <ConversationProvider>
          <ToolProvider>
            <ChatBot />
          </ToolProvider>
        </ConversationProvider>
      </View>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh',
  },
});

export default App;
