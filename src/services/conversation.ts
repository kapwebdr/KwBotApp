import uuid from 'react-native-uuid';
import { Conversation, Message } from '../types';
import { conversationsStorage } from './storage';

export const conversationService = {
  async loadConversations(): Promise<Conversation[]> {
    const conversations = await conversationsStorage.load();
    return Array.isArray(conversations) ? conversations : [];
  },

  async saveConversations(conversations: Conversation[]): Promise<void> {
    if (!Array.isArray(conversations)) {
      console.error('saveConversations: conversations doit être un tableau');
      return;
    }
    await conversationsStorage.save(conversations);
  },

  createNewConversation(systemMessage: string): Conversation {
    return {
      id: uuid.v4() as string,
      messages: [],
      timestamp: Date.now(),
      systemMessage,
    };
  },

  async updateConversation(
    conversations: Conversation[],
    conversationId: string,
    messages: Message[],
    systemMessage?: string
  ): Promise<Conversation[]> {
    if (!Array.isArray(conversations)) {
      console.error('updateConversation: conversations doit être un tableau');
      return [];
    }

    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId
        ? { 
            ...conv, 
            messages, 
            timestamp: Date.now(),
            ...(systemMessage && { systemMessage })
          }
        : conv
    );

    await this.saveConversations(updatedConversations);
    return updatedConversations;
  }
}; 