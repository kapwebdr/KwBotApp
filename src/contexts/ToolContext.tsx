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
  selectConfigs: Record<string, any>;
  loading: ReturnType<typeof useLoading>;
}

export const ToolContext = createContext<ToolContextType | null>(null);

interface ToolState {
  config: ToolConfig;
  availableOptions?: string[];
}

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTool, setCurrentTool] = useState<ToolType>('llm');
  const [toolConfig, setToolConfig] = useState<ToolConfig>({});
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [toolStates, setToolStates] = useState<Record<ToolType, ToolState>>({} as Record<ToolType, ToolState>);
  const loading = useLoading();
  const [availableOptions, setAvailableOptions] = useState<Record<string, string[]>>({});
  const { messages, setMessages } = useConversation();

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

  useEffect(() => {
    const initializeToolOptions = async () => {
        const tool = TOOLS.find(t => t.id === currentTool);
        if (!tool || !tool.configFields) return;
        const newOptions = { ...availableOptions }; 
        for (const field of tool.configFields) {
          if (field.initAction && !availableOptions[field.name]) {
            console.log(field.name);
            const action = field.initAction;
            try {
              const result = await apiHandler.executeApiAction(
                currentTool,
                action.type,
                {},
                loading.updateProgress
              );
              newOptions[field.name] = result || [];
            } catch (error) {
              console.error(`Erreur lors de l'initialisation des options pour ${field.name}:`, error);
            }
          }
        }
        setAvailableOptions(newOptions);
    };
    initializeToolOptions();
  }, [currentTool]);

  const handleToolAction = async (actionType: ActionType, ...args: any[]) => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool) return;

    const toolAction = tool.actions?.find(a => a.type === actionType);
    if (!toolAction) return;

    const missingFields = tool.configFields
    ?.filter(field => field.required && !toolConfig[field.name])
    .map(field => field.name);

    if (missingFields && missingFields.length > 0) {
      console.error(`Les champs requis suivants sont manquants : ${missingFields.join(', ')}`);
      return;
    }
    // Validation des prérequis
    if (toolAction.requiresInput && !input.trim()) {
      console.error(toolAction.errorMessages?.noInput);
      return;
    }

    try {
      setIsGenerating(true);
      loading.startLoading(toolAction.generating);
      
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
            loading.stopLoading();
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
          options: availableOptions[field.name] || field.options || [],
          isLoading: field.loading && loading.isLoading,
          onChange: async (value: string) => {
            updateToolConfig({ [field.name]: value });
            if (field.onSelect) {
              const actionType = field.onSelect.action;
              const apiAction = tool.api ? tool.api[actionType] : {};
              const paramName = field.onSelect.paramName;
              const params = { [paramName]: value };
              const loadingTxt = apiAction.loadingTxt || '...';
              loading.startLoading(loadingTxt, 0);
  
              try {
                const success = await apiHandler.executeApiAction(
                  currentTool,
                  actionType,
                  params,
                  loading.updateProgress
                );
  
                if (success) {
                  updateToolConfig({ [field.name]: value });
                  loading.stopLoading();
                }
              } catch (error) {
                console.error(`Erreur lors de l'action ${actionType}:`, error);
  
                updateToolConfig({ [field.name]: undefined });
                setToolStates(prev => ({
                  ...prev,
                  [currentTool]: {
                    ...prev[currentTool],
                  },
                }));
              }
            }
          }
        };
      }
      return configs;
    }, {} as Record<string, any>);
  }, [currentTool, toolConfig,availableOptions, loading.isLoading]);

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
    selectConfigs,
    loading,
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
}; 