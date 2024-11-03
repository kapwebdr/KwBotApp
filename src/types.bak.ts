export type ToolType = 'llm' | 'image_generation' | 'image_analysis' | 'ocr' | 'image_refine' | 'translation' | 'text_to_speech' | 'speech_to_text';
export interface ToolConfig {
  model?: string;
  modelType?: string;
  width?: number;
  height?: number;
  steps?: number;
  strength?: number;
  labels?: string[];
  fromLang?: string;
  toLang?: string;
  [key: string]: any;
}

export interface ToolFeatures {
  promptInput?: {
    placeholder?: string;
    multiline?: boolean;
  };
  fileUpload?: {
    accept?: string[];
    multiple?: boolean;
    base64Input?: boolean;
    base64Output?: boolean;
  };
  urlInput?: boolean;
}

export interface ToolConfigField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'micro';
  placeholder?: string;
  loading?: boolean;
  defaultValue?: string | number;
  options?: string[] | { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  initAction?: {
    type: ActionType;
  };
  onSelect?: {
    action: ActionType;
    paramName: string;
    replaceInPath?: string;
  };
}

export interface ToolContextType {
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

export interface ToolState {
  config: ToolConfig;
  availableOptions?: string[];
  input?: string;
  pendingFiles?: Array<{ name: string; file: File }>;
}
export type ActionType = 'init' | 'load' | 'execute' | 'stop' | 'send' | 'upload' | 'url';

export interface ApiEndpoint {
  path: string;
  method?: 'GET' | 'POST';
  streaming?: boolean;
  responseType?: 'json' | 'stream' | 'base64';
  requestTransform?: (params: any) => any;
  responseTransform?: (response: any) => any;
  streamProcessor?: (chunk: string) => string;
  headers?: Record<string, string>;
  loadingTxt?: string;
}

export interface ToolAction {
  type: ActionType;
  handler: string;
  requiresInput?: boolean;
  requiresModel?: boolean;
  requiresModelLoaded?: boolean;
  generatingTxt?: string;
  generatingProgress?: number;
  errorMessages?: {
    noInput?: string;
    noModel?: string;
    modelNotLoaded?: string;
    generating?: string;
    apiError?: string;
  };
  api: ApiEndpoint;
}

export interface Tool {
  id: ToolType;
  label: string;
  icon: string;
  features?: ToolFeatures;
  configFields?: ToolConfigField[];
  defaultConfig?: ToolConfig;
  actions: ToolAction[];
  userBubbleContent?:(response: any) => any;
  api?: {
    init?: ApiEndpoint;
    load?: ApiEndpoint;
  };
}

export const TOOLS: Tool[] = [
  {
    id: 'llm',
    label: 'Chat',
    icon: 'chatbubbles',
    features: {
      promptInput: {
        placeholder: 'Tapez votre message...',
        multiline: true,
      }
    },
    configFields: [
      {
        name: 'model',
        type: 'select',
        label: 'Modèle',
        loading: true,
        defaultValue: '',
        required: true,
        initAction: {
          type: 'init',
        },
        onSelect: {
          action: 'load',
          paramName: 'modelId',
          replaceInPath: '{modelId}'
        }
      },
      {
        name: 'system',
        type: 'text',
        label: 'Message système',
        defaultValue: 'Tu es un assistant utile et amical.',
        placeholder: 'Entrez le message système...'
      }
    ],
    actions: [
      {
        type: 'send',
        handler: 'handleChatAction',
        requiresInput: true,
        requiresModel: true,
        requiresModelLoaded: true,
        errorMessages: {
          noInput: 'Veuillez entrer un message',
          noModel: 'Veuillez sélectionner un modèle',
          modelNotLoaded: 'Le modèle est en cours de chargement',
          generating: 'Une génération est déjà en cours',
          apiError: 'Erreur lors de l\'appel à l\'API'
        },
        api: {
          path: '/ai/process',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => ({
            tool: 'llm',
            config: {
              model: params.model,
              system: params.system,
              prompt: params.input,
              stream: true,
              messages: params.messages
            },
          })
        }
      }
    ],
    api: {
      init: {
        path: '/ai/process',
        method: 'POST',
        responseType: 'json',
        requestTransform: () => ({
          tool: 'list_models',
          config: {}
        }),
        responseTransform: (response) => response.models
      },
      load: {
        path: '/ai/process',
        method: 'POST',
        streaming: true,
        responseType: 'stream',
        loadingTxt: 'Chargement du modèle en cours...',
        requestTransform: (params) => ({
          tool: 'load_model',
          config: {
            model_name: params.modelId
          }
        }),
      }
    }
  },
  {
    id: 'image_generation',
    label: 'Génération d\'image',
    icon: 'image',
    features: {
      promptInput: {
        placeholder: 'Entrez un prompt...',
        multiline: true
      }
    },
    configFields: [
      {
        name: 'image_model',
        type: 'select',
        label: 'Modèle',
        required: true,
        loading: true,
        defaultValue: '',
        initAction: {
          type: 'init',
        },
      },
      {
        name: 'width',
        type: 'number',
        label: 'Largeur',
        defaultValue: 512,
        min: 256,
        max: 1024,
        step: 64
      },
      {
        name: 'height',
        type: 'number',
        label: 'Hauteur',
        defaultValue: 512,
        min: 256,
        max: 1024,
        step: 64
      },
      {
        name: 'steps',
        type: 'number',
        label: 'Étapes',
        defaultValue: 50,
        min: 1,
        max: 100,
        step: 1
      },
      {
        name: 'strength',
        type: 'number',
        label: 'Force',
        defaultValue: 0.8,
        min: 0,
        max: 1,
        step: 0.1
      }
    ],
    actions: [
      {
        type: 'send',
        handler: 'handleImageGeneration',
        requiresInput: true,
        generatingTxt: 'Génération en cours...',
        generatingProgress: 0,
        errorMessages: {
          noInput: 'Veuillez entrer une description',
          noModel: 'Veuillez sélectionner un modèle',
          modelNotLoaded: 'Le modèle est en cours de chargement',
          generating: 'Une génération est déjà en cours',
          apiError: 'Erreur lors de la génération de l\'image'
        },
        
        api: {
          path: '/ai/process',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => ({
            tool: 'image_generation',
            config: {
              model_type: params.image_model,
              prompt: params.input,
              // negative_prompt: params.negative_prompt,
              width: params.width,
              height: params.height,
              steps: params.steps,
              strength: params.strength
            },
          }),
          responseTransform: (response) => {
            return `data:image/png;base64,${response.image}`;
          }
        }
      }
    ],
    api: {
      init: {
        path: '/ai/process',
        method: 'POST',
        responseType: 'json',
        requestTransform: () => ({
          tool: 'list_image_models',
          config: {}
        }),
        responseTransform: (response) => {
          return Object.keys(response.models);
        }
      }
    }
  },
  {
    id: 'image_analysis',
    label: 'Analyse d\'image',
    icon: 'scan',
    features: {
      fileUpload: {
        accept: ['image/*'],
        multiple: false,
        base64Input: true
      }
    },
    configFields: [
      {
        name: 'labels',
        type: 'select',
        label: 'Labels à détecter',
        defaultValue: ['chat', 'chien', 'oiseau', 'personne', 'voiture'],
        options: ['chat', 'chien', 'oiseau', 'personne', 'voiture', 'vélo', 'arbre', 'maison']
      }
    ],
    actions: [
      {
        type: 'upload',
        handler: 'handleImageAnalysis',
        errorMessages: {
          noFile: 'Veuillez sélectionner une image',
          apiError: 'Erreur lors de l\'analyse de l\'image'
        },
        api: {
          path: '/images/analyze',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
            image: params.base64,
            labels: params.labels
          })
        }
      }
    ]
  },
  {
    id: 'ocr',
    label: 'Extraction de texte',
    icon: 'text',
    features: {
      fileUpload: {
        accept: ['image/*'],
        multiple: false,
        base64Input: true
      }
    },
    userBubbleContent: async (toolState: ToolState) => {
      const pendingFiles = toolState.pendingFiles || [];
      if (pendingFiles.length > 0) {
          const file = pendingFiles[0].file;
          const base64Image = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(file);
          });
          
          return base64Image;
      } else {
          return 'Image';
      }
  },
    actions: [
      {
        type: 'upload',
        handler: 'handleOCR',
        errorMessages: {
          noFile: 'Veuillez sélectionner une image',
          apiError: 'Erreur lors de l\'extraction du texte'
        },
        api: {
          path: '/ai/process',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
            tool: 'ocr',
            config: {
              image: params.base64
            },
          }),
          responseTransform: (response) => response.text
        }
      }
    ]
  },
  {
    id: 'image_refine',
    label: 'Amélioration d\'image',
    icon: 'brush',
    features: {
      promptInput: {
        placeholder: 'Instructions de modification...',
        multiline: true
      },
      fileUpload: {
        accept: ['image/*'],
        multiple: false,
        base64Input: true,
        base64Output: true
      }
    },
    configFields: [
      {
        name: 'modelType',
        type: 'select',
        label: 'Modèle',
        defaultValue: 'sdxl/refiner',
        options: [
          { value: 'sdxl/refiner', label: 'SDXL Refiner' }
        ]
      },
      {
        name: 'strength',
        type: 'number',
        label: 'Force',
        defaultValue: 0.3,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        name: 'steps',
        type: 'number',
        label: 'Étapes',
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1
      }
    ],
    actions: [
      {
        type: 'upload',
        handler: 'handleImageRefinement',
        requiresInput: true,
        errorMessages: {
          noFile: 'Veuillez sélectionner une image',
          noInput: 'Veuillez décrire les modifications souhaitées',
          apiError: 'Erreur lors de l\'amélioration de l\'image'
        },
        api: {
          path: '/images/refine',
          method: 'POST',
          streaming: true,
          responseType: 'base64',
          requestTransform: (params) => ({
            image: params.base64,
            prompt: params.input,
            strength: params.strength || 0.3,
            steps: params.steps || 20
          })
        }
      }
    ]
  },
  {
    id: 'translation',
    label: 'Traduction',
    icon: 'language',
    features: {
      promptInput: {
        placeholder: 'Entrez le texte à traduire...',
        multiline: true
      }
    },
    configFields: [
      {
        name: 'fromLang',
        type: 'select',
        label: 'De',
        defaultValue: 'fr',
        options: [
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'Anglais' },
          { value: 'es', label: 'Espagnol' },
          { value: 'de', label: 'Allemand' }
        ]
      },
      {
        name: 'toLang',
        type: 'select',
        label: 'Vers',
        defaultValue: 'en',
        options: [
          { value: 'en', label: 'Anglais' },
          { value: 'fr', label: 'Français' },
          { value: 'es', label: 'Espagnol' },
          { value: 'de', label: 'Allemand' }
        ]
      }
    ],
    actions: [
      {
        type: 'send',
        handler: 'handleTranslation',
        requiresInput: true,
        errorMessages: {
          noInput: 'Veuillez entrer un texte à traduire',
          generating: 'Une traduction est déjà en cours',
          apiError: 'Erreur lors de la traduction'
        },
        api: {
          path: '/ai/process',
          method: 'POST',
          responseType: 'json',
          loadingTxt: 'Traduction en cours...',
          requestTransform: (params) => ({
            tool: 'translation',
            config: {
              text: params.input,
              from_lang: params.fromLang || 'fr',
              to_lang: params.toLang || 'en'
            },
          }),
          responseTransform: (response) => response.translated_text
        }
      }
    ]
  },
  {
    id: 'text_to_speech',
    label: 'Synthèse vocale',
    icon: 'volume-high',
    features: {
      promptInput: {
        placeholder: 'Entrez le texte à convertir en audio...',
        multiline: true
      }
    },
    configFields: [
      {
        name: 'language',
        type: 'select',
        label: 'Langue',
        defaultValue: 'fr',
        required: true,
        options: [
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'Anglais' },
          { value: 'es', label: 'Espagnol' },
          { value: 'de', label: 'Allemand' }
        ]
      },
      {
        name: 'voice_path',
        type: 'select',
        label: 'Voix',
        loading: true,
        defaultValue: '',
        required: true,
        initAction: {
          type: 'init'
        }
      }
    ],
    actions: [
      {
        type: 'send',
        handler: 'handleTextToSpeech',
        requiresInput: true,
        generatingTxt: 'Génération audio en cours...',
        generatingProgress: 0,
        errorMessages: {
          noInput: 'Veuillez entrer un texte à convertir',
          generating: 'Une génération est déjà en cours',
          apiError: 'Erreur lors de la génération audio'
        },
        api: {
          path: '/ai/process',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => ({
            tool: 'text_to_speech',
            config: {
              text: params.input,
              voice_path: params.voice_path,
              language: params.language || 'fr'
            }
          }),
          responseTransform: (response) => {
            if (response.status === 'completed') {
              return `data:audio/wav;base64,${response.audio}`;
            }
            return response;
          }
        }
      }
    ],
    api: {
      init: {
        path: '/ai/process',
        method: 'POST',
        responseType: 'json',
        requestTransform: () => ({
          tool: 'list_speech_models',
          config: {}
        }),
        responseTransform: (response) => {
          return response.models.tts.xtts_v2.voices.map((voice: any) => ({
            value: voice.path,
            label: voice.label
          }));
        }
      }
    },
  },
  {
    id: 'system_metrics',
    label: 'Métriques Système',
    icon: 'stats-chart',
    actions: [
      {
        type: 'execute',
        handler: 'handleSystemMetrics',
        api: {
          path: '/ai/process',
          method: 'POST',
          responseType: 'json',
          requestTransform: () => ({
            tool: 'system_metrics',
            config: {}
          }),
          responseTransform: (response) => response as SystemMetrics
        }
      }
    ]
  },
  {
    id: 'speech_to_text',
    label: 'Reconnaissance Vocale',
    icon: 'mic',
    features: {
      fileUpload: {
        accept: ['audio/*'],
        multiple: false,
        base64Input: true
      }
    },
    configFields: [
      {
        name: 'model_size',
        type: 'select',
        label: 'Modèle',
        loading: true,
        defaultValue: '',
        required: true,
        initAction: {
          type: 'init'
        }
      },
      {
        name: 'micro',
        type: 'micro',
        label: 'Micro',
        onSelect: {
          action: 'execute',
          // paramName: 'audio',
          
        }
      }
    ],
    actions: [
      {
        type: 'upload',
        handler: 'handleSpeechToText',
        errorMessages: {
          noFile: 'Veuillez sélectionner un fichier audio',
          apiError: 'Erreur lors de la transcription'
        },
        api: {
          path: '/ai/process',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          streamProcessor: (chunk: any) => {
            console.log(chunk);
            return chunk.segment.text;
          },
          requestTransform: (params) => ({
            tool: 'speech_to_text',
            config: {
              audio: params.base64,
              stream: true,
              model_size: params.model_size
            }
          })
        }
      },
      {
        type: 'execute',
        handler: 'handleSpeechToText',
        api: {
          path: '/ai/process',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (audioBlob: Blob) => {
            console.log('YO');
            return {
              tool: 'speech_to_text',
              config: {
                audio: audioBlob,
                stream: true,
                model_size: 'medium' // Utilise la valeur du select model_size
              }
            }
          },
          streamProcessor: (chunk: any) => {
            console.log(chunk);
            return chunk.segment.text;
          },
          requestTransform: (params) => ({
            tool: 'speech_to_text',
            config: {
              audio: params.audio,
              stream: true,
              model_size: params.model_size
            }
          })
        }
      }
    ],
    api: {
      init: {
        path: '/ai/process',
        method: 'POST',
        responseType: 'json',
        requestTransform: () => ({
          tool: 'list_speech_models',
          config: {}
        }),
        responseTransform: (response) => {
          return response.models.stt.whisper.sizes.map((size: string) => ({
            value: size,
            label: `Whisper ${size.charAt(0).toUpperCase() + size.slice(1)}`
          }));
        }
      }
    },
    userBubbleContent: async (toolState: ToolState) => {
      const pendingFiles = toolState.pendingFiles || [];
      if (pendingFiles.length > 0) {
        const file = pendingFiles[0].file;
        const base64Audio = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
        
        return base64Audio;
      } else {
        return 'Audio';
      }
    }
  }
];

