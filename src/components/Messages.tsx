import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useConversation } from '../contexts/ConversationContext';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';
import { useBottomPadding } from '../hooks/useBottomPadding';
import { MoveFileModal } from './MoveFileModal';
import { fileUploadService } from '../services/fileUploadService';
import { notificationService } from '../services/notificationService';

export const Messages: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { messages } = useConversation();
  const { loading, tool, toolHeight } = useTool();
  const flatListRef = useRef<FlatList>(null);
  const bottomPadding = useBottomPadding();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [contentToSave, setContentToSave] = useState<{
    content: string;
    isBase64Image: boolean;
    isBase64Audio: boolean;
  } | null>(null);

  const handleSave = async (destinationPath: string) => {
    if (!contentToSave) return;

    try {
      let content = contentToSave.content;
      let fileName = '';
      let mimeType = '';

      if (contentToSave.isBase64Image) {
        fileName = `image_${Date.now()}.png`;
        content = contentToSave.content.split(',')[1];
        mimeType = 'image/png';
      } else if (contentToSave.isBase64Audio) {
        fileName = `audio_${Date.now()}.wav`;
        content = contentToSave.content.split(',')[1];
        mimeType = 'audio/wav';
      } else {
        fileName = `message_${Date.now()}.txt`;
        const encoder = new TextEncoder();
        const bytes = encoder.encode(contentToSave.content);
        content = btoa(String.fromCharCode(...new Uint8Array(bytes)));
        mimeType = 'text/plain';
      }

      const fullPath = `${destinationPath}/${fileName}`.replace(/\/+/g, '/');
      
      const success = await fileUploadService.uploadBase64File({
        content,
        path: fullPath,
        mime_type: mimeType
      });

      if (success) {
        notificationService.notify('success', 'Fichier sauvegardé avec succès');
        setShowSaveModal(false);
        setContentToSave(null);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      notificationService.notify('error', 'Erreur lors de la sauvegarde du fichier');
    }
  };

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
        onSave={(content, isBase64Image, isBase64Audio) => {
          setContentToSave({ content, isBase64Image, isBase64Audio });
          setShowSaveModal(true);
        }}
      />
    ));

    if (loading.isLoading) {
      messageComponents.push(
        <LoadingBubble 
          key="loading-bubble" 
          progress={loading.progress} 
          message={loading.status} 
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

      <MoveFileModal
        isVisible={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setContentToSave(null);
        }}
        onMove={handleSave}
        currentPath="/"
        itemToMove={null}
        directoryOnly={true}
        title="Sauvegarder le fichier"
        confirmText="Sauvegarder ici"
      />
    </View>
  );
};

export default Messages;
