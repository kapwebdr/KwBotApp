export type ToolType = 'chat' | 'image-generation' | 'image-analysis' | 'ocr' | 'image-refine' | 'translation';

export interface ToolConfig {
  modelType?: string;
  width?: number;
  height?: number;
  steps?: number;
  strength?: number;
  labels?: string[];
  systemMessage?: string;
  model?: string;
}

export interface ToolFeatures {
  fileUpload?: {
    accept: string[];
    multiple?: boolean;
  };
  urlInput?: {
    allowedProtocols?: string[];
    allowedExtensions?: string[];
  };
  promptInput?: {
    placeholder?: string;
    maxLength?: number;
    multiline?: boolean;
    required?: boolean;
  };
}

export interface Tool {
  id: ToolType;
  label: string;
  icon: string;
  features?: ToolFeatures;
  defaultConfig?: ToolConfig;
  configFields?: {
    name: string;
    type: 'text' | 'number' | 'select' | 'multiselect';
    label: string;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
  }[];
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
        required: true
      }
    },
    configFields: [
      {
        name: 'systemMessage',
        type: 'text',
        label: 'Message système'
      },
      {
        name: 'model',
        type: 'select',
        label: 'Modèle',
        options: []
      }
    ]
  },
  { 
    id: 'image-generation', 
    label: 'Génération d\'image', 
    icon: 'image',
    needsInput: true,
    features: {
      promptInput: {
        placeholder: 'Décrivez l\'image à générer...',
        multiline: true,
        required: true
      }
    },
    defaultConfig: {
      modelType: 'sdxl-turbo',
      width: 1024,
      height: 1024,
      steps: 20
    },
    configFields: [
      {
        name: 'modelType',
        type: 'select',
        label: 'Modèle',
        options: ['sdxl-turbo', 'sdxl-base']
      },
      {
        name: 'width',
        type: 'number',
        label: 'Largeur',
        min: 512,
        max: 2048,
        step: 64
      },
      {
        name: 'height',
        type: 'number',
        label: 'Hauteur',
        min: 512,
        max: 2048,
        step: 64
      },
      {
        name: 'steps',
        type: 'number',
        label: 'Étapes',
        min: 1,
        max: 50,
        step: 1
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
        multiple: false
      }
    },
    defaultConfig: {
      labels: ['chat', 'chien', 'oiseau', 'personne', 'voiture']
    },
    configFields: [
      {
        name: 'labels',
        type: 'multiselect',
        label: 'Labels à détecter',
        options: ['chat', 'chien', 'oiseau', 'personne', 'voiture', 'vélo', 'arbre', 'maison']
      }
    ]
  },
  { 
    id: 'ocr', 
    label: 'OCR', 
    icon: 'text',
    features: {
      fileUpload: {
        accept: ['image/*'],
        multiple: false
      }
    }
  },
  { 
    id: 'image-refine', 
    label: 'Raffinement d\'image', 
    icon: 'brush',
    features: {
      fileUpload: {
        accept: ['image/*'],
        multiple: false
      },
      promptInput: {
        placeholder: 'Décrivez les modifications souhaitées...',
        multiline: true
      }
    },
    defaultConfig: {
      strength: 0.3,
      steps: 20
    },
    configFields: [
      {
        name: 'strength',
        type: 'number',
        label: 'Force du raffinement',
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        name: 'steps',
        type: 'number',
        label: 'Étapes',
        min: 1,
        max: 50,
        step: 1
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
        multiline: true,
        required: true
      }
    },
    defaultConfig: {
      fromLang: 'fr',
      toLang: 'en'
    },
    configFields: [
      {
        name: 'fromLang',
        type: 'select',
        label: 'Langue source',
        options: ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko']
      },
      {
        name: 'toLang',
        type: 'select',
        label: 'Langue cible',
        options: ['en', 'fr', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'zh', 'ja', 'ko']
      }
    ]
  },
]; 

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
  role: 'human' | 'ai' | 'assistant' | 'system' | 'user';
  content: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  timestamp: number;
  systemMessage: string;
} 