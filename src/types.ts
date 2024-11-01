import { ReactNode } from 'react';

export type ToolType = 'chat' | 'image-generation' | 'image-analysis' | 'ocr' | 'image-refine' | 'translation';

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
  type: 'text' | 'select' | 'number';
  placeholder?: string;
  loading?: boolean;
  defaultValue?: string | number;
  options?: string[] | { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  onSelect?: {
    action: ActionType;
    paramName: string;
    replaceInPath?: string;
  };
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
}

export interface ToolAction {
  type: ActionType;
  handler: string;
  requiresInput?: boolean;
  requiresModel?: boolean;
  requiresModelLoaded?: boolean;
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
  api?: {
    init?: ApiEndpoint;
    load?: ApiEndpoint;
  };
  config?: {
    requiresModel?: boolean;
    modelLoadingRequired?: boolean;
    availableModels?: Record<string, { name: string; type: string }>;
    languages?: Record<string, { label: string; code: string }>;
  };
}

export const TOOLS: Tool[] = [
  {
    id: 'chat',
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
        onSelect: {
          action: 'load',
          paramName: 'modelId',
          replaceInPath: '{modelId}'
        }
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
          path: '/chat/completions',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => ({
            model: params.model,
            messages: params.messages,
            stream: true,
            system: params.systemMessage,
          })
        }
      }
    ],
    api: {
      init: {
        path: '/models',
        method: 'GET',
        responseType: 'json',
        responseTransform: (response) => response.models
      },
      load: {
        path: '/models/{modelId}/load',
        method: 'POST',
        streaming: true,
        responseType: 'stream'
      }
    },
    config: {
      requiresModel: true,
      modelLoadingRequired: true
    }
  },

  {
    id: 'image-generation',
    label: 'Génération d\'image',
    icon: 'image',
    features: {
      promptInput: {
        placeholder: 'Entrez une description...',
        multiline: true
      },
      fileUpload: {
        accept: ['image/*'],
        multiple: false,
        base64Input: true
      }
    },
    configFields: [
      {
        name: 'model',
        type: 'select',
        label: 'Modèle',
        loading: true,
        defaultValue: ''
      },
      {
        name: 'modelType',
        type: 'select',
        label: 'Type de modèle',
        defaultValue: 'sdxl/base',
        options: [
          { value: 'sdxl/base', label: 'SDXL Base' },
          { value: 'sdxl/turbo', label: 'SDXL Turbo' },
          { value: 'sd/v1.5', label: 'Stable Diffusion 1.5' }
        ]
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
        type: 'upload',
        handler: 'handleImageGeneration',
        requiresInput: true,
        errorMessages: {
          noInput: 'Veuillez entrer une description',
          noModel: 'Veuillez sélectionner un modèle',
          modelNotLoaded: 'Le modèle est en cours de chargement',
          generating: 'Une génération est déjà en cours',
          apiError: 'Erreur lors de la génération de l\'image'
        },
        api: {
          path: '/images/generate',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => ({
            prompt: params.input,
            model: params.model,
            modelType: params.modelType,
            width: params.width,
            height: params.height,
            steps: params.steps,
            strength: params.strength
          })
        }
      }
    ]
  },

  {
    id: 'image-analysis',
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
    actions: [
      {
        type: 'upload',
        handler: 'handleOCR',
        errorMessages: {
          noFile: 'Veuillez sélectionner une image',
          apiError: 'Erreur lors de l\'extraction du texte'
        },
        api: {
          path: '/images/ocr',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
            image: params.base64
          }),
          responseTransform: (response) => response.text
        }
      }
    ],
    config: {
      requiresModel: false
    }
  },

  {
    id: 'image-refine',
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
          path: '/translation/translate',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
            text: params.input,
            from_lang: params.fromLang || 'fr',
            to_lang: params.toLang || 'en'
          }),
          responseTransform: (response) => response.translated_text
        }
      }
    ]
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
  systemMessage: string;
} 

export type ToolHandlers = {
  [key: string]: (...args: any[]) => Promise<void>;
}; 

export interface ModelConfig {
  endpoint: string;
  type: 'chat' | 'image' | 'translation';
  availableModels?: {
    [key: string]: {
      name: string;
      type: string;
    };
  };
  languages?: {
    [key: string]: {
      label: string;
      code: string;
    };
  };
}

