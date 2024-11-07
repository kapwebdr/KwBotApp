import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Conversation, ConversationContextType } from '../types/conversations';
import { ToolType } from '../types/tools';
import { conversationService } from '../services/conversation';

export const ConversationContext = createContext<ConversationContextType | null>(null);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>("Vous êtes un assistant IA utile.");
  const [currentToolId, setCurrentToolId] = useState<ToolType>('llm');
  const [isLoading, setIsLoading] = useState(false);

  const setMessageSave = async (message: Message, toolConfig?: any, conversationId?: string) => {
    let currentId = currentConversationId;
    try {
      if (conversationId) {
        currentId = conversationId;
        setCurrentConversationId(conversationId);
      }

      const apiId = currentId === ''? undefined : currentId;
      const newId = await conversationService.updateMessage(
        apiId,
        message,
        currentToolId,
        toolConfig
      );

      if (!apiId) {
        setCurrentConversationId(newId);
        await conversationService.setCurrentConversation(newId);
        setConversations(prev => {
          const updatedConversations = prev.map(conv => {
            if (conv.id === '') {
              return {
                ...conv,
                id: newId,
                title: message.content.substring(0, 50),
                messages: [message],
                timestamp: Date.now(),
              };
            }
            return conv;
          });
          return updatedConversations;
        });

        return newId;
      } else {
        setConversations(prev => prev.map(conv =>
          conv.id === currentId
            ? {
                ...conv,
                messages: [...conv.messages, message],
                title: conv.title || message.content.substring(0, 50),
                timestamp: Date.now()
              }
            : conv
        ));

        return currentId;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du message:', error);
      throw error;
    }
  };

  const loadInitialConversations = async () => {
    setIsLoading(true);
    const { conversations: loadedConversations, currentId } = await conversationService.loadConversations();
    if (Array.isArray(loadedConversations)) {
      setConversations(loadedConversations);
      if (currentId && loadedConversations.find(conv => conv.id === currentId)) {
        const savedConversation = loadedConversations.find(conv => conv.id === currentId);
        setCurrentConversationId(currentId);
        setMessages(savedConversation!.messages);
      } else if (loadedConversations.length > 0) {
        const lastConversation = loadedConversations[loadedConversations.length - 1];
        setCurrentConversationId(lastConversation.id);
        setMessages(lastConversation.messages);
        await conversationService.setCurrentConversation(lastConversation.id);
      } else {
        startNewConversation();
      }
    } else {
      startNewConversation();
    }
    setIsLoading(false);
  };

  const loadConversation = async (conversationId: string) => {
    if (conversationId === '') {
      setMessages([]);
      setCurrentConversationId(conversationId);
      return;
    }

    try {
      setIsLoading(true);
      setMessages([]);
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        const messages = await conversationService.loadConversation(conversationId);
        setCurrentConversationId(conversationId);
        setMessages(messages);
        await conversationService.setCurrentConversation(conversationId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (idOrTempKey: string) => {
    try {
      const updatedConversations = conversations.filter(conv => 
        (conv.id !== idOrTempKey)
      );
      setConversations(updatedConversations);
      if (idOrTempKey === currentConversationId) {
        if (updatedConversations.length > 0) {
          loadConversation(updatedConversations[0].id);
        } else {
          startNewConversation();
        }
      }

      if (idOrTempKey === '') {
        return;
      }

      try {
        await conversationService.deleteConversation(idOrTempKey);
      } catch (error) {
        console.log('Erreur API lors de la suppression de la conversation:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
    }
  };

  const startNewConversation = () => {
    const newConversation = conversationService.createNewConversation();
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
    setIsLoading(false);
  };

  const updateSystemMessage = (message: string) => {
    setSystemMessage(message);
  };

  const saveCurrentConversation = async () => {
    if (currentConversationId) {
      const updatedConversations = await conversationService.updateConversation(
        conversations,
        currentConversationId,
        messages,
        currentToolId
      );
      setConversations(updatedConversations);
    }
  };

  const value = {
    messages,
    setMessages,
    setMessageSave,
    conversations,
    currentConversationId,
    systemMessage,
    currentToolId,
    setCurrentToolId,
    loadConversation,
    deleteConversation,
    startNewConversation,
    updateSystemMessage,
    saveCurrentConversation,
    setCurrentConversationId,
    loadInitialConversations,
    isLoading,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
