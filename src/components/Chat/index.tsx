import React, { lazy, Suspense } from 'react';
import { View } from 'react-native';
import Messages from './Messages';
import { createStyles } from '../../styles/theme.styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useTool } from '../../hooks/useTool';
import { useConversation } from '../../contexts/ConversationContext';
import { TOOLS } from '../../types/tools';
import { LoadingBubble } from '../main/LoadingBubble';
export const Chat: React.FC = () => {
    const { theme } = useTheme();
    const { currentTool } = useTool();
    const { currentConversationId, isLoading } = useConversation();
    const styles = createStyles({ theme });
    const tool = TOOLS.find(t => t.id === currentTool);
    const isNewConversation = currentConversationId === '';

    // if (isLoading && !isNewConversation) {
    //   return (
    //     <View style={[styles.mainContent, { flex: 1 }]}>
    //       <LoadingBubble message="Chargement de la conversation..." />
    //     </View>
    //   );
    // }

    return (
        <View style={[styles.mainContent, { flex: 1 }]}>
          <Messages />
        </View>
      );
};
