import { ActionType, ApiEndpoint } from './api';
import { useLoading } from '../hooks/useLoading';
interface TTSConfig {
  enabled: boolean;
  voice_path: string;
  language: string;
}
export type ToolType = 'llm' | 'image_generation' | 'image_analysis' | 'ocr' | 'image_refine' | 'translation' | 'text_to_speech' | 'speech_to_text' | 'files' | 'monitoring' | 'audio_chat';
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
  tts?: TTSConfig;
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
    dragDrop?: boolean;
  };
  urlInput?: boolean;
}

export interface ToolConfigField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'micro';
  placeholder?: string;
  loading?: boolean;
  defaultValue?: string | number | string[];
  options?: string[] | { value: string; label: string; }[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  initAction?: {
    type: ActionType;
  };
  onSelect?: {
    action: ActionType;
    paramName?: string;
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
  pendingFiles?: Array<{ name: string; file: File; }>;
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
    noFile?: string;
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
  customComponent?: string;
  useMessagesSystem?: boolean;
  userBubbleContent?: (response: any) => any;
  api?: {
    init?: ApiEndpoint;
    speech?: ApiEndpoint;
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
      },
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
          replaceInPath: '{modelId}',
        },
      },
      {
        name: 'system',
        type: 'text',
        label: 'Message système',
        defaultValue: 'Tu es un assistant utile et amical.',
        placeholder: 'Entrez le message système...',
      },
    ],
    actions: [
      {
        type: 'send',
        handler: 'handleChatAction',
        requiresInput: true,
        errorMessages: {
          noInput: 'Veuillez entrer un message',
          noModel: 'Veuillez sélectionner un modèle',
          modelNotLoaded: 'Le modèle est en cours de chargement',
          generating: 'Une génération est déjà en cours',
          apiError: 'Erreur lors de l\'appel à l\'API',
        },
        api: {
          path: '/ai/generate',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => ({
              model: params.model,
              system: params.system,
              prompt: params.input,
              stream: true,
              messages: params.messages,
              format_type: 'encoded',
          }),
          streamProcessor: (chunk: any) => {
            if (chunk.text) {
              return chunk.text;
            }
          },
          responseTransform: (response) => response.text,
        },
      },
    ],
    api: {
      init: {
        path: '/ai/models',
        method: 'POST',
        responseType: 'json',
        requestTransform: () => ({
        }),
        responseTransform: (response) => response.models,
      },
      load: {
        path: '/ai/load_model',
        method: 'POST',
        streaming: true,
        responseType: 'stream',
        loadingTxt: 'Chargement du modèle en cours...',
        requestTransform: (params) => ({
            model_name: params.modelId,
        }),
      },
    },
  },
  {
    id: 'image_generation',
    label: 'Génération d\'image',
    icon: 'image',
    features: {
      promptInput: {
        placeholder: 'Entrez un prompt...',
        multiline: true,
      },
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
        onSelect: {
          action: 'load',
          paramName: 'modelId',
          replaceInPath: '{modelId}',
        },
      },
      {
        name: 'width',
        type: 'number',
        label: 'Largeur',
        defaultValue: 256,
        min: 256,
        max: 1024,
        step: 64,
      },
      {
        name: 'height',
        type: 'number',
        label: 'Hauteur',
        defaultValue: 256,
        min: 256,
        max: 1024,
        step: 64,
      },
      {
        name: 'steps',
        type: 'number',
        label: 'Étapes',
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1,
      },
      {
        name: 'strength',
        type: 'number',
        label: 'Force',
        defaultValue: 0.8,
        min: 0,
        max: 1,
        step: 0.1,
      },
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
          apiError: 'Erreur lors de la génération de l\'image',
        },
        api: {
          path: '/ai/image/generate',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => ({
              model_type: params.image_model,
              prompt: params.input,
              // negative_prompt: params.negative_prompt,
              width: params.width,
              height: params.height,
              steps: params.steps,
              strength: params.strength,
          }),
          responseTransform: (response) => {
            return `data:image/png;base64,${response.image}`;
          },
        },
      },
    ],
    api: {
      init: {
        path: '/ai/image/models',
        method: 'POST',
        responseType: 'json',
        requestTransform: () => ({
        }),
        responseTransform: (response) => {
          return Object.keys(response.models);
        },
      },
      load: {
        path: '/ai/image/load_model',
        method: 'POST',
        streaming: true,
        responseType: 'stream',
        loadingTxt: 'Chargement du modèle en cours...',
        requestTransform: (params) => ({
          model_type: params.modelId,
        }),
      },
    },
  },
  {
    id: 'image_analysis',
    label: 'Analyse d\'image',
    icon: 'scan',
    features: {
      fileUpload: {
        accept: ['image/*'],
        multiple: false,
        base64Input: true,
      },
    },
    configFields: [
      {
        name: 'labels',
        type: 'select',
        label: 'Labels à détecter',
        defaultValue: ['chat', 'chien', 'oiseau', 'personne', 'voiture'],
        options: ['chat', 'chien', 'oiseau', 'personne', 'voiture', 'vélo', 'arbre', 'maison'],
      },
    ],
    actions: [
      {
        type: 'upload',
        handler: 'handleImageAnalysis',
        errorMessages: {
          noFile: 'Veuillez sélectionner une image',
          apiError: 'Erreur lors de l\'analyse de l\'image',
        },
        api: {
          path: '/ai/image/analyze',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
            image: params.base64,
            labels: params.labels,
          }),
        },
      },
    ],
  },
  {
    id: 'ocr',
    label: 'Extraction de texte',
    icon: 'text',
    features: {
      fileUpload: {
        accept: ['image/*'],
        multiple: false,
        base64Input: true,
      },
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
          apiError: 'Erreur lors de l\'extraction du texte',
        },
        api: {
          path: '/ai/image/ocr',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
              image: params.base64,
          }),
          responseTransform: (response) => response.text,
        },
      },
    ],
  },
  {
    id: 'image_refine',
    label: 'Amélioration d\'image',
    icon: 'brush',
    features: {
      promptInput: {
        placeholder: 'Instructions de modification...',
        multiline: true,
      },
      fileUpload: {
        accept: ['image/*'],
        multiple: false,
        base64Input: true,
        base64Output: true,
      },
    },
    configFields: [
      {
        name: 'modelType',
        type: 'select',
        label: 'Modèle',
        defaultValue: 'sdxl/refiner',
        options: [
          { value: 'sdxl/refiner', label: 'SDXL Refiner' },
        ],
      },
      {
        name: 'strength',
        type: 'number',
        label: 'Force',
        defaultValue: 0.3,
        min: 0,
        max: 1,
        step: 0.1,
      },
      {
        name: 'steps',
        type: 'number',
        label: 'Étapes',
        defaultValue: 20,
        min: 1,
        max: 100,
        step: 1,
      },
    ],
    actions: [
      {
        type: 'upload',
        handler: 'handleImageRefinement',
        requiresInput: true,
        errorMessages: {
          noFile: 'Veuillez sélectionner une image',
          noInput: 'Veuillez décrire les modifications souhaitées',
          apiError: 'Erreur lors de l\'amélioration de l\'image',
        },
        api: {
          path: '/ai/image/refine',
          method: 'POST',
          streaming: true,
          responseType: 'base64',
          requestTransform: (params) => ({
            image: params.base64,
            prompt: params.input,
            strength: params.strength || 0.3,
            steps: params.steps || 20,
          }),
        },
      },
    ],
  },
  {
    id: 'translation',
    label: 'Traduction',
    icon: 'language',
    features: {
      promptInput: {
        placeholder: 'Entrez le texte à traduire...',
        multiline: true,
      },
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
          { value: 'de', label: 'Allemand' },
        ],
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
          { value: 'de', label: 'Allemand' },
        ],
      },
    ],
    actions: [
      {
        type: 'send',
        handler: 'handleTranslation',
        requiresInput: true,
        errorMessages: {
          noInput: 'Veuillez entrer un texte à traduire',
          generating: 'Une traduction est déjà en cours',
          apiError: 'Erreur lors de la traduction',
        },
        api: {
          path: '/ai/translation/translate',
          method: 'POST',
          responseType: 'stream',
          streaming: true,
          loadingTxt: 'Traduction en cours...',
          requestTransform: (params) => ({
              stream: true,
              text: params.input,
              from_lang: params.fromLang || 'fr',
              to_lang: params.toLang || 'en',
          }),
          streamProcessor: () => {
            return null;
          },
          responseTransform: (response) => {
            return  response.text;
          },
        },
      },
    ],
  },
  {
    id: 'text_to_speech',
    label: 'Synthèse vocale',
    icon: 'volume-high',
    features: {
      promptInput: {
        placeholder: 'Entrez le texte à convertir en audio...',
        multiline: true,
      },
    },
    configFields: [
      {
        name: 'model_type',
        type: 'select',
        label: 'Type de modèle',
        defaultValue: 'xtts_v2',
        required: true,
        options: [
          { value: 'xtts_v2', label: 'XTTS v2' },
          { value: 'vits', label: 'VITS' },
          { value: 'coqui', label: 'Coqui' },
        ],
      },
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
          { value: 'de', label: 'Allemand' },
        ],
      },
      {
        name: 'voice',
        type: 'select',
        label: 'Voix',
        loading: true,
        defaultValue: '',
        required: true,
        initAction: {
          type: 'init',
        },
      },
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
          apiError: 'Erreur lors de la génération audio',
        },
        api: {
          path: '/ai/speech/text-to-speech',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => ({
            text: params.input,
            voice: params.voice,
            language: params.language || 'fr',
            model_type: params.model_type || 'xtts_v2',
          }),
          responseTransform: (response) => {
            if (response.status === 'completed') {
              const base64Audio = `data:audio/wav;base64,${response.audio}`;
              const audio = new Audio(base64Audio);
              audio.play();
              return `data:audio/wav;base64,${response.audio}`;
            }
            return response;
          },
        },
      },
    ],
    api: {
      init: {
        path: '/ai/speech/models',
        method: 'POST',
        responseType: 'json',
        requestTransform: () => ({
        }),
        responseTransform: (response) => {
          return response.models.tts[response.model_type || 'xtts_v2'].voices.map((voice: any) => ({
            value: voice.path,
            label: voice.label,
          }));
        },
      },
    },
  },
  {
    id: 'speech_to_text',
    label: 'Reconnaissance Vocale',
    icon: 'mic',
    features: {
      fileUpload: {
        accept: ['audio/*'],
        multiple: false,
        base64Input: true,
      },
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
          type: 'init',
        },
      },
      {
        name: 'micro',
        type: 'micro',
        label: 'Micro',
        onSelect: {
          action: 'execute',
          // paramName: 'audio',
        },
      },
    ],
    actions: [
      {
        type: 'upload',
        handler: 'handleSpeechToText',
        errorMessages: {
          noFile: 'Veuillez sélectionner un fichier audio',
          apiError: 'Erreur lors de la transcription',
        },
        api: {
          path: '/ai/speech/speech-to-text',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          streamProcessor: (chunk: any) => {
            return chunk.text;
          },
          responseTransform: (response) => {
            return response.text;
          },
          requestTransform: (params) => ({
              audio: params.base64,
              stream: true,
              model_size: params.model_size,
          }),
        },
      },
    ],
    api: {
      init: {
        path: '/ai/speech/models',
        method: 'POST',
        responseType: 'json',
        requestTransform: () => ({
        }),
        responseTransform: (response) => {
          console.log(response.models.stt.whisper.models);
          return Object.entries(response.models.stt.whisper.models).map(([size, config]) => ({
            value: size,
            label: `${(config as any).name} - ${(config as any).description}`,
          }));
        },
      },
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
    },
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: 'analytics',
    actions: [
      {
        type: 'systemStats',
        handler: 'handleSystemStats',
        api: {
          path: '/monitor/system/stats',
          method: 'GET',
          responseType: 'json',
        },
      },
      {
        type: 'containersList',
        handler: 'handleContainersList',
        api: {
          path: '/monitor/containers',
          method: 'GET',
          responseType: 'json',
        },
      },
      {
        type: 'execute',
        handler: 'handleContainerAction',
        api: {
          path: '/monitor/containers/{containerId}/{action}',
          method: 'POST',
          responseType: 'json',
        },
      },
    ],
  },
  {
    id: 'audio_chat',
    label: 'Chat Audio',
    icon: 'mic-circle',
    features: {
      promptInput: {
        placeholder: 'Tapez votre message...',
        multiline: true,
      },
      fileUpload: {
        accept: ['audio/*'],
        multiple: false,
        base64Input: true,
      },
    },
    configFields: [
      {
        name: 'micro',
        type: 'micro',
        label: 'Micro',
        onSelect: {
          action: 'execute',
          paramName: 'audio',
        },
      },
    ],
    actions: [
      {
        type: 'send',
        handler: 'handleAudioChat',
        api: {
          path: '/ai/chaining/chat',
          method: 'POST',
          streaming: true,
          responseType: 'stream',
          requestTransform: (params) => {
            return {
            text: params.input || undefined,
              audio: params.audio || undefined,
            };
          },
          streamProcessor: (chunk: any) => {
            if (chunk.type === 'text') {
              return chunk.content;
            } else if (chunk.type === 'audio') {
              const base64Audio = `data:audio/wav;base64,${chunk.content}`;
              const audio = new Audio(base64Audio);
              audio.play();
              return null;
            }
            return null;
          },
        },
      },
    ],
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
      }
      return toolState.input || 'Message';
    },
  },
  {
    id: 'files',
    label: 'Gestionnaire de fichiers',
    icon: 'folder',
    customComponent: 'FileManager',
    features: {
      fileUpload: {
        accept: ['*/*'],
        multiple: true,
        dragDrop: true,
      },
    },
    actions: [
      {
        type: 'upload',
        handler: 'handleFileUpload',
        errorMessages: {
          apiError: 'Erreur lors du téléchargement des fichiers',
        },
        api: {
          path: '/files/upload',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => {
            const formData = new FormData();
            if (params.files) {
              params.files.forEach((file: File) => {
                formData.append('files', file);
              });
            }
            formData.append('path', params.currentPath || '/');
            return formData;
          },
        },
      },
      {
        type: 'list_directory',
        handler: 'handleListDirectory',
        api: {
          path: '/files/list',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
            path: params.currentPath || '/',
          }),
        },
      },
      {
        type: 'create_directory',
        handler: 'handleCreateDirectory',
        api: {
          path: '/files/directory/create',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
            path: `${params.currentPath}/${params.directoryName}`,
          }),
        },
      },
      {
        type: 'delete_file',
        handler: 'handleDeleteFile',
        api: {
          path: '/files/delete',
          method: 'DELETE',
          responseType: 'json',
          requestTransform: (params) => ({
            path: params.filePath,
          }),
        },
      },
      {
        type: 'move_file',
        handler: 'handleMoveFile',
        api: {
          path: '/files/move',
          method: 'POST',
          responseType: 'json',
          requestTransform: (params) => ({
            source: params.sourcePath,
            destination: params.destinationPath,
          }),
        },
      },
    ],
  },
];
