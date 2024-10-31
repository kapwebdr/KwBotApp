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

  if (!isOpen) return null;

  return (
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
          { backgroundColor: theme.colors.primary }
        ]} 
        onPress={startNewConversation}
      >
        <Text style={[styles.newConversationButtonText, { color: theme.colors.background }]}>
          Nouvelle conversation
        </Text>
      </TouchableOpacity>
      
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
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
              onPress={() => loadConversation(item.id)}
            >
              <Text style={[styles.conversationTimestamp, { color: theme.colors.text }]}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={[styles.conversationPreview, { color: theme.colors.text }]}>
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
    </View>
  );
};

export default Sidebar; 