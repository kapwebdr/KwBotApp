import React from 'react';
import { View, TouchableOpacity, Text, Animated, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useConversation } from '../contexts/ConversationContext';
import { createStyles } from '../styles/theme.styles';

interface SidebarProps {
  isOpen: boolean;
  sidebarAnimation: Animated.Value;
}

const MAX_PREVIEW_LENGTH = 50;

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  sidebarAnimation,
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

  const truncateMessage = (message: string) => {
    return message.length > MAX_PREVIEW_LENGTH
      ? message.substring(0, MAX_PREVIEW_LENGTH) + '...'
      : message;
  };

  return (
    <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnimation }] }]}>
      <TouchableOpacity style={styles.newConversationButton} onPress={startNewConversation}>
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
              onPress={() => loadConversation(item.id)}
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
              onPress={() => deleteConversation(item.id)}
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