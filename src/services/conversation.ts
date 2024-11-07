import { Conversation, Message } from '../types/conversations';
import { conversationsApiStorage, currentConversationApiStorage } from './apiStorage';
import { notificationService } from './notificationService';

export const conversationService = {
  async loadConversation(conversationId: string): Promise<Message[]> {
    try {
      const response = await conversationsApiStorage.loadConversation(conversationId);
      if (response) {
        notificationService.notify('success', 'Conversation chargée', false);
        return response.messages;
      }
      return [];
    } catch (error) {
      notificationService.notify('error', 'Erreur lors du chargement de la conversation', false);
      return [];
    }
  },

  async loadConversations(): Promise<{ conversations: Conversation[], currentId: string | null }> {
    try {
      const currentId = await currentConversationApiStorage.load();
      let conversations: Conversation[] = [];
      const response = await conversationsApiStorage.loadConversations();
      
      if (!response) return { conversations: [], currentId: null };

      // Convertir les conversations de l'API au format local
      conversations = response.conversations.map(conv => ({
        id: conv.id,
        messages: [], // Les messages seront chargés à la demande
        timestamp: new Date(conv.created_at).getTime(),
        title: conv.title
      }));

      // Si on a une conversation courante, charger ses messages
      if (currentId) {
        const messages = await this.loadConversation(currentId);
        // Mettre à jour la conversation courante avec ses messages
        conversations = conversations.map(conv =>
          conv.id === currentId
            ? { ...conv, messages }
            : conv
        );
      }

      return {
        conversations,
        currentId
      };
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      return { conversations: [], currentId: null };
    }
  },

  async saveConversations(conversations: Conversation[]): Promise<void> {
    if (!Array.isArray(conversations)) {
      console.error('saveConversations: conversations doit être un tableau');
      return;
    }

    try {
      // Sauvegarder chaque conversation individuellement
      for (const conversation of conversations) {
        await conversationsApiStorage.save(conversation);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des conversations:', error);
      throw error;
    }
  },

  async setCurrentConversation(conversationId: string | null): Promise<void> {
    try {
      await currentConversationApiStorage.save(conversationId);
    } catch (error) {
      console.error('Erreur lors de la définition de la conversation courante:', error);
      throw error;
    }
  },

  createNewConversation(): Conversation {
    return {
      id: '', // L'ID sera défini par l'API lors de la première sauvegarde
      messages: [],
      timestamp: Date.now()
    };
  },

  async updateConversation(
    conversations: Conversation[],
    conversationId: string,
    messages: Message[],
    toolId: string
  ): Promise<Conversation[]> {
    if (!Array.isArray(conversations)) {
      console.error('updateConversation: conversations doit être un tableau');
      return [];
    }

    try {
      const updatedConversation = {
        id: conversationId,
        messages,
        timestamp: Date.now()
      };

      // Mettre à jour dans l'API avec le toolId
      await conversationsApiStorage.save(updatedConversation, toolId);

      // Mettre à jour le tableau local
      const updatedConversations = conversations.map(conv =>
        conv.id === conversationId ? updatedConversation : conv
      );

      return updatedConversations;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la conversation:', error);
      throw error;
    }
  },

  async updateMessage(
    conversationId: string | undefined,
    message: Message,
    toolId: string,
    toolConfig?: any
  ): Promise<string> {
    try {
      const response = await conversationsApiStorage.save({
        conversationId,
        message,
        toolId,
        toolConfig
      });
      return response.id;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await conversationsApiStorage.delete(conversationId);
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      throw error;
    }
  }
}; 