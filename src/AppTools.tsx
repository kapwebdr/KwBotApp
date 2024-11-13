import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import ErrorModal from './components/main/ErrorModal';
import { createStyles } from './styles/theme.styles';
import { useTheme } from './contexts/ThemeContext';
import { useNotification } from './hooks/useNotification';
import { notificationService } from './services/notificationService';
import { useConversation } from './contexts/ConversationContext';
import { TopBar } from './components/main/TopBar';
import { BottomBar } from './components/main/BottomBar';
import { Tool } from './components/main/Tool';
import { useTool } from './hooks/useTool';
import { LoadingBubble } from './components/main/LoadingBubble';

const ComponentWrapper = React.memo(({ componentName, componentConfig }) => {
  const { component, providers = [] } = componentConfig.tool;

  // Mémoriser les Providers pour éviter qu'ils ne soient recréés à chaque rendu
  const WrappedComponent = useMemo(() => {
    if (!component) {
      return null;
    }

    // Créer une arborescence de providers dynamiquement
    return providers.reduceRight((WrappedComponent, Provider) => {
      return (props) => (
        <Provider>
          <WrappedComponent {...props} />
        </Provider>
      );
    }, component);
  }, [component, providers]); // Mémorisation basée sur `component` et `providers`

  // Si le composant n'est pas disponible, retourner un message de chargement
  if (!WrappedComponent) {
    return <LoadingBubble message="Chargement..." />;
  }

  // Rendre le composant avec les Providers appliqués
  return React.createElement(WrappedComponent);
});

const AppTools: React.FC = () => {
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const { loadInitialConversations } = useConversation();
  const { currentTool, currentToolConfig } = useTool();
  const styles = createStyles({ theme });
  useEffect(() => {
    //checkApiConnection();
    loadInitialConversations();
    notificationService.init((type, message, isPermanent) =>
      addNotification(type, message, isPermanent)
    );
  }, []);
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


  return (
    <NavigationContainer>
      <View style={styles.container}>
        <TopBar />
        {currentTool && (
          <ComponentWrapper componentConfig={currentToolConfig} />
        )}
        {!isApiAvailable && (
          <ErrorModal
            isVisible={true}
            onRetry={handleRetryConnection}
            message={apiErrorMessage}
          />
        )}
        <BottomBar  ToolComponent={Tool} />
      </View>
    </NavigationContainer>
  );
};

export default AppTools;
