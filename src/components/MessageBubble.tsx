import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Message } from '../types';
import { createStyles } from '../styles/theme.styles';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Clipboard from '@react-native-clipboard/clipboard';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageBubbleProps {
  message: Message;
  isGenerating: boolean;
  loadingProgress: number;
  dots: string;
  isWaitingFirstResponse: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGenerating,
  loadingProgress,
  dots,
  isWaitingFirstResponse,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const renderCodeBlock = (code: string, language: string) => (
    <View style={styles.codeBlockContainer}>
      <SyntaxHighlighter
        language={language}
        style={tomorrow}
        customStyle={styles.codeBlock}
      >
        {code}
      </SyntaxHighlighter>
      <TouchableOpacity
        style={styles.copyButton}
        onPress={() => {
          Clipboard.setString(code);
          Alert.alert('Copié', 'Le code a été copié dans le presse-papiers');
        }}
      >
        <Ionicons name="copy-outline" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

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