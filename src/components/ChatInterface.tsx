import React from 'react';
import { View } from 'react-native';
import Messages from './Messages';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';
import { useConversation } from '../contexts/ConversationContext';
import { TOOLS } from '../types/tools';
import { FileManager } from './FileManager';
import { LoadingBubble } from './LoadingBubble';
import { Tool } from './Tool';
import { BottomBar } from './BottomBar';
import { FileManagerProvider } from '../contexts/FileManagerContext';

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
        <LoadingBubble status="Chargement de la conversation..." />
      </View>
    );
  }

  if (tool?.customComponent) {
    return (
      <View style={styles.mainContent}>
        <FileManagerProvider>
          <FileManager />
        </FileManagerProvider>
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
