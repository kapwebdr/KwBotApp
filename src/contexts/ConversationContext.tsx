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
  const setMessageSave = async (message: Message, toolConfig?: any,conversationId?:string) => {
    let currentId = currentConversationId;
    try {
      if(conversationId)
      {
        currentId = conversationId;
        setCurrentConversationId(conversationId);
      }
      const newId = await conversationService.updateMessage(
        currentId || undefined,
        message,
        currentToolId,
        toolConfig
      );
      if (!currentId) {
        setCurrentConversationId(newId);
        await conversationService.setCurrentConversation(newId);
        const newConversation = {
          id: newId,
          messages: [message],
          timestamp: Date.now()
        };

        setConversations(prev => [newConversation, ...prev]);
        return newId;
      } else {
        setConversations(prev => prev.map(conv =>
          conv.id === currentId
            ? { 
                ...conv, 
                messages: [...conv.messages, message],
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
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = conversations.find(conv => conv.id === conversationId);
      console.log(conversationId);
      if (conversation) {
        // Charger les messages depuis l'API
        const messages = await conversationService.loadConversation(conversationId);
        setCurrentConversationId(conversationId);
        setMessages(messages);
        await conversationService.setCurrentConversation(conversationId);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
    }
  };

  const deleteConversation = async (idOrTempKey: string) => {
    try {
      // Mettre à jour l'état local avant la suppression API
      const updatedConversations = conversations.filter(conv => 
        // Vérifier à la fois l'ID et la clé temporaire potentielle
        (conv.id !== idOrTempKey && `temp-${conversations.indexOf(conv)}-${conv.timestamp}` !== idOrTempKey)
      );
      setConversations(updatedConversations);
      // Si la conversation supprimée était la conversation courante
      if (idOrTempKey === currentConversationId) {
        if (updatedConversations.length > 0) {
          loadConversation(updatedConversations[0].id);
        } else {
          startNewConversation();
        }
      }

      // Ne tenter la suppression API que si nous avons un vrai ID
      if (idOrTempKey.startsWith('temp-')) {
        return; // Sortir sans appeler l'API pour les conversations temporaires
      }

      // Tenter de supprimer dans l'API, mais ne pas bloquer si erreur
      try {
        await conversationService.deleteConversation(idOrTempKey);
      } catch (error) {
        console.log('Erreur API lors de la suppression de la conversation:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
    }
  };

  const startNewConversation = async () => {
    const newConversation = conversationService.createNewConversation();
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
    await conversationService.setCurrentConversation(newConversation.id);
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
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
