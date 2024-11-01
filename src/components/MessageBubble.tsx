import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [isMessagePressed, setIsMessagePressed] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState<'copy' | 'download' | null>(null);

  const isAI = message.role === 'assistant' || message.role === 'ai';
  const isImage = message.content.startsWith('![');

  const handleCopy = async () => {
    try {
      if (isImage) {
        const base64Data = message.content.match(/base64,([^)]*)/)?.[1];
        if (base64Data) {
          await navigator.clipboard.writeText(base64Data);
        }
      } else {
        await navigator.clipboard.writeText(message.content);
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleDownload = () => {
    try {
      if (isImage) {
        const base64Data = message.content.match(/base64,([^)]*)/)?.[1];
        if (base64Data) {
          const link = document.createElement('a');
          link.href = `data:image/png;base64,${base64Data}`;
          link.download = `image_${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        const blob = new Blob([message.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `message_${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  return (
    <Pressable
      onPressIn={() => setIsMessagePressed(true)}
      onPressOut={() => setIsMessagePressed(false)}
      style={[
        styles.messageBubble,
        isAI ? styles.aiBubble : styles.userBubble,
      ]}
    >
      <View style={styles.messageContent}>
        <Text
          style={[
            styles.messageText,
            isAI ? styles.aiText : styles.userText,
          ]}
        >
          {message.content}
        </Text>
        {isAI && (isMessagePressed || Platform.OS === 'web') && (
          <View style={styles.messageActions}>
            <TouchableOpacity 
              onPressIn={() => setIsButtonPressed('copy')}
              onPressOut={() => setIsButtonPressed(null)}
              onPress={handleCopy}
              style={[
                styles.actionButton,
                isButtonPressed === 'copy' && styles.actionButtonActive
              ]}
            >
              <Ionicons 
                name="copy-outline" 
                size={16} 
                style={isButtonPressed === 'copy' ? styles.actionIconActive : styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPressIn={() => setIsButtonPressed('download')}
              onPressOut={() => setIsButtonPressed(null)}
              onPress={handleDownload}
              style={[
                styles.actionButton,
                isButtonPressed === 'download' && styles.actionButtonActive
              ]}
            >
              <Ionicons 
                name="download-outline" 
                size={16} 
                style={isButtonPressed === 'download' ? styles.actionIconActive : styles.actionIcon}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
};
