export type ToolType = 'llm' | 'image_generation' | 'image_analysis' | 'ocr' | 'image_refine' | 'translation';

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
              model_type: params.model,
              prompt: params.input,
              negative_prompt: params.negative_prompt,
              width: params.width,
              height: params.height,
              steps: params.steps,
              strength: params.strength
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
          tool: 'list_image_models',
          config: {}
        }),
        responseTransform: (response) => {
          return Object.keys(response.models);
        }
      }
    }
  },
  // {
  //   id: 'image_analysis',
  //   label: 'Analyse d\'image',
  //   icon: 'scan',
  //   features: {
  //     fileUpload: {
  //       accept: ['image/*'],
  //       multiple: false,
  //       base64Input: true
  //     }
  //   },
  //   configFields: [
  //     {
  //       name: 'labels',
  //       type: 'select',
  //       label: 'Labels à détecter',
  //       defaultValue: ['chat', 'chien', 'oiseau', 'personne', 'voiture'],
  //       options: ['chat', 'chien', 'oiseau', 'personne', 'voiture', 'vélo', 'arbre', 'maison']
  //     }
  //   ],
  //   actions: [
  //     {
  //       type: 'upload',
  //       handler: 'handleImageAnalysis',
  //       errorMessages: {
  //         noFile: 'Veuillez sélectionner une image',
  //         apiError: 'Erreur lors de l\'analyse de l\'image'
  //       },
  //       api: {
  //         path: '/images/analyze',
  //         method: 'POST',
  //         responseType: 'json',
  //         requestTransform: (params) => ({
  //           image: params.base64,
  //           labels: params.labels
  //         })
  //       }
  //     }
  //   ]
  // },
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
  // {
  //   id: 'image_refine',
  //   label: 'Amélioration d\'image',
  //   icon: 'brush',
  //   features: {
  //     promptInput: {
  //       placeholder: 'Instructions de modification...',
  //       multiline: true
  //     },
  //     fileUpload: {
  //       accept: ['image/*'],
  //       multiple: false,
  //       base64Input: true,
  //       base64Output: true
  //     }
  //   },
  //   configFields: [
  //     {
  //       name: 'modelType',
  //       type: 'select',
  //       label: 'Modèle',
  //       defaultValue: 'sdxl/refiner',
  //       options: [
  //         { value: 'sdxl/refiner', label: 'SDXL Refiner' }
  //       ]
  //     },
  //     {
  //       name: 'strength',
  //       type: 'number',
  //       label: 'Force',
  //       defaultValue: 0.3,
  //       min: 0,
  //       max: 1,
  //       step: 0.1
  //     },
  //     {
  //       name: 'steps',
  //       type: 'number',
  //       label: 'Étapes',
  //       defaultValue: 20,
  //       min: 1,
  //       max: 100,
  //       step: 1
  //     }
  //   ],
  //   actions: [
  //     {
  //       type: 'upload',
  //       handler: 'handleImageRefinement',
  //       requiresInput: true,
  //       errorMessages: {
  //         noFile: 'Veuillez sélectionner une image',
  //         noInput: 'Veuillez décrire les modifications souhaitées',
  //         apiError: 'Erreur lors de l\'amélioration de l\'image'
  //       },
  //       api: {
  //         path: '/images/refine',
  //         method: 'POST',
  //         streaming: true,
  //         responseType: 'base64',
  //         requestTransform: (params) => ({
  //           image: params.base64,
  //           prompt: params.input,
  //           strength: params.strength || 0.3,
  //           steps: params.steps || 20
  //         })
  //       }
  //     }
  //   ]
  // },
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
