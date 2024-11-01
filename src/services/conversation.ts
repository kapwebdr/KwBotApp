import uuid from 'react-native-uuid';
import { Conversation, Message } from '../types';
import { conversationsStorage, currentConversationStorage } from './storage';

export const conversationService = {
  async loadConversations(): Promise<{ conversations: Conversation[], currentId: string | null }> {
    const conversations = await conversationsStorage.load();
    const currentId = await currentConversationStorage.load();
    return {
      conversations: Array.isArray(conversations) ? conversations : [],
      currentId
    };
  },

  async saveConversations(conversations: Conversation[]): Promise<void> {
    if (!Array.isArray(conversations)) {
      console.error('saveConversations: conversations doit être un tableau');
      return;
    }
    await conversationsStorage.save(conversations);
  },

  async setCurrentConversation(conversationId: string | null): Promise<void> {
    await currentConversationStorage.save(conversationId);
  },

  createNewConversation(): Conversation {
    return {
      id: uuid.v4() as string,
      messages: [],
      timestamp: Date.now(),
    };
  },

  async updateConversation(
    conversations: Conversation[],
    conversationId: string,
    messages: Message[],
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
          }
        : conv
    );

    await this.saveConversations(updatedConversations);
    return updatedConversations;
  }
}; 