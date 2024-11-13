import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types/conversations';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import * as FileSystem from 'expo-file-system';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MoveFileModal } from '../FileManager/MoveFileModal';

interface MessageBubbleProps {
  message: Message;
  onSave: (content: string, isBase64Image: boolean, isBase64Audio: boolean) => void;
}

// Fonction utilitaire pour détecter le code dans le message
const detectCodeBlock = (content: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const matches = [...content.matchAll(codeBlockRegex)];
  
  if (matches.length === 0) return null;
  
  return matches.map(match => ({
    language: match[1] || 'text',
    code: match[2].trim()
  }));
};

// Fonction pour rendre le texte avec la coloration syntaxique
const renderTextWithCodeBlocks = (content: string, textStyle: any, styles: any) => {
  const codeBlocks = detectCodeBlock(content);
  
  if (!codeBlocks) {
    return <Text style={textStyle}>{content}</Text>;
  }

  const parts = content.split(/```(\w+)?\n[\s\S]*?```/);
  
  return (
    <View>
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          return part ? <Text key={index} style={textStyle}>{part}</Text> : null;
        }
        const codeBlock = codeBlocks[Math.floor(index / 2)];
        return (
          <View key={index} style={styles.codeBlockContainer}>
            <SyntaxHighlighter
              language={codeBlock.language}
              style={vscDarkPlus}
              customStyle={{
                padding: 12,
                borderRadius: 8,
                marginVertical: 8,
                fontSize: 14,
              }}
            >
              {codeBlock.code}
            </SyntaxHighlighter>
          </View>
        );
      })}
    </View>
  );
};

const utf8ToBase64 = (str: string) => {
  try {
    // Convertir d'abord la chaîne en UTF-8
    const bytes = new TextEncoder().encode(str);
    // Convertir les bytes en chaîne base64
    const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  } catch (error) {
    console.error('Erreur lors de l\'encodage base64:', error);
    throw error;
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSave
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [isMessagePressed, setIsMessagePressed] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState<'copy' | 'download' | 'save' | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const isAI = message.role === 'assistant' || message.role === 'ai';
  const isBase64Image = /^data:image\/[a-zA-Z]+;base64,/.test(message.content);
  const isBase64Audio = /^data:audio\/[a-zA-Z]+;base64,/.test(message.content);

  const handleCopy = async () => {
    try {
      if (isBase64Image || isBase64Audio) {
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

  const handleDownload = async () => {
    try {
      if (Platform.OS === 'web') {
        // Gestion web avec les APIs du navigateur
        if (isBase64Image) {
          const link = document.createElement('a');
          link.href = message.content;
          link.download = `image_${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (isBase64Audio) {
          const link = document.createElement('a');
          link.href = message.content;
          link.download = `audio_${Date.now()}.wav`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
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
      } else {
        // Gestion mobile avec expo-file-system
        const base64Data = message.content.match(/base64,([^)]*)/)?.[1];
        if (base64Data) {
          const filename = isBase64Image ? 
            `${FileSystem.documentDirectory}image_${Date.now()}.png` :
            isBase64Audio ? 
              `${FileSystem.documentDirectory}audio_${Date.now()}.wav` :
              `${FileSystem.documentDirectory}message_${Date.now()}.txt`;

          await FileSystem.writeAsStringAsync(filename, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleSave = () => {
    onSave(message.content, isBase64Image, isBase64Audio);
  };

  const renderContent = () => {
    if (isBase64Image) {
      return (
        <Image
          source={{ uri: message.content }}
          style={styles.messageImage}
        />
      );
    } else if (isBase64Audio) {
      return (
        <audio 
          controls 
          src={message.content}
          style={styles.messageAudio}
        >
          Votre navigateur ne supporte pas l'élément audio.
        </audio>
      );
    } else {
      if (typeof message.content !== 'string') {
        return null;
      }
      return renderTextWithCodeBlocks(
        message.content,
        [
          styles.messageText,
          isAI ? styles.aiText : styles.userText,
        ],
        styles
      );
    }
  };

  return (
    <>
      <Pressable
        onPressIn={() => setIsMessagePressed(true)}
        onPressOut={() => setIsMessagePressed(false)}
        style={[
          styles.messageBubble,
          isAI ? styles.aiBubble : styles.userBubble,
        ]}
      >
        <View style={styles.messageContent}>
          {renderContent()}
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
                  isButtonPressed === 'download' && styles.actionButtonActive,
                ]}
              >
                <Ionicons
                  name="download-outline"
                  size={16}
                  style={isButtonPressed === 'download' ? styles.actionIconActive : styles.actionIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPressIn={() => setIsButtonPressed('save')}
                onPressOut={() => setIsButtonPressed(null)}
                onPress={handleSave}
                style={[
                  styles.actionButton,
                  isButtonPressed === 'save' && styles.actionButtonActive,
                ]}
              >
                <Ionicons
                  name="save-outline"
                  size={16}
                  style={isButtonPressed === 'save' ? styles.actionIconActive : styles.actionIcon}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Pressable>

      <MoveFileModal
        isVisible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onMove={handleSave}
        currentPath="/"
        itemToMove={null}
        directoryOnly={true}
        title="Sauvegarder le fichier"
        confirmText="Sauvegarder ici"
      />
    </>
  );
};