export type ThemeType = 'light' | 'dark' | 'dim' | 'system' | 'ocean' | 'forest';

export const THEME_OPTIONS: Record<ThemeType, { label: string; icon: string }> = {
  light: { label: 'Clair', icon: 'sunny-outline' },
  dark: { label: 'Sombre', icon: 'moon-outline' },
  dim: { label: 'Tamisé', icon: 'contrast-outline' },
  system: { label: 'Système', icon: 'phone-portrait-outline' },
  ocean: { label: 'Océan', icon: 'water-outline' },
  forest: { label: 'Forêt', icon: 'leaf-outline' }
} as const;

export interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
    userBubble: string;
    aiBubble: string;
    userText: string;
    aiText: string;
    inputBackground: string;
    border: string;
    gray0: string;
    gray25: string;
    gray50: string;
    gray75: string;
    gray100: string;
    gray150: string;
    gray200: string;
    gray250: string;
    gray300: string;
    gray350: string;
    gray400: string;
    gray450: string;
    gray500: string;
    gray550: string;
    gray600: string;
    gray650: string;
    gray700: string;
    gray750: string;
    gray800: string;
    gray850: string;
    gray900: string;
    gray950: string;
    gray1000: string;
  };
  fontSizes: {
    small: number;
    medium: number;
    large: number;
  };
} 

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'human' | 'ai';
  content: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  timestamp: number;
} 

