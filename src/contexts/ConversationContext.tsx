import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, Conversation } from '../types';
import { conversationService } from '../services/conversation';

interface ConversationContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  systemMessage: string;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  startNewConversation: () => void;
  updateSystemMessage: (message: string) => void;
  saveCurrentConversation: () => void;
}

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

  // Charger les conversations au démarrage
  useEffect(() => {
    const loadInitialConversations = async () => {
      const { conversations: loadedConversations, currentId } = await conversationService.loadConversations();
      
      if (Array.isArray(loadedConversations)) {
        setConversations(loadedConversations);
        
        if (currentId && loadedConversations.find(conv => conv.id === currentId)) {
          // Charger la conversation sauvegardée
          const savedConversation = loadedConversations.find(conv => conv.id === currentId);
          setCurrentConversationId(currentId);
          setMessages(savedConversation!.messages);
        } else if (loadedConversations.length > 0) {
          // Charger la dernière conversation si pas de conversation sauvegardée
          const lastConversation = loadedConversations[loadedConversations.length - 1];
          setCurrentConversationId(lastConversation.id);
          setMessages(lastConversation.messages);
          await conversationService.setCurrentConversation(lastConversation.id);
        } else {
          // Créer une nouvelle conversation si aucune n'existe
          startNewConversation();
        }
      } else {
        startNewConversation();
      }
    };
    loadInitialConversations();
  }, []);

  // Sauvegarder uniquement quand les messages changent
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const saveConversation = async () => {
        const updatedConversations = await conversationService.updateConversation(
          conversations,
          currentConversationId,
          messages,
          systemMessage
        );
        setConversations(updatedConversations);
      };
      saveConversation();
    }
  }, [messages, currentConversationId, systemMessage]);

  const loadConversation = async (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      await conversationService.setCurrentConversation(conversationId);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    await conversationService.saveConversations(updatedConversations);
    
    if (conversationId === currentConversationId) {
      if (updatedConversations.length > 0) {
        loadConversation(updatedConversations[0].id);
      } else {
        startNewConversation();
      }
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
        systemMessage
      );
      setConversations(updatedConversations);
    }
  };

  const value = {
    messages,
    setMessages,
    conversations,
    currentConversationId,
    systemMessage,
    loadConversation,
    deleteConversation,
    startNewConversation,
    updateSystemMessage,
    saveCurrentConversation,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}; 