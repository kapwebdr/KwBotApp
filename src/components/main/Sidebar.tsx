import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Animated, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useConversation } from '../../contexts/ConversationContext';
import { createStyles } from '../../styles/theme.styles';
import { ConfirmationModal } from './ConfirmationModal';

interface SidebarProps {
  isOpen: boolean;
  sidebarAnimation: Animated.Value;
  onClose: () => void;
}

const MAX_PREVIEW_LENGTH = 50;

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  sidebarAnimation,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const {
    conversations,
    currentConversationId,
    startNewConversation,
    loadConversation,
    deleteConversation
  } = useConversation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{ id: string; title: string } | null>(null);

  const hasTemporaryConversation = React.useMemo(() => {
    return conversations.some(conv => !conv.id || conv.id === '');
  }, [conversations]);

  const handleLoadConversation = (id: string) => {
    onClose();
    loadConversation(id);
  };

  const handleNewConversation = () => {
    if (!hasTemporaryConversation) {
      onClose();
      startNewConversation();
    }
  };

  const initiateDelete = (id: string, title: string) => {
    if (!id) {
      deleteConversation('');
      return;
    }
    
    setConversationToDelete({ id, title });
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (conversationToDelete?.id) {
      await deleteConversation(conversationToDelete.id);
      setDeleteModalVisible(false);
      setConversationToDelete(null);
    }
  };

  const conversationsWithKeys = React.useMemo(() => {
    return conversations.map((conversation) => ({
      ...conversation,
      tempKey: conversation.id || '',
    }));
  }, [conversations]);

  const truncateMessage = (message: string) => {
    return message.length > MAX_PREVIEW_LENGTH
      ? message.substring(0, MAX_PREVIEW_LENGTH) + '...'
      : message;
  };

  if (!isOpen) return null;

  return (
    <>
      <View style={[
        styles.sidebar,
        {
          position: 'absolute',
          top: 60,
          left: 0,
          bottom: 0,
          width: 250,
          backgroundColor: theme.colors.background,
          borderRightWidth: 1,
          borderRightColor: theme.colors.border,
          transform: [{ translateX: sidebarAnimation }],
          zIndex: 1000,
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.newConversationButton,
            { backgroundColor: theme.colors.primary },
            hasTemporaryConversation && styles.disabledButton
          ]} 
          onPress={handleNewConversation}
          disabled={hasTemporaryConversation}
        >
          <Text style={[
            styles.newConversationButtonText, 
            { color: theme.colors.background },
            hasTemporaryConversation && styles.disabledButtonText
          ]}>
            {hasTemporaryConversation 
              ? "Conversation en cours..." 
              : "Nouvelle conversation"}
          </Text>
        </TouchableOpacity>
        
        <FlatList
          data={conversationsWithKeys}
          keyExtractor={(item) => item.tempKey}
          renderItem={({ item }) => (
            <View style={[
              styles.conversationItemContainer,
              { borderBottomColor: theme.colors.border }
            ]}>
              <TouchableOpacity
                style={[
                  styles.conversationItem,
                  currentConversationId === item.id && { backgroundColor: theme.colors.gray100 }
                ]}
                onPress={() => item.id ? handleLoadConversation(item.id) : handleLoadConversation('')}
              >
                <Text style={[styles.conversationTimestamp, { color: theme.colors.text }]}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
                <Text style={[styles.conversationPreview, { color: theme.colors.text }]}>
                  {item.title && item.title.length > 0
                    ? truncateMessage(item.title)
                    : 'Nouvelle conversation'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => initiateDelete(
                  item.id || item.tempKey,
                  item.title || 'Nouvelle conversation'
                )}
              >
                <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <ConfirmationModal
        isVisible={deleteModalVisible}
        title="Supprimer la conversation"
        message={`Êtes-vous sûr de vouloir supprimer la conversation "${conversationToDelete?.title || ''}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setConversationToDelete(null);
        }}
        type="danger"
        icon="trash"
      />
    </>
  );
};

export default Sidebar;