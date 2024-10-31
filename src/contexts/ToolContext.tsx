import React, { createContext, useState, useEffect } from 'react';
import { ToolType, ToolConfig, Message } from '../types';
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

interface ToolContextType {
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  toolConfig: ToolConfig;
  updateToolConfig: (config: Partial<ToolConfig>) => void;
  handleToolAction: (action: string, ...args: any[]) => Promise<void>;
  isToolMenuOpen: boolean;
  setIsToolMenuOpen: (isOpen: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
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
  const [currentLoadedModel, setCurrentLoadedModel] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const { messages, setMessages, systemMessage } = useConversation();

  // Log des changements de tool
  useEffect(() => {
    const tool = TOOLS.find(t => t.id === currentTool);
    console.group('Tool Change Debug');
    console.log('Current Tool:', {
      id: tool?.id,
      label: tool?.label,
      features: tool?.features,
      configFields: tool?.configFields,
      defaultConfig: tool?.defaultConfig
    });
    console.log('Current Config:', toolConfig);
    console.groupEnd();
  }, [currentTool, toolConfig]);

  // Charger les configurations initiales du tool
  useEffect(() => {
    const loadToolConfigs = async () => {
      const models = await getAvailableModels();
      const imgModels = await getImageModels();
      setAvailableModels(models);
      setImageModels(imgModels);

      const tool = TOOLS.find(t => t.id === currentTool);
      if (tool) {
        console.group('Tool Config Initialization');
        console.log('Loading config for tool:', tool.id);
        console.log('Default config:', tool.defaultConfig);
        console.log('Available models:', models);
        console.log('Available image models:', imgModels);
        console.groupEnd();
        
        const defaultConfig = {
          ...tool.defaultConfig,
          modelType: tool.id === 'image-generation' ? (imgModels[0]?.id || 'sdxl/turbo') : undefined
        };
        
        setToolConfig(defaultConfig);
      }
    };

    loadToolConfigs();
  }, [currentTool]);

  // Gérer les configurations des selects pour chaque tool
  const selectConfigs = {
    model: {
      value: toolConfig.model || '',
      options: availableModels,
      isLoading: false,
      onChange: (value: string) => updateToolConfig({ model: value })
    },
    modelType: {
      value: toolConfig.modelType || 'sdxl/turbo',
      options: imageModels
        .filter(model => model.type === 'text2image')
        .map(model => ({
          value: model.id,
          label: model.name
        })),
      onChange: (value: string) => updateToolConfig({ modelType: value })
    },
    fromLang: {
      value: toolConfig.fromLang || 'fr',
      options: ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko'],
      onChange: (value: string) => updateToolConfig({ fromLang: value })
    },
    toLang: {
      value: toolConfig.toLang || 'en',
      options: ['en', 'fr', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko'],
      onChange: (value: string) => updateToolConfig({ toLang: value })
    }
  };

  const updateToolConfig = (config: Partial<ToolConfig>) => {
    console.group('Tool Config Update');
    console.log('Previous config:', toolConfig);
    console.log('New config update:', config);
    console.groupEnd();

    setToolConfig(prev => ({
      ...prev,
      ...config
    }));
  };

  // Réinitialiser isModelLoaded quand on change d'outil
  useEffect(() => {
    setIsModelLoaded(false);
    setCurrentLoadedModel(null);
  }, [currentTool]);

  const loadSelectedModel = async (modelName: string) => {
    if (currentLoadedModel === modelName) return;
    
    setIsModelLoaded(false);
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
            setIsModelLoaded(true);
          }
        }
      );

