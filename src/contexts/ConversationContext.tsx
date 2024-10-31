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
      const loadedConversations = await conversationService.loadConversations();
      setConversations(loadedConversations);
      
      if (loadedConversations.length > 0) {
        const lastConversation = loadedConversations[loadedConversations.length - 1];
        setCurrentConversationId(lastConversation.id);
        setMessages(lastConversation.messages);
        setSystemMessage(lastConversation.systemMessage);
      } else {
        startNewConversation();
      }
    };
    loadInitialConversations();
  }, []);

  // Sauvegarder automatiquement quand les messages changent
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const updatedConversations = conversationService.updateConversation(
        conversations,
        currentConversationId,
        messages,
        systemMessage
      );
      setConversations(updatedConversations);
      conversationService.saveConversations(updatedConversations);
    }
  }, [messages, currentConversationId, systemMessage]);

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setSystemMessage(conversation.systemMessage);
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
    const newConversation = conversationService.createNewConversation(systemMessage);
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    setMessages([]);
    await conversationService.saveConversations(updatedConversations);
  };

  const updateSystemMessage = (message: string) => {
    setSystemMessage(message);
    if (currentConversationId) {
      const updatedConversations = conversationService.updateConversation(
        conversations,
        currentConversationId,
        messages,
        message
      );
      setConversations(updatedConversations);
      conversationService.saveConversations(updatedConversations);
    }
  };

  const saveCurrentConversation = async () => {
    if (currentConversationId) {
      const updatedConversations = conversationService.updateConversation(
        conversations,
        currentConversationId,
        messages,
        systemMessage
      );
      setConversations(updatedConversations);
      await conversationService.saveConversations(updatedConversations);
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