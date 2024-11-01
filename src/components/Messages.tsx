import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useConversation } from '../contexts/ConversationContext';
import { MessageBubble } from './MessageBubble';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';

export const Messages: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { messages } = useConversation();
  const { isGenerating, tool } = useTool();
  const flatListRef = useRef<FlatList>(null);
  
  const [isWaitingFirstResponse, setIsWaitingFirstResponse] = useState(false);
  const [dots, setDots] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

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
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(scrollToBottom, 500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaitingFirstResponse) {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaitingFirstResponse]);

  return (
    <View style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      paddingBottom: tool?.configFields ? 230 : 100, // Ajustement dynamique selon la présence de configFields
    }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `message-${index}`}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isGenerating={isGenerating}
            loadingProgress={loadingProgress}
            dots={dots}
            isWaitingFirstResponse={isWaitingFirstResponse}
          />
        )}
        style={{
          flex: 1,
          overflow: 'auto',
        }}
        contentContainerStyle={{
          padding: 10,
          flexGrow: 1,
        }}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        updateCellsBatchingPeriod={50}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        onMomentumScrollEnd={scrollToBottom}
        ListEmptyComponent={null}
      />
    </View>
  );
};

export default Messages; 