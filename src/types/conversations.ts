import { ToolType } from './tools';
export interface Message {
    role: string;
    content: any;
  }
  
  export interface Conversation {
    id: string;
    messages: Message[];
    timestamp: number;
    title?: string;
  }
  
  export interface HistoryMessage {
    id?: string;
    role: string;
    message: any;
    metadata?: {
      model?: string;
      temperature?: number;
      parameters?: object;
      timestamp?: string;
      tool?: {
        name: string;
        parameters: object;
      };
    };
  }
  
  export interface HistoryResponse {
    messages: HistoryMessage[];
    total: number;
    page: number;
    limit: number;
  }
  
  export interface SaveResponse {
    id: string;
    status: string;
  }
  
  export interface ConversationsResponse {
    conversations: {
      id: string;
      title: string;
      created_at: string;
    }[];
  }
  
  export interface SaveMessageParams {
    conversationId?: string;
    message: Message;
    toolId: string;
    toolConfig?: any;
  }
  
  export interface DeleteResponse {
    status: string;
    message: string;
  }


export interface ConversationContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  setMessageSave: (message: Message, toolConfig?: any,conversationId?:string) => string;
  conversations: Conversation[];
  currentConversationId: string | null;
  systemMessage: string;
  currentToolId: ToolType;
  setCurrentToolId: (toolId: ToolType) => void;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  startNewConversation: () => void;
  updateSystemMessage: (message: string) => void;
  saveCurrentConversation: () => void;
  loadInitialConversations: () => Promise<void>;
  setCurrentConversationId: (id: string) => void;
  isLoading: boolean;
}
