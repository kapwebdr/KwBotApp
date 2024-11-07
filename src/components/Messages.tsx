import React, { useRef, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useConversation } from '../contexts/ConversationContext';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';
import { useBottomPadding } from '../hooks/useBottomPadding';

export const Messages: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { messages } = useConversation();
  const { 
    loading,
    tool,
    toolHeight
  } = useTool();
  const flatListRef = useRef<FlatList>(null);
  const bottomPadding = useBottomPadding();

  const scrollToBottom = () => {
    if (flatListRef.current) {
      try {
        flatListRef.current.scrollToEnd({ animated: false });
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 50);
      } catch (error) {
        console.error('Erreur lors du scroll:', error);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading.isLoading]);

  const renderMessages = () => {
    const messageComponents = messages.map((message, index) => (
      <MessageBubble
        key={`message-${index}`}
        message={message}
      />
    ));
    if (loading.isLoading) {
      messageComponents.push(
        <LoadingBubble 
          key="loading-bubble" 
          progress={loading.progress} 
          status={loading.status} 
        />
      );
    }
    return messageComponents;
  };

  return (
    <View style={[styles.messagesContainer, { paddingBottom: bottomPadding }]}>
      <FlatList
        ref={flatListRef}
        data={renderMessages()}
        renderItem={({ item }) => item}
        keyExtractor={(_, index) => `message-${index}`}
        style={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </View>
  );
};

export default Messages;
