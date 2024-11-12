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
import { DbManagerProvider } from '../contexts/DbManagerContext';

// Mapping des composants personnalisés
const CustomComponents = {
  FileManager: lazy(() => import('./FileManager').then(module => ({ 
    default: module.FileManager 
  }))),
  SystemMonitor: lazy(() => import('./SystemMonitor').then(module => ({
    default: module.SystemMonitor
  }))),
  DbManager: lazy(() => import('./DbManager').then(module => ({
    default: module.DbManager
  }))),
  TaskManager: lazy(() => import('./TaskManager').then(module => ({
    default: module.TaskManager
  }))),
  Calendar: lazy(() => import('./Calendar').then(module => ({
    default: module.Calendar
  }))),
} as const;

// Wrapper pour les composants personnalisés avec leur Provider
const Providers = {
  FileManager: FileManagerProvider,
  SystemMonitor: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DbManager: DbManagerProvider,
  TaskManager: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Calendar: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
      <View style={[styles.mainContent, { flex: 1 }]}>
        <LoadingBubble message="Chargement de la conversation..." />
      </View>
    );
  }

  if (tool?.customComponent && tool.customComponent in CustomComponents) {
    return (
      <View style={[styles.mainContent, { flex: 1 }]}>
        <CustomComponentWrapper componentName={tool.customComponent as keyof typeof CustomComponents} />
      </View>
    );
  }

  return (
    <View style={[styles.mainContent, { flex: 1 }]}>
      <Messages />
      <BottomBar ToolComponent={Tool} />
    </View>
  );
};
