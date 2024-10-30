import * as React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Message } from '../types';
import { createStyles } from '../styles/theme.styles';

interface MessageBubbleProps {
  message: Message;
  isGenerating: boolean;
  loadingProgress: number;
  dots: string;
  isWaitingFirstResponse: boolean;
  renderCodeBlock: (code: string, language: string) => React.ReactNode;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGenerating,
  loadingProgress,
  dots,
  isWaitingFirstResponse,
  renderCodeBlock,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Vérifier si le contenu est une image base64
  const imageMatch = message.content.match(/!\[.*?\]\((data:image\/[^;]+;base64,[^)]+)\)/);
  
  if (imageMatch) {
    const base64Data = imageMatch[1];
    return (
      <View style={[
        styles.messageBubble,
        message.role === 'human' ? styles.userBubble : styles.aiBubble
      ]}>
        {isGenerating ? (
          <View style={styles.imageGenerationProgress}>
            <Text style={[styles.messageText, message.role === 'human' ? styles.userText : styles.aiText]}>
              Génération de l'image en cours...
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${loadingProgress * 100}%` }
                ]} 
              />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: base64Data }}
            style={styles.messageImage}
            resizeMode="contain"
          />
        )}
      </View>
    );
  }

  // Si ce n'est pas une image, continuer avec le rendu normal du message
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = message.content.split(codeBlockRegex);

  return (
    <View style={[
      styles.messageBubble,
      message.role === 'human' ? styles.userBubble : styles.aiBubble
    ]}>
      {parts.map((part, index) => {
        if (index % 3 === 0) {
          return (
            <Text key={`text-${index}`} style={[
              styles.messageText,
              message.role === 'human' ? styles.userText : styles.aiText
            ]}>
              {message.role === 'assistant' && isWaitingFirstResponse && part === '...' 
                ? '...' + dots 
                : part}
            </Text>
          );
        } else if (index % 3 === 1) {
          const language = part || 'javascript';
          const code = parts[index + 1];
          return <View key={`code-${index}`}>{renderCodeBlock(code, language)}</View>;
        }
        return null;
      })}
    </View>
  );
};

export default MessageBubble; 