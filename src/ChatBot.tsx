import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, TouchableWithoutFeedback } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ErrorModal from './components/ErrorModal';
import { createStyles } from './styles/theme.styles';
import { Sidebar } from './components/Sidebar';
import { useTheme } from './contexts/ThemeContext';
import { ThemeSelector } from './components/ThemeSelector';
import { ChatInterface } from './components/ChatInterface';
import { useNotification } from './hooks/useNotification';
import { notificationService } from './services/notificationService';
import { useConversation } from './contexts/ConversationContext';

const SIDEBAR_WIDTH = 250;

const ChatBot: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const { loadInitialConversations } = useConversation();

  useEffect(() => {
    loadInitialConversations();
    notificationService.init((type, message, isPermanent) =>
      addNotification(type, message, isPermanent)
    );
  }, []);

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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="menu" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

          <ThemeSelector />
        </View>

        <ChatInterface />

        {isSidebarOpen && (
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <View style={styles.sidebarOverlay} />
          </TouchableWithoutFeedback>
        )}

        <Sidebar
          isOpen={isSidebarOpen}
          sidebarAnimation={sidebarAnimation}
          onClose={closeSidebar}
        />

        {!isApiAvailable && (
          <ErrorModal
            isVisible={true}
            onRetry={handleRetryConnection}
            message={apiErrorMessage}
          />
        )}
      </View>
    </NavigationContainer>
  );
};

export default ChatBot;
