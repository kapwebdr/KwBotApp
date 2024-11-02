import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, TouchableWithoutFeedback } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ErrorModal from './components/ErrorModal';
import Messages from './components/Messages';
import { Tool } from './components/Tool';
import { createStyles } from './styles/theme.styles';
import { Sidebar } from './components/Sidebar';
import { ConversationProvider } from './contexts/ConversationContext';
import { ToolProvider } from './contexts/ToolContext';
import { useTheme } from './contexts/ThemeContext';
import { BottomTabNavigator } from './navigation/BottomTabNavigator';
import { SystemWebSocket, SystemMetrics } from './services/websocket';
import { SystemStatus } from './components/SystemStatus';
import { ThemeSelector } from './components/ThemeSelector';

const SIDEBAR_WIDTH = 250;

const ChatBot: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const { theme, toggleTheme, isDark } = useTheme();
  const [systemStatus, setSystemStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  
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
    <NavigationContainer>
      <ConversationProvider>
        <ToolProvider>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={toggleSidebar}>
                <Ionicons name="menu" size={24} color={theme.colors.primary} />
              </TouchableOpacity>

              <SystemStatus status={systemStatus} metrics={systemMetrics} />

              <ThemeSelector />
            </View>

            <View style={styles.mainContent}>
              <Messages />
              <View style={styles.bottomContainer}>
                <Tool />
                <BottomTabNavigator />
              </View>
            </View>

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
    </NavigationContainer>
  );
};

export default ChatBot;
