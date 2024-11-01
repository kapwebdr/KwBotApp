import React from 'react';
import { View, Text } from 'react-native';
import { Message } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { LoadingBubble } from './LoadingBubble';

interface MessageBubbleProps {
  message: Message;
  isGenerating: boolean;
  loadingProgress?: number;
  loadingStatus?: string;
  loadingType?: 'model' | 'generation' | 'translation' | 'ocr' | 'analysis';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGenerating,
  loadingProgress,
  loadingStatus,
  loadingType = 'generation'
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const isAI = message.role === 'assistant' || message.role === 'ai';

  if (isAI && isGenerating && message.content === '...') {
    return (
      <LoadingBubble 
        type={loadingType}
        progress={loadingProgress}
        status={loadingStatus || getDefaultLoadingMessage(loadingType)}
      />
    );
  }

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

const getDefaultLoadingMessage = (type: string): string => {
  switch (type) {
    case 'model':
      return 'Chargement du modèle...';
    case 'translation':
      return 'Traduction en cours...';
    case 'ocr':
      return 'Extraction du texte...';
    case 'analysis':
      return 'Analyse de l\'image...';
    default:
      return 'Génération en cours...';
  }
};