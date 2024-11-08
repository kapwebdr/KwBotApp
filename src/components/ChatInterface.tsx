import React, { lazy, Suspense } from 'react';
import { View } from 'react-native';
import Messages from './Messages';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';
import { useConversation } from '../contexts/ConversationContext';
import { TOOLS } from '../types/tools';
import { LoadingBubble } from './LoadingBubble';
import { Tool } from './Tool';
import { BottomBar } from './BottomBar';
import { FileManagerProvider } from '../contexts/FileManagerContext';

// Mapping des composants personnalisés
const CustomComponents = {
  FileManager: lazy(() => import('./FileManager').then(module => ({ 
    default: module.FileManager 
  }))),
  SystemMonitor: lazy(() => import('./SystemMonitor').then(module => ({
    default: module.SystemMonitor
  }))),
} as const;

// Wrapper pour les composants personnalisés avec leur Provider
const Providers = {
  FileManager: FileManagerProvider,
  SystemMonitor: ({ children }: { children: React.ReactNode }) => <>{children}</>,
} as const;

// Composant wrapper mémorisé
const CustomComponentWrapper = React.memo(({ componentName }: { componentName: keyof typeof CustomComponents }) => {
  const Component = CustomComponents[componentName];
  const Provider = Providers[componentName];
  
  if (!Component) {
    console.error(`Component ${componentName} not found`);
    return null;
  }

  return (
    <Suspense fallback={<LoadingBubble message="Chargement..." />}>
      <Provider>
        <Component />
      </Provider>
    </Suspense>
  );
});

export const ChatInterface: React.FC = () => {
  const { theme } = useTheme();
  const { currentTool } = useTool();
  const { currentConversationId, isLoading } = useConversation();
  const styles = createStyles({ theme });
  const tool = TOOLS.find(t => t.id === currentTool);

  const isNewConversation = currentConversationId === '';

  if (isLoading && !isNewConversation) {
    return (
      <View style={styles.mainContent}>
        <LoadingBubble message="Chargement de la conversation..." />
      </View>
    );
  }

  if (tool?.customComponent && tool.customComponent in CustomComponents) {
    return (
      <View style={styles.mainContent}>
        <CustomComponentWrapper componentName={tool.customComponent as keyof typeof CustomComponents} />
      </View>
    );
  }

  return (
    <View style={styles.mainContent}>
      <Messages />
      <BottomBar ToolComponent={Tool} />
    </View>
  );
};
