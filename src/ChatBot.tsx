import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ErrorModal from './components/ErrorModal';
import { ToolBar } from './components/ToolBar';
import Messages from './components/Messages';
import { Tool } from './components/Tool';
import { createStyles } from './styles/theme.styles';
import { Sidebar } from './components/Sidebar';
import { ConversationProvider } from './contexts/ConversationContext';
import { ToolProvider } from './contexts/ToolContext';
import { useTheme } from './contexts/ThemeContext';

const SIDEBAR_WIDTH = 250;

const ChatBot: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const { theme, toggleTheme, isDark } = useTheme();

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.timing(sidebarAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    Animated.timing(sidebarAnimation, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${process.env.BASE_API_URL}/models`);
      if (!response.ok) throw new Error('API non disponible');
      setIsApiAvailable(true);
      return true;
    } catch (error) {
      setIsApiAvailable(false);
      setApiErrorMessage(
        "Impossible de se connecter à l'API. Veuillez vérifier que le serveur est en cours d'exécution et réessayer."
      );
      return false;
    }
  };

  const handleRetryConnection = async () => {
    await checkApiConnection();
  };

  const styles = createStyles({ theme });

  return (
    <ConversationProvider>
      <ToolProvider>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={toggleSidebar}>
              <Ionicons name="menu" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <ToolBar />
            </View>

            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons 
                name={isDark ? "sunny" : "moon"} 
                size={24} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <Messages />
          <Tool />

          {isSidebarOpen && (
            <TouchableWithoutFeedback onPress={closeSidebar}>
              <View style={styles.sidebarOverlay} />
            </TouchableWithoutFeedback>
          )}

          <Sidebar
            isOpen={isSidebarOpen}
            sidebarAnimation={sidebarAnimation}
          />

          {!isApiAvailable && (
            <ErrorModal
              isVisible={true}
              onRetry={handleRetryConnection}
              message={apiErrorMessage}
            />
          )}
        </View>
      </ToolProvider>
    </ConversationProvider>
  );
};

export default ChatBot;
