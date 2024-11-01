import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ToolType, ToolConfig, Message, TOOLS } from '../types';
import { useConversation } from './ConversationContext';
import { apiHandler } from '../services/apiHandler';
import { useLoading } from '../hooks/useLoading';

interface ToolContextType {
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  toolConfig: ToolConfig;
  updateToolConfig: (config: Partial<ToolConfig>) => void;
  handleToolAction: (action: ActionType, ...args: any[]) => Promise<void>;
  isToolMenuOpen: boolean;
  setIsToolMenuOpen: (isOpen: boolean) => void;
  isGenerating: boolean;
  input: string;
  setInput: (input: string) => void;
  availableModels: string[];
  selectConfigs: Record<string, any>;
  isModelLoading: boolean;
  modelLoadingProgress: number;
  modelLoadingStatus: string;
  loadSelectedModel: (modelName: string) => Promise<void>;
  isModelLoaded: boolean;
  loading: ReturnType<typeof useLoading>;
}

export const ToolContext = createContext<ToolContextType | null>(null);

interface ToolState {
  config: ToolConfig;
  loadedModel?: string;
  isModelLoaded: boolean;
}

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTool, setCurrentTool] = useState<ToolType>('chat');
  const [toolConfig, setToolConfig] = useState<ToolConfig>({});
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [toolStates, setToolStates] = useState<Record<ToolType, ToolState>>({} as Record<ToolType, ToolState>);
  const loading = useLoading();

  const { messages, setMessages, systemMessage } = useConversation();

  const updateToolConfig = (config: Partial<ToolConfig>) => {
    const newConfig = { ...toolConfig, ...config };
    setToolConfig(newConfig);
    
    setToolStates(prev => ({
      ...prev,
      [currentTool]: {
        ...prev[currentTool],
        config: newConfig
      }
    }));
  };

  // Initialisation des outils
  useEffect(() => {
    const initializeTool = async () => {
      try {
        const tool = TOOLS.find(t => t.id === currentTool);
        if (!tool) return;

        if (tool.api?.init) {
          const result = await apiHandler.executeApiAction(
            currentTool,
            'init',
            undefined,
            loading.updateProgress
          );
          if (result && tool.config?.requiresModel) {
            setAvailableModels(result);
          }
        }

        setToolConfig(tool.defaultConfig || {});
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'outil:', error);
      }
    };

    initializeTool();
  }, [currentTool]);

  const loadSelectedModel = async (modelName: string) => {
    if (!modelName) return;

    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool?.api?.load) return;

    const currentState = toolStates[currentTool];
    if (currentState?.loadedModel === modelName && currentState.isModelLoaded) {
      return;
    }

    loading.startLoading('model', 'Chargement du modèle...');

    try {
      const success = await apiHandler.executeApiAction(
        currentTool,
        'load',
        { modelId: modelName },
        loading.updateProgress
      );

      if (success) {
        setToolStates(prev => ({
          ...prev,
          [currentTool]: {
            ...prev[currentTool],
            loadedModel: modelName,
            isModelLoaded: true
          }
        }));
        setIsModelLoaded(true);
        updateToolConfig({ model: modelName });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error);
      updateToolConfig({ model: undefined });
      setIsModelLoaded(false);
    } finally {
      loading.stopLoading();
    }
  };

  const handleToolAction = async (actionType: ActionType, ...args: any[]) => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool) return;

    const toolAction = tool.actions?.find(a => a.type === actionType);
    if (!toolAction) return;

    // Validation des prérequis
    if (toolAction.requiresInput && !input.trim()) {
      console.error(toolAction.errorMessages?.noInput);
      return;
    }

    if (toolAction.requiresModel && !toolConfig.model) {
      console.error(toolAction.errorMessages?.noModel);
      return;
    }

    if (toolAction.requiresModelLoaded && !isModelLoaded) {
      console.error(toolAction.errorMessages?.modelNotLoaded);
      return;
    }

    try {
      setIsGenerating(true);
      
      const newMessages = [
        ...messages,
        { role: 'human', content: input } as Message,
        { role: 'assistant', content: '...' } as Message
      ];
      setMessages(newMessages.slice(0, -1));
      setInput('');

      const params = {
        ...toolConfig,
        input,
        messages: newMessages.slice(0, -1),
        systemMessage,
        ...args[0]
      };

      if (toolAction.api.streaming) {
        let streamContent = '';
        await apiHandler.executeApiAction(
          currentTool,
          actionType,
          params,
          loading.updateProgress,
          (chunk) => {
            streamContent += chunk;
            setMessages([
              ...newMessages.slice(0, -1),
              { role: 'assistant', content: streamContent } as Message
            ]);
          }
        );
      } else {
        const result = await apiHandler.executeApiAction(
          currentTool,
          actionType,
          params,
          loading.updateProgress
        );

        setMessages([
          ...newMessages.slice(0, -1),
          { role: 'assistant', content: result } as Message
        ]);
      }
    } catch (error) {
      console.error(toolAction.errorMessages?.apiError || 'Erreur lors de l\'action:', error);
    } finally {
      setIsGenerating(false);
      loading.stopLoading();
    }
  };

  const selectConfigs = useMemo(() => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool?.configFields) return {};

    return tool.configFields.reduce((configs, field) => {
      if (field.type === 'select') {
        configs[field.name] = {
          value: toolConfig[field.name] || field.defaultValue || '',
          options: field.name === 'model' ? availableModels : field.options || [],
          isLoading: field.loading && loading.isLoading,
          onChange: field.name === 'model' ? loadSelectedModel : 
            (value: string) => updateToolConfig({ [field.name]: value })
        };
      }
      return configs;
    }, {} as Record<string, any>);
  }, [currentTool, toolConfig, availableModels, loading.isLoading]);

  const value = {
    currentTool,
    setCurrentTool,
    toolConfig,
    updateToolConfig,
    handleToolAction,
    isToolMenuOpen,
    setIsToolMenuOpen,
    isGenerating,
    input,
    setInput,
    availableModels,
    selectConfigs,
    isModelLoading: loading.isLoading && loading.type === 'model',
    modelLoadingProgress: loading.progress || 0,
    modelLoadingStatus: loading.status || '',
    loadSelectedModel,
    isModelLoaded,
    loading,
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
}; 