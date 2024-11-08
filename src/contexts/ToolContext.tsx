import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ToolType, ToolConfig, TOOLS, ToolContextType, ToolState } from '../types/tools';
import { ActionType } from '../types/api';
import { useConversation } from './ConversationContext';
import { apiHandler } from '../services/apiHandler';
import { useLoading } from '../hooks/useLoading';

export const ToolContext = createContext<ToolContextType | null>(null);

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [currentTool, setCurrentTool] = useState<ToolType>('llm');
  const [toolStates, setToolStates] = useState<Record<ToolType, ToolState>>({} as Record<ToolType, ToolState>);

  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const loading = useLoading();
  const [availableOptions, setAvailableOptions] = useState<Record<string, string[]>>({});
  const { messages, setMessages, setMessageSave, setCurrentToolId, setCurrentConversationId } = useConversation();

  // Mettre à jour le currentTool dans ConversationContext quand il change
  useEffect(() => {
    if (setCurrentToolId) {
      setCurrentToolId(currentTool);
    }
  }, [currentTool, setCurrentToolId]);

  const initialToolConfig = useMemo(() => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool?.configFields) {return {};}

    const newConfig =  tool.configFields.reduce((config, field) => {
      config[field.name] = field.defaultValue || '';
      return config;
    }, {} as ToolConfig);
    // setToolConfig(newConfig);
    setToolStates(prev => ({
      ...prev,
      [currentTool]: {
        ...prev[currentTool],
        config: newConfig
      },
    }));

  }, [currentTool]);

  const updateToolConfig = (config: Partial<ToolConfig>) => {
    const newConfig = { ...toolStates[currentTool]?.config, ...config };
    setToolStates(prev => ({
      ...prev,
      [currentTool]: {
        ...prev[currentTool],
        config: newConfig,
      },
    }));
  };

  useEffect(() => {
    const initializeToolOptions = async () => {
        const tool = TOOLS.find(t => t.id === currentTool);
        if (!tool || !tool.configFields) {return;}
        const newOptions = { ...availableOptions };
        for (const field of tool.configFields) {
          if (field.initAction && !availableOptions[field.name]) {
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

  const setInput = (input: string) => {
    setToolStates(prev => ({
      ...prev,
      [currentTool]: {
        ...prev[currentTool],
        input,
      },
    }));
  };
  const addPendingFile = (file: { name: string; file: File }) => {
    setToolStates(prev => ({
      ...prev,
      [currentTool]: {
        ...prev[currentTool],
        pendingFiles: [...(prev[currentTool]?.pendingFiles || []), file],
      },
    }));
  };

  const clearPendingFiles = () => {
    console.log('clearPendingFiles');
    setToolStates(prev => ({
      ...prev,
      [currentTool]: {
        ...prev[currentTool],
        pendingFiles: [],
      },
    }));
  };
  const handleToolAction = async (actionType: ActionType, ...args: any[]) => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool) {return;}

    const toolAction = tool.actions?.find(a => a.type === actionType);
    if (!toolAction) {return;}

    const missingFields = tool.configFields
    ?.filter(field => field.required && !toolStates[currentTool]?.config[field.name])
    .map(field => field.name);

    if (missingFields && missingFields.length > 0) {
      // Mettre à jour l'état des erreurs
      setToolStates(prev => ({
        ...prev,
        [currentTool]: {
          ...prev[currentTool],
          errors: missingFields.reduce((acc, fieldName) => ({
            ...acc,
            [fieldName]: 'Ce champ est requis',
          }), {}),
        },
      }));
      return;
    }
    // Validation des prérequis
    const input = toolStates[currentTool]?.input || '';
    if (toolAction.requiresInput && !input.trim()) {
      console.error(toolAction.errorMessages?.noInput);
      return;
    }

    try {
      setIsGenerating(true);
      loading.startLoading(toolAction.generatingTxt, toolAction.generatingProgress);

      const userContent = tool.userBubbleContent ?
        await tool.userBubbleContent(toolStates[currentTool]) :
        toolStates[currentTool]?.input;

      // Créer le message utilisateur
      const userMessage = { role: 'human', content: userContent };

      // Mettre à jour l'affichage avec le message utilisateur
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      console.log(toolAction.isMedia?.request);
      // Sauvegarder le message utilisateur
      const newConversationId = await setMessageSave(userMessage, toolStates[currentTool]?.config,undefined,toolAction.isMedia?.request);
      setCurrentConversationId(newConversationId);

      setInput('');
      setToolStates(prev => ({
        ...prev,
        [currentTool]: {
          ...prev[currentTool],
          errors: {},
        },
      }));
      const params = {
        ...toolStates[currentTool]?.config,
        input: toolStates[currentTool]?.input,
        conversationId: newConversationId,
        ...args[0],
      };
      if (toolAction.api.streaming) {
        let streamContent = '';
        await apiHandler.executeApiAction(
          currentTool,
          actionType,
          params,
          loading.updateProgress,
          (chunk) => {
            if (chunk !== null) {
              streamContent += chunk;
              setMessages([
                ...newMessages,
                { 
                  role: 'assistant', 
                  content: streamContent,
                  isMedia: toolAction.isMedia?.response
                }
              ]);
            }
          },
          async (response,params) => {
            setCurrentConversationId(params['conversationId']); // Ajouter cette ligne
            if (response !== null) {
              loading.stopLoading();
              const assistantMessage = { role: 'assistant', content: response };
              setMessages([...newMessages, assistantMessage]);
              await setMessageSave(assistantMessage, toolStates[currentTool]?.config,params['conversationId'],toolAction.isMedia?.response);
            }
          }
        );
      } else {
        const result = await apiHandler.executeApiAction(
          currentTool,
          actionType,
          params,
          loading.updateProgress
        );
        
        const assistantMessage = { 
          role: 'assistant', 
          content: result,
          isMedia: toolAction.isMedia?.response 
        };

        setMessages([...newMessages, assistantMessage]);
        console.log(newConversationId);
        setMessageSave(
          assistantMessage, 
          toolStates[currentTool]?.config,
          newConversationId,
          toolAction.isMedia?.response
        );
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
          value: toolStates[currentTool]?.config[field.name] || field.defaultValue || '',
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
  }, [currentTool, toolStates,availableOptions, loading.isLoading]); 

  const [toolHeight, setToolHeight] = useState(0);

  const executeToolAction = async (actionType: ActionType, params: any = {}) => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool) return;

    const toolAction = tool.actions?.find(a => a.type === actionType);
    if (!toolAction) return;

    // Validation des champs requis
    const missingFields = tool.configFields
      ?.filter(field => field.required && !toolStates[currentTool]?.config[field.name])
      .map(field => field.name);

    if (missingFields && missingFields.length > 0) {
      // Mettre à jour l'état des erreurs
      setToolStates(prev => ({
        ...prev,
        [currentTool]: {
          ...prev[currentTool],
          errors: missingFields.reduce((acc, fieldName) => ({
            ...acc,
            [fieldName]: 'Ce champ est requis'
          }), {})
        }
      }));
      return;
    }

    try {
      setIsGenerating(true);
      if (toolAction.generatingTxt) {
        loading.startLoading(toolAction.generatingTxt, toolAction.generatingProgress);
      }

      const actionParams = {
        ...toolStates[currentTool]?.config,
        ...params
      };
      setToolStates(prev => ({
        ...prev,
        [currentTool]: {
          ...prev[currentTool],
          errors: {}
        },
      }));
      if (toolAction.api.streaming) {
        let streamContent = '';
        const result = await apiHandler.executeApiAction(
          currentTool,
          actionType,
          actionParams,
          loading.updateProgress,
          (chunk) => {
            if (chunk !== null) {
              streamContent += chunk;
            }
          }
        );
        return result || streamContent;
      } else {
        return await apiHandler.executeApiAction(
          currentTool,
          actionType,
          actionParams,
          loading.updateProgress
        );
      }
    } catch (error) {
      console.error(toolAction.errorMessages?.apiError || 'Erreur lors de l\'action:', error);
      throw error;
    } finally {
      setIsGenerating(false);
      loading.stopLoading();
    }
  };

  const value = {
    currentTool,
    setCurrentTool,
    toolStates,
    updateToolConfig,
    handleToolAction,
    isToolMenuOpen,
    setIsToolMenuOpen,
    isGenerating,
    setInput,
    selectConfigs,
    loading,
    addPendingFile,
    clearPendingFiles,
    toolHeight,
    setToolHeight,
    executeToolAction,
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
};
