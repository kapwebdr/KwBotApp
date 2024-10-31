import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Conversation, Message } from '../types';

export const conversationService = {
  async loadConversations(): Promise<Conversation[]> {
    try {
      const storedConversations = await AsyncStorage.getItem('conversations');
      if (storedConversations) {
        return JSON.parse(storedConversations);
      }
      return [];
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      return [];
    }
  },

  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      await AsyncStorage.setItem('conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des conversations:', error);
    }
  },

  createNewConversation(systemMessage: string): Conversation {
    return {
      id: uuid.v4() as string,
      messages: [],
      timestamp: Date.now(),
      systemMessage,
    };
  },

  updateConversation(
    conversations: Conversation[],
    conversationId: string,
    messages: Message[],
    systemMessage?: string
  ): Conversation[] {
    return conversations.map(conv =>
      conv.id === conversationId
        ? { 
            ...conv, 
            messages, 
            timestamp: Date.now(),
            ...(systemMessage && { systemMessage })
          }
        : conv
    );
  }
}; 