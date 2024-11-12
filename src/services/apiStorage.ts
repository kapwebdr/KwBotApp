import { apiHandler } from './apiHandler';
import {
  Conversation,
  Message,
  HistoryResponse,
  SaveResponse,
  ConversationsResponse,
  SaveMessageParams,
  DeleteResponse,
} from '../types/conversations';
import { sessionStorage } from './storage';
import { notificationService } from './notificationService';

export class ApiStorageService<T> {
  private endpoint: string;
  private defaultValue: T;

  constructor(endpoint: string, defaultValue: T) {
    this.endpoint = endpoint;
    this.defaultValue = defaultValue;
  }

  protected async executeRequest<R>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any
  ): Promise<R | null> {
    try {
      const sessionId = await sessionStorage.load();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (sessionId) {
        headers['x-session-id'] = sessionId;
      }

      const response = await apiHandler.executeRequest<R>(
        `${this.endpoint}${path}`,
        method,
        body,
        headers
      );

      return response;
    } catch (error) {
      notificationService.notify(
        'error',
        `Erreur de requête API (${method} ${path}): ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        true
      );
      return null;
    }
  }
}

export class ConversationApiStorage extends ApiStorageService<Conversation[]> {
  constructor() {
    super('/history', []);
  }

  async loadConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const response = await this.executeRequest<HistoryResponse>(
        'GET',
        `/conversation/${conversationId}`
      );

      if (!response?.messages) {
        return null;
      }

      const messages = response.messages.map(msg => ({
        role: msg.role as Message['role'],
        content: msg.message,
        metadata: msg.metadata,
      }));

      return {
        id: conversationId,
        messages,
        timestamp: new Date(response.messages[0]?.metadata?.timestamp || Date.now()).getTime(),
        title: response.messages[0]?.metadata?.tool?.parameters?.title
      };
    } catch (error) {
      notificationService.notify(
        'error',
        `Erreur lors du chargement de la conversation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        true
      );
      return null;
    }
  }

  async loadConversations(): Promise<ConversationsResponse | null> {
    try {
      const response = await this.executeRequest<ConversationsResponse>(
        'GET',
        '/conversations'
      );

      if (!response?.conversations) {
        console.error('Format de réponse invalide pour loadConversations');
        return null;
      }

      return response;
    } catch (error) {
      notificationService.notify(
        'error',
        `Erreur lors du chargement des conversations: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        true
      );
      return null;
    }
  }

  async save({ conversationId, message, toolId, toolConfig, isMedia }: SaveMessageParams): Promise<SaveResponse | null> {
    try {
      const response = await this.executeRequest<SaveResponse>(
        'POST',
        '/conversation',
        {
          id: conversationId,
          role: message.role === 'human' ? 'user' : 
                message.role === 'ai' ? 'assistant' : 
                message.role,
          message: message.content,
          metadata: {
            tool: {
              name: toolId,
              parameters: toolConfig || {}
            },
            isMedia
          }
        }
      );

      return response;
    } catch (error) {
      notificationService.notify(
        'error',
        `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        true
      );
      return null;
    }
  }

  async delete(conversationId: string): Promise<DeleteResponse | null> {
    try {
      const response = await this.executeRequest<DeleteResponse>(
        'DELETE',
        `/conversation/${conversationId}`
      );

      if (!response) {
        return null;
      }

      return response;
    } catch (error) {
      notificationService.notify(
        'error',
        `Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        true
      );
      return null;
    }
  }
}

export const conversationsApiStorage = new ConversationApiStorage();

export const currentConversationApiStorage = {
  async save(conversationId: string | null): Promise<void> {
    if (conversationId) {
      try {
        await conversationsApiStorage.loadConversation(conversationId);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la conversation courante:', error);
      }
    }
  },
  
  async load(): Promise<string | null> {
    try {
      const response = await conversationsApiStorage.loadConversations();
      if (response?.conversations?.length > 0) {
        return response.conversations[0].id;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation courante:', error);
      return null;
    }
  }
};