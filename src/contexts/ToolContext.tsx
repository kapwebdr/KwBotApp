import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ToolType, ToolConfig, Message, ToolConfigField, ToolAction } from '../types';
import { TOOLS } from '../types';
import { 
  streamChatCompletion, 
  stopGeneration, 
  getAvailableModels,
  generateImage,
  analyzeImage,
  extractTextFromImage,
  refineImage,
  translateText,
  getImageModels,
  loadModel
} from '../services/api';
import { useConversation } from './ConversationContext';
import { toolConfigsStorage } from '../services/storage';
import { ApiHandler } from '../services/apiHandler';

interface ToolContextType {
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  toolConfig: ToolConfig;
  updateToolConfig: (config: Partial<ToolConfig>) => void;
  handleToolAction: (action: string, ...args: any[]) => Promise<void>;
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
}

export const ToolContext = createContext<ToolContextType | null>(null);

interface ImageModel {
  id: string;
  name: string;
  type: string;
}

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
  const [isWaitingFirstResponse, setIsWaitingFirstResponse] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [imageModels, setImageModels] = useState<ImageModel[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [modelLoadingStatus, setModelLoadingStatus] = useState('');
  const [toolStates, setToolStates] = useState<Record<ToolType, ToolState>>({} as Record<ToolType, ToolState>);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const { messages, setMessages, systemMessage } = useConversation();

  // Initialisation des états des outils et chargement des modèles
  useEffect(() => {
    const initializeTools = async () => {
      try {
        const models = await getAvailableModels();
        const imgModels = await getImageModels();
        setAvailableModels(models);
        setImageModels(imgModels);

        const states: Partial<Record<ToolType, ToolState>> = {};
        for (const tool of TOOLS) {
          const savedConfig = await toolConfigsStorage.load();
          const toolConfig = savedConfig?.[tool.id];
          states[tool.id] = {
            config: {
              ...tool.defaultConfig,
              ...toolConfig
            },
            isModelLoaded: false
          };
        }
        setToolStates(states as Record<ToolType, ToolState>);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des outils:', error);
      }
    };

    initializeTools();
  }, []);

  // Mise à jour de la configuration actuelle lors du changement d'outil
  useEffect(() => {
    const toolState = toolStates[currentTool];
    if (toolState) {
      setToolConfig(toolState.config);
      setIsModelLoaded(toolState.isModelLoaded);
    }
  }, [currentTool, toolStates]);

  // Sauvegarde automatique des configurations
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

    toolConfigsStorage.update(prevConfigs => ({
      ...prevConfigs,
      [currentTool]: newConfig
    }));
  };

  const updateToolState = (toolId: ToolType, updates: Partial<ToolState>) => {
    setToolStates(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        ...updates
      }
    }));
  };

  const loadSelectedModel = async (modelName: string) => {
    if (!modelName) return;

    const currentState = toolStates[currentTool];
    if (currentState?.loadedModel === modelName && currentState.isModelLoaded) {
      return;
    }

    setIsModelLoading(true);
    setModelLoadingProgress(0);
    setModelLoadingStatus('Chargement du modèle...');

    try {
      const success = await loadModel(
        modelName,
        (progress) => {
          setModelLoadingProgress(progress);
        },
        (status) => {
          setModelLoadingStatus(status);
          if (status === 'loaded') {
            setToolStates(prev => ({
              ...prev,
              [currentTool]: {
                ...prev[currentTool],
                loadedModel: modelName,
                isModelLoaded: true
              }
            }));
            setIsModelLoaded(true);
          }
        }
      );

      if (success) {
        updateToolConfig({ model: modelName });
      } else {
        setModelLoadingStatus('Échec du chargement du modèle');
        updateToolConfig({ model: undefined });
        setIsModelLoaded(false);
        setToolStates(prev => ({
          ...prev,
          [currentTool]: {
            ...prev[currentTool],
            loadedModel: undefined,
            isModelLoaded: false
          }
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error);
      setModelLoadingStatus('Erreur lors du chargement du modèle');
      updateToolConfig({ model: undefined });
      setIsModelLoaded(false);
    } finally {
      setIsModelLoading(false);
    }
  };

  // Charger automatiquement le modèle quand il est sélectionné
  useEffect(() => {
    const selectedModel = toolConfig.model;
    if (selectedModel && !isModelLoading) {
      loadSelectedModel(selectedModel);
    }
  }, [toolConfig.model]);

  const handleError = (error: Error, errorMessage?: string) => {
    console.error(errorMessage || error.message, error);
  };

  const api = new ApiHandler(process.env.BASE_API_URL || '');

  const validateToolAction = (toolAction: ToolAction): boolean => {
    if (toolAction.requiresInput && !input.trim()) {
      handleError(new Error(toolAction.errorMessages?.noInput));
      return false;
    }

    if (toolAction.requiresModel && !toolConfig.model) {
      handleError(new Error(toolAction.errorMessages?.noModel));
      return false;
    }

    if (toolAction.requiresModelLoaded && !isModelLoaded) {
      handleError(new Error(toolAction.errorMessages?.modelNotLoaded));
      return false;
    }

    if (isGenerating) {
      handleError(new Error(toolAction.errorMessages?.generating));
      return false;
    }

    return true;
  };

  const formatResponse = (action: ToolAction, result: any): string => {
    switch (action.type) {
      case 'send':
        return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      case 'upload':
        if (result.base64) {
          return `![Image](data:image/png;base64,${result.base64})`;
        }
        return JSON.stringify(result, null, 2);
      default:
        return JSON.stringify(result, null, 2);
    }
  };

  const handleToolAction = async (actionType: string, ...args: any[]) => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool) return;

    const toolAction = tool.actions?.find(a => a.type === actionType);
    if (!toolAction) return;

    if (!validateToolAction(toolAction)) return;

    try {
      setIsGenerating(true);
      
      const params = {
        ...toolConfig,
        input,
        messages,
        systemMessage,
        ...args[0]
      };

      // Gestion spéciale pour le chat qui nécessite un streaming
      if (currentTool === 'chat') {
        const newMessages = [
          ...messages,
          { role: 'human', content: input } as Message,
        ];
        setMessages(newMessages);
        setInput('');

        const aiMessage: Message = {
          role: 'assistant',
          content: '...',
        };
        setMessages([...newMessages, aiMessage]);
        setIsWaitingFirstResponse(true);

        await api.executeToolAction(
          currentTool,
          actionType,
          params,
          (progress) => setModelLoadingProgress(progress),
          (chunk) => {
            if (isWaitingFirstResponse) {
              setIsWaitingFirstResponse(false);
            }
            aiMessage.content = isWaitingFirstResponse ? chunk : aiMessage.content + chunk;
            setMessages([...newMessages, { ...aiMessage }]);
          }
        );
      } else {
        // Gestion standard pour les autres outils
        const result = await api.executeToolAction(
          currentTool,
          actionType,
          params,
          (progress) => setModelLoadingProgress(progress),
          (result) => {
            handleActionResult(toolAction, result);
          }
        );

        if (!toolAction.api?.streaming) {
          handleActionResult(toolAction, result);
        }
        setInput('');
      }
    } catch (error) {
      handleError(error as Error, toolAction.errorMessages?.apiError);
    } finally {
      setIsGenerating(false);
      setIsWaitingFirstResponse(false);
    }
  };

  const handleActionResult = (action: ToolAction, result: any) => {
    const newMessages = [
      ...messages,
      { role: 'human', content: input },
      { role: 'assistant', content: formatResponse(action, result) }
    ];
    setMessages(newMessages);
  };

  const getSelectConfigForField = (field: ToolConfigField) => {
    const currentValue = toolConfig[field.name];
    
    switch (field.name) {
      case 'model':
        return {
          value: currentValue || field.defaultValue || '',
          options: availableModels,
          isLoading: field.loading && isModelLoading,
          onChange: loadSelectedModel
        };
      case 'modelType':
        return {
          value: currentValue || field.defaultValue || '',
          options: imageModels
            .filter(model => model.type === 'text2image')
            .map(model => ({
              value: model.id,
              label: model.name
            })),
          onChange: (value: string) => updateToolConfig({ [field.name]: value })
        };
      default:
        return {
          value: currentValue || field.defaultValue || '',
          options: field.options || [],
          onChange: (value: string) => updateToolConfig({ [field.name]: value })
        };
    }
  };

  const selectConfigs = useMemo(() => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool?.configFields) return {};

    return tool.configFields.reduce((configs, field) => {
      if (field.type === 'select') {
        configs[field.name] = getSelectConfigForField(field);
      }
      return configs;
    }, {} as Record<string, any>);
  }, [currentTool, toolConfig, availableModels, imageModels, isModelLoading]);

  const value: ToolContextType = {
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
    isModelLoading,
    modelLoadingProgress,
    modelLoadingStatus,
    loadSelectedModel,
    isModelLoaded,
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
}; 