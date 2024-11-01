import React, { useRef, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useConversation } from '../contexts/ConversationContext';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';

export const Messages: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { messages } = useConversation();
  const { 
    isGenerating, 
    loading, 
    tool,
    isModelLoading,
    modelLoadingProgress,
    modelLoadingStatus 
  } = useTool();
  const flatListRef = useRef<FlatList>(null);

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
  }, [messages, loading.isLoading, isModelLoading]);

  const renderMessages = () => {
    const messageComponents = messages.map((message, index) => (
      <MessageBubble
        key={`message-${index}`}
        message={message}
        isGenerating={isGenerating && index === messages.length - 1}
        loadingProgress={loading.progress}
        loadingStatus={loading.status}
        loadingType={loading.type}
      />
    ));

    if (loading.isLoading && loading.type === 'model') {
      messageComponents.push(
        <LoadingBubble
          key="model-loading"
          type="model"
          progress={loading.progress}
          status={loading.status}
          message={modelLoadingStatus}
        />
      );
    }

    return messageComponents;
  };

  const bottomPadding = tool?.configFields?.length ? 230 : 100;

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