export interface ToolGroup {
  id: string;
  label: string;
  icon: string;
  tools: ToolType[];
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'chat',
    label: 'Chat',
    icon: 'chatbubbles',
    tools: ['llm']
  },
  {
    id: 'image',
    label: 'Images',
    icon: 'image',
    tools: ['image_generation', 'image_analysis', 'image_refine']
  },
  {
    id: 'text',
    label: 'Texte',
    icon: 'text',
    tools: ['ocr', 'translation']
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: 'volume-high',
    tools: ['text_to_speech','speech_to_text']
  }
];

// Helper pour obtenir le groupe d'un outil
export const getToolGroup = (toolId: ToolType): ToolGroup | undefined => {
  return TOOL_GROUPS.find(group => group.tools.includes(toolId));
};

// Helper pour obtenir tous les outils d'un groupe
export const getToolsInGroup = (groupId: string): Tool[] => {
  const group = TOOL_GROUPS.find(g => g.id === groupId);
  if (!group) return [];
  return TOOLS.filter(tool => group.tools.includes(tool.id));
};

export interface SystemMetrics {
  cpu: {
    percent: number;
    frequency_current: number;
    frequency_max: number;
    cores: number;
  };
  memory: {
    total: number;
    available: number;
    percent: number;
    used: number;
  };
  gpu: {
    id: number;
    name: string;
    load: number;
    memory_used: number;
    memory_total: number;
    temperature: number;
  }[];
}