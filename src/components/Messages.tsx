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
  const { isGenerating } = useTool();
  const flatListRef = useRef<FlatList>(null);
  
  const [isWaitingFirstResponse, setIsWaitingFirstResponse] = useState(false);
  const [dots, setDots] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <View style={styles.contentContainer}>
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
        style={styles.messageList}
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