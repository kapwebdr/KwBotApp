import React from 'react';
import { View, Text } from 'react-native';
import { Message } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const isAI = message.role === 'assistant' || message.role === 'ai';

  return (
    <View
      style={[
        styles.messageBubble,
        isAI ? styles.aiBubble : styles.userBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          isAI ? styles.aiText : styles.userText,
        ]}
      >
        {message.content}
      </Text>
    </View>
  );
};
