import React from 'react';
import { View, TouchableOpacity, Text, Animated, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { Conversation } from '../types';
import { createStyles } from '../styles/theme.styles';

interface SidebarProps {
  isOpen: boolean;
  conversations: Conversation[];
  currentConversationId: string | null;
  sidebarAnimation: Animated.Value;
  onNewConversation: () => void;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const MAX_PREVIEW_LENGTH = 50;

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  conversations,
  currentConversationId,
  sidebarAnimation,
  onNewConversation,
  onLoadConversation,
  onDeleteConversation,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const truncateMessage = (message: string) => {
    return message.length > MAX_PREVIEW_LENGTH
      ? message.substring(0, MAX_PREVIEW_LENGTH) + '...'
      : message;
  };

  return (
    <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnimation }] }]}>
      <TouchableOpacity style={styles.newConversationButton} onPress={onNewConversation}>
        <Text style={styles.newConversationButtonText}>Nouvelle conversation</Text>
      </TouchableOpacity>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.conversationItemContainer}>
            <TouchableOpacity
              style={[
                styles.conversationItem,
                currentConversationId === item.id && styles.conversationItemActive
              ]}
              onPress={() => onLoadConversation(item.id)}
            >
              <Text style={styles.conversationTimestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.conversationPreview}>
                {item.messages.length > 0
                  ? truncateMessage(item.messages[0].content)
                  : 'Nouvelle conversation'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeleteConversation(item.id)}
            >
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </Animated.View>
  );
};

export default Sidebar; 