      if (success) {
        setCurrentLoadedModel(modelName);
        updateToolConfig({ model: modelName });
      } else {
        setModelLoadingStatus('Échec du chargement du modèle');
        updateToolConfig({ model: undefined });
        setIsModelLoaded(false);
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

  const handleChatAction = async () => {
    if (!input.trim() || isGenerating) return;
    if (!toolConfig.model) {
      console.error('Aucun modèle sélectionné');
      return;
    }
    if (isModelLoading) {
      console.error('Le modèle est en cours de chargement');
      return;
    }
    if (!isModelLoaded) {
      console.error('Le modèle n\'est pas encore chargé');
      return;
    }

    const newMessages = [
      ...messages,
      { role: 'human', content: input } as Message,
    ];
    setMessages(newMessages);
    setInput('');

    try {
      setIsGenerating(true);
      const aiMessage: Message = {
        role: 'assistant',
        content: '...',
      };
      setMessages([...newMessages, aiMessage]);
      setIsWaitingFirstResponse(true);

      await streamChatCompletion(
        toolConfig.model || availableModels[0],
        newMessages,
        systemMessage,
        (chunk) => {
          if (isWaitingFirstResponse) {
            setIsWaitingFirstResponse(false);
          }
          aiMessage.content = isWaitingFirstResponse ? chunk : aiMessage.content + chunk;
          setMessages([...newMessages, { ...aiMessage }]);
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API:', error);
    } finally {
      setIsWaitingFirstResponse(false);
      setIsGenerating(false);
    }
  };

  const handleImageGeneration = async () => {
    if (!input.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      const defaultImageModel = imageModels.find(m => m.type === 'text2image')?.id || 'sdxl/turbo';
      
      await generateImage(
        {
          model_type: toolConfig.modelType || defaultImageModel,
          prompt: input,
          width: toolConfig.width || 1024,
          height: toolConfig.height || 1024,
          steps: toolConfig.steps || 20,
        },
        (progress) => {
          setLoadingProgress(progress);
        },
        (imageBase64) => {
          setMessages([
            ...messages,
            { role: 'human', content: input },
            { role: 'assistant', content: `![Generated Image](data:image/png;base64,${imageBase64})` }
          ]);
        }
      );
      setInput('');
    } catch (error) {
      console.error('Erreur lors de la génération d\'image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageAnalysis = async (imageBase64: string) => {
    try {
      setIsGenerating(true);
      const result = await analyzeImage({
        image: imageBase64,
        labels: toolConfig.labels || ['chat', 'chien', 'oiseau', 'personne', 'voiture']
      });

      setMessages([
        ...messages,
        { 
          role: 'human', 
          content: `![Analyzed Image](data:image/png;base64,${imageBase64})`
        },
        {
          role: 'assistant',
          content: `Résultats de l'analyse:\n${JSON.stringify(result, null, 2)}`
        }
      ]);
    } catch (error) {
      console.error('Erreur lors de l\'analyse d\'image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOCR = async (imageBase64: string) => {
    try {
      setIsGenerating(true);
      const result = await extractTextFromImage({
        image: imageBase64
      });

      setMessages([
        ...messages,
        { 
          role: 'human', 
          content: `![OCR Image](data:image/png;base64,${imageBase64})`
        },
        {
          role: 'assistant',
          content: `Texte extrait:\n${result.text}`
        }
      ]);
    } catch (error) {
      console.error('Erreur lors de l\'extraction de texte:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageRefinement = async (imageBase64: string) => {
    if (!input.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      await refineImage(
        {
          image: imageBase64,
          prompt: input,
          strength: toolConfig.strength || 0.3,
          steps: toolConfig.steps || 20,
        },
        (progress) => {
          setLoadingProgress(progress);
        },
        (refinedImageBase64) => {
          setMessages([
            ...messages,
            { 
              role: 'human', 
              content: `![Original Image](data:image/png;base64,${imageBase64})\n\n${input}`
            },
            {
              role: 'assistant',
              content: `![Refined Image](data:image/png;base64,${refinedImageBase64})`
            }
          ]);
        }
      );
      setInput('');
    } catch (error) {
      console.error('Erreur lors du raffinement d\'image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslation = async () => {
    if (!input.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      const result = await translateText({
        text: input,
        from_lang: toolConfig.fromLang || 'fr',
        to_lang: toolConfig.toLang || 'en'
      });

      setMessages([
        ...messages,
        { role: 'human', content: input },
        { 
          role: 'assistant', 
          content: `Traduction (${result.from} → ${result.to}):\n\n${result.translated_text}`
        }
      ]);
      setInput('');
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToolAction = async (action: string, ...args: any[]) => {
    const tool = TOOLS.find(t => t.id === currentTool);
    console.group('Tool Action Debug');
    console.log('Action:', action);
    console.log('Tool:', tool?.id);
    console.log('Args:', args);
    console.groupEnd();

    if (!tool) return;

    switch (action) {
      case 'send':
        switch (currentTool) {
          case 'chat':
            await handleChatAction();
            break;
          case 'image-generation':
            await handleImageGeneration();
            break;
          case 'translation':
            await handleTranslation();
            break;
        }
        break;

      case 'upload':
        const [file] = args;
        const base64Content = file.base64.split(',')[1];
        
        switch (currentTool) {
          case 'image-analysis':
            await handleImageAnalysis(base64Content);
            break;
          case 'ocr':
            await handleOCR(base64Content);
            break;
          case 'image-refine':
            await handleImageRefinement(base64Content);
            break;
        }
        break;

      case 'stop':
        if (isGenerating) {
          const success = await stopGeneration();
          if (success) {
            setIsGenerating(false);
            setIsWaitingFirstResponse(false);
          }
        }
        break;
    }
  };

  const value = {
    currentTool,
    setCurrentTool,
    toolConfig,
    updateToolConfig,
    handleToolAction,
    isToolMenuOpen,
    setIsToolMenuOpen,
    isGenerating,
    setIsGenerating,
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