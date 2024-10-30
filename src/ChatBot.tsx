import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Animated, TouchableWithoutFeedback, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { BASE_API_URL, BASE_API_KEY } from '@env';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import * as DocumentPicker from 'expo-document-picker';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Clipboard from '@react-native-clipboard/clipboard';
import { lightTheme, darkTheme, getTheme, saveTheme } from './theme';
import * as FileSystem from 'expo-file-system';
import ConfirmationModal from './ConfirmationModal';
import UrlInputModal from './UrlInputModal';
import { getAvailableModels, loadModel, streamChatCompletion, loadSessionId, stopGeneration, generateImage, refineImage, analyzeImage, extractTextFromImage } from './api';
import ErrorModal from './ErrorModal';
import { TOOLS, ToolType } from './types';
import { MessageBubble } from './components/MessageBubble';
import { ToolBar } from './components/ToolBar';
import { ToolOptionsBar } from './components/ToolOptionsBar';
import { ToolComponent } from './components/Tool';
import { createStyles } from './styles/theme.styles';
import { Sidebar } from './components/Sidebar';

interface Message {
  role: 'human' | 'ai';
  content: string;
}

interface Conversation {
  id: string;
  messages: Message[];
  timestamp: number;
  systemMessage: string; // Ajout du message système personnalisé
}

const SIDEBAR_WIDTH = 250;
const MAX_PREVIEW_LENGTH = 50;

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatbot, setChatbot] = useState<ChatOpenAI | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [confirmationModal, setConfirmationModal] = useState({ isVisible: false, message: '', onConfirm: () => {} });
  const [vectorStore, setVectorStore] = useState<MemoryVectorStore | null>(null);
  const [urlInputModalVisible, setUrlInputModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [theme, setTheme] = useState(lightTheme);
  const colorScheme = useColorScheme();
  const [systemMessage, setSystemMessage] = useState<string>("Vous êtes un assistant IA utile.");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const loadingIconRotation = useRef(new Animated.Value(0)).current;
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [isWaitingFirstResponse, setIsWaitingFirstResponse] = useState(false);
  const [dots, setDots] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [currentTool, setCurrentTool] = useState<ToolType>('chat');
  const [tempImageData, setTempImageData] = useState<string | null>(null);
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    base64: string;
    name: string;
    type: string;
  } | null>(null);
  const [toolConfigs, setToolConfigs] = useState<Record<ToolType, any>>({
    'chat': {
      systemMessage: "Vous êtes un assistant IA utile.",
      model: '',
    },
    'image-generation': {
      modelType: 'sdxl-turbo',
      width: 1024,
      height: 1024,
      steps: 20,
    },
    'image-analysis': {
      labels: ['chat', 'chien', 'oiseau', 'personne', 'voiture'],
    },
    'image-refine': {
      strength: 0.3,
      steps: 20,
    },
    'ocr': {},
  });

  useEffect(() => {
    const loadSavedTheme = async () => {
      const savedTheme = await getTheme();
      setTheme(savedTheme);
    };
    loadSavedTheme();
  }, []);

  const toggleDarkMode = async () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    await saveTheme(newTheme === darkTheme);
  };

  useEffect(() => {
    const initChatbot = async () => {
      await loadSessionId();
      
      const chat = new ChatOpenAI({
        openAIApiKey: BASE_API_KEY,
        configuration: {
          baseURL: BASE_API_URL,
        },
      });
      setChatbot(chat);
      await loadUserId();
      await loadConversations();
      await initVectorStore();
    };
    initChatbot();
  }, []);

  const initVectorStore = async () => {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: BASE_API_KEY,
      configuration: {
        baseURL: BASE_API_URL,
      },
    });
    const store = new MemoryVectorStore(embeddings);
    setVectorStore(store);
  };

  const loadUserId = async () => {
    try {
      let id = await AsyncStorage.getItem('userId');
      if (!id) {
        id = uuid.v4() as string;
        await AsyncStorage.setItem('userId', id);
      }
      setUserId(id);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ID utilisateur:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const storedConversations = await AsyncStorage.getItem('conversations');
      if (storedConversations) {
        const parsedConversations = JSON.parse(storedConversations);
        setConversations(parsedConversations);
        if (parsedConversations.length > 0) {
          const lastConversation = parsedConversations[parsedConversations.length - 1];
          setCurrentConversationId(lastConversation.id);
          setMessages(lastConversation.messages);
        } else {
          startNewConversation();
        }
      } else {
        startNewConversation();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    }
  };

  const saveConversations = async (updatedConversations: Conversation[]) => {
    try {
      await AsyncStorage.setItem('conversations', JSON.stringify(updatedConversations));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des conversations:', error);
    }
  };

  const startNewConversation = () => {
    const newConversationId = uuid.v4() as string;
    const newConversation: Conversation = {
      id: newConversationId,
      messages: [],
      timestamp: Date.now(),
      systemMessage: systemMessage, // Utilisation du message système actuel
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversationId);
    setMessages([]);
    saveConversations([newConversation, ...conversations]);
    closeSidebar();
  };

  const handleFileUpload = async () => {
    const currentToolConfig = TOOLS.find(tool => tool.id === currentTool);
    if (!currentToolConfig?.acceptsFile) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: currentToolConfig.fileTypes || '*/*',
        copyToCacheDirectory: false,
      });

      if (result.type === 'success') {
        let base64Content: string;
        
        if (Platform.OS === 'web') {
          const response = await fetch(result.uri);
          const blob = await response.blob();
          base64Content = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          const fileContent = await FileSystem.readAsStringAsync(result.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          base64Content = `data:${result.mimeType};base64,${fileContent}`;
        }

        setPendingFile({
          base64: base64Content,
          name: result.name,
          type: result.mimeType || 'application/octet-stream'
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement du fichier');
    }
  };

  const handleUrlInput = () => {
    setUrlInputModalVisible(true);
  };

  const processUrl = async (url: string) => {
    setUrlInputModalVisible(false);
    if (url) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        await processAndStoreDocument(text, url);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'URL:', error);
        Alert.alert('Erreur', 'Impossible de charger le contenu de l\'URL.');
      }
    }
  };

  const processAndStoreDocument = async (text: string, source: string) => {
    if (!vectorStore) {
      console.error('VectorStore non initialisé');
      return;
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.createDocuments([text], [{ source }]);
    
    // Créer les embeddings et les stocker
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: BASE_API_KEY,
      configuration: {
        baseURL: BASE_API_URL,
      },
    });
    
    for (const doc of docs) {
      const embedding = await embeddings.embedQuery(doc.pageContent);
      await vectorStore.addDocuments([{ ...doc, embedding }]);
    }
    
    console.log(`Document traité et stocké : ${source}`);
  };

  useEffect(() => {
    const initModels = async () => {
      setIsModelLoading(true);
      startLoadingAnimation();
      setLoadingProgress(0);
      setLoadingStatus('');
      
      try {
        const models = await getAvailableModels();
        setAvailableModels(models);
        
        // Mettre à jour les options de sélection du modèle dans les outils
        const updatedTools = TOOLS.map(tool => {
          if (tool.id === 'chat') {
            const modelField = tool.configFields?.find(field => field.name === 'model');
            if (modelField) {
              modelField.options = models;
            }
          }
          return tool;
        });
        
        if (models.length > 0) {
          const firstModel = models[0];
          setSelectedModel(firstModel);
          setToolConfigs(prev => ({
            ...prev,
            chat: {
              ...prev.chat,
              model: firstModel
            }
          }));
          
          const success = await loadModel(
            firstModel,
            (progress) => setLoadingProgress(progress),
            (status) => setLoadingStatus(status)
          );

          if (!success) {
            Alert.alert('Erreur', `Impossible de charger le modèle ${firstModel}`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des modèles:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors du chargement initial du modèle');
      } finally {
        setIsModelLoading(false);
      }
    };
    initModels();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaitingFirstResponse) {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaitingFirstResponse]);

  const handleSend = async () => {
    if ((!input.trim() && !pendingFile) || isGenerating) return;

    if (pendingFile) {
      const base64Content = pendingFile.base64.split(',')[1];
      setIsGenerating(true);

      try {
        switch (currentTool) {
          case 'image-analysis':
            const labels = ['chat', 'chien', 'oiseau', 'personne', 'voiture'];
            
            // Ajouter le message de l'utilisateur immédiatement
            const userMessage = { 
              role: 'human', 
              content: pendingFile.type.startsWith('image/') 
                ? `![${pendingFile.name}](${pendingFile.base64})`
                : pendingFile.name
            };
            setMessages([...messages, userMessage]);
            scrollToBottom();

            // Ajouter un message temporaire pour l'analyse
            const tempAnalysisMessage = {
              role: 'ai',
              content: 'Analyse de l\'image en cours...'
            };
            setMessages(prev => [...prev, tempAnalysisMessage]);
            scrollToBottom();

            const analysisResult = await analyzeImage({
              image: base64Content,
              labels
            });

            // Mettre à jour avec le résultat final
            setMessages(prev => [
              ...prev.slice(0, -1),
              {
                role: 'ai',
                content: `Résultats de l'analyse:\n${JSON.stringify(analysisResult, null, 2)}`
              }
            ]);
            scrollToBottom();
            break;

          case 'ocr':
            // Ajouter le message de l'utilisateur immédiatement
            const userOcrMessage = { 
              role: 'human', 
              content: pendingFile.type.startsWith('image/') 
                ? `![${pendingFile.name}](${pendingFile.base64})`
                : pendingFile.name
            };
            setMessages([...messages, userOcrMessage]);
            scrollToBottom();

            // Ajouter un message temporaire pour l'OCR
            const tempOcrMessage = {
              role: 'ai',
              content: 'Extraction du texte en cours...'
            };
            setMessages(prev => [...prev, tempOcrMessage]);
            scrollToBottom();

            const ocrResult = await extractTextFromImage({
              image: base64Content
            });

            // Mettre à jour avec le résultat final
            setMessages(prev => [
              ...prev.slice(0, -1),
              {
                role: 'ai',
                content: `Texte extrait:\n${ocrResult.text}`
              }
            ]);
            scrollToBottom();
            break;

          case 'image-refine':
            if (!input.trim()) {
              Alert.alert('Erreur', 'Veuillez décrire les modifications souhaitées');
              return;
            }
            setIsGenerating(true);
            try {
              await refineImage(
                {
                  image: base64Content,
                  prompt: input,
                  strength: 0.3,
                },
                (progress) => {
                  setLoadingProgress(progress);
                },
                (imageBase64) => {
                  const newMessage = {
                    role: 'ai',
                    content: `![Refined Image](data:image/png;base64,${imageBase64})`,
                  };
                  setMessages([
                    ...messages, 
                    { 
                      role: 'human', 
                      content: `![${pendingFile.name}](${pendingFile.base64})\n\n${input}`
                    }, 
                    newMessage
                  ]);
                }
              );
            } catch (error) {
              console.error('Erreur lors du raffinement de l\'image:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors du raffinement de l\'image');
            } finally {
              setIsGenerating(false);
            }
            break;
        }
      } catch (error) {
        console.error('Erreur lors du traitement:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors du traitement');
      } finally {
        setIsGenerating(false);
        setPendingFile(null);
        setInput('');
      }
      return;
    }

    switch (currentTool) {
      case 'image-generation':
        setIsGenerating(true);
        try {
          await generateImage(
            {
              model_type: "sdxl-turbo", // Vous pouvez ajouter un sélecteur de modèle si nécessaire
              prompt: input,
            },
            (progress) => {
              setLoadingProgress(progress);
            },
            (imageBase64) => {
              // Ajouter l'image générée aux messages
              const newMessage = {
                role: 'ai',
                content: `![Generated Image](data:image/png;base64,${imageBase64})`,
              };
              setMessages([...messages, { role: 'human', content: input }, newMessage]);
            }
          );
        } catch (error) {
          console.error('Erreur lors de la génération de l\'image:', error);
          Alert.alert('Erreur', 'Une erreur est survenue lors de la génération de l\'image');
        } finally {
          setIsGenerating(false);
          setInput('');
        }
        break;

      case 'image-refine':
        if (!tempImageData) {
          Alert.alert('Erreur', 'Veuillez d\'abord sélectionner une image à raffiner');
          return;
        }
        setIsGenerating(true);
        try {
          await refineImage(
            {
              image: tempImageData,
              prompt: input,
              strength: 0.3, // Valeur par défaut, vous pouvez la rendre configurable
            },
            (progress) => {
              setLoadingProgress(progress);
            },
            (imageBase64) => {
              const newMessage = {
                role: 'ai',
                content: `![Refined Image](data:image/png;base64,${imageBase64})`,
              };
              setMessages([...messages, { role: 'human', content: input }, newMessage]);
              setTempImageData(null); // Réinitialiser l'image temporaire
            }
          );
        } catch (error) {
          console.error('Erreur lors du raffinement de l\'image:', error);
          Alert.alert('Erreur', 'Une erreur est survenue lors du raffinement de l\'image');
        } finally {
          setIsGenerating(false);
          setInput('');
        }
        break;

      default:
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
            selectedModel,
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

          const updatedConversations = conversations.map(conv =>
            conv.id === currentConversationId
              ? { ...conv, messages: [...newMessages, aiMessage], timestamp: Date.now() }
              : conv
          );
          setConversations(updatedConversations);
          await saveConversations(updatedConversations);
        } catch (error) {
          console.error('Erreur lors de l\'appel à l\'API:', error);
          Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi du message.');
        } finally {
          setIsWaitingFirstResponse(false);
          setIsGenerating(false);
        }
        break;
    }
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setSystemMessage(conversation.systemMessage); // Charger le message système de la conversation
      closeSidebar();
    }
  };

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.timing(sidebarAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    Animated.timing(sidebarAnimation, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const truncateMessage = (message: string) => {
    return message.length > MAX_PREVIEW_LENGTH
      ? message.substring(0, MAX_PREVIEW_LENGTH) + '...'
      : message;
  };

  const showConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmationModal({
      isVisible: true,
      message,
      onConfirm,
    });
  };

  const hideConfirmation = () => {
    setConfirmationModal({ isVisible: false, message: '', onConfirm: () => {} });
  };

  const deleteConversation = (conversationId: string) => {
    showConfirmation(
      "Êtes-vous sûr de vouloir supprimer cette conversation ?",
      () => {
        const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
        setConversations(updatedConversations);
        saveConversations(updatedConversations);
        if (conversationId === currentConversationId) {
          if (updatedConversations.length > 0) {
            loadConversation(updatedConversations[0].id);
          } else {
            startNewConversation();
          }
        }
        hideConfirmation();
      }
    );
  };

  const renderSidebar = () => (
    <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnimation }] }]}>
      <TouchableOpacity style={styles.newConversationButton} onPress={startNewConversation}>
        <Text style={styles.newConversationButtonText}>Nouvelle conversation</Text>
      </TouchableOpacity>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.conversationItemContainer}>
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => loadConversation(item.id)}
            >
              <Text style={styles.conversationTimestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.conversationPreview}>
                {item.messages.length > 0
                  ? truncateMessage(item.messages[0].content)
                  : 'Nouvelle conversation'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteConversation(item.id)}
            >
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </Animated.View>
  );

  const handleKeyPress = (e: React.KeyboardEvent<TextInput>) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderCodeBlock = (code: string, language: string) => (
    <View style={styles.codeBlockContainer}>
      <SyntaxHighlighter
        language={language}
        style={tomorrow}
        customStyle={styles.codeBlock}
      >
        {code}
      </SyntaxHighlighter>
      <TouchableOpacity
        style={styles.copyButton}
        onPress={() => {
          Clipboard.setString(code);
          Alert.alert('Copié', 'Le code a été copié dans le presse-papiers');
        }}
      >
        <Ionicons name="copy-outline" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderMessage = (item: Message) => {
    // Vérifier si le contenu est une image base64
    const imageMatch = item.content.match(/!\[.*?\]\((data:image\/[^;]+;base64,[^)]+)\)/);
    
    if (imageMatch) {
      const base64Data = imageMatch[1];
      return (
        <View style={[
          styles.messageBubble,
          item.role === 'human' ? styles.userBubble : styles.aiBubble
        ]}>
          {isGenerating ? (
            <View style={styles.imageGenerationProgress}>
              <Text style={[styles.messageText, item.role === 'human' ? styles.userText : styles.aiText]}>
                Génération de l'image en cours...
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${loadingProgress * 100}%` }
                  ]} 
                />
              </View>
            </View>
          ) : (
            <Image
              source={{ uri: base64Data }}
              style={styles.messageImage}
              resizeMode="contain"
            />
          )}
        </View>
      );
    }

    // Si ce n'est pas une image, continuer avec le rendu normal du message
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = item.content.split(codeBlockRegex);

    return (
      <View style={[
        styles.messageBubble,
        item.role === 'human' ? styles.userBubble : styles.aiBubble
      ]}>
        {parts.map((part, index) => {
          if (index % 3 === 0) {
            return (
              <Text key={`text-${index}`} style={[
                styles.messageText,
                item.role === 'human' ? styles.userText : styles.aiText
              ]}>
                {item.role === 'assistant' && isWaitingFirstResponse && part === '...' 
                  ? '...' + dots 
                  : part}
              </Text>
            );
          } else if (index % 3 === 1) {
            const language = part || 'javascript';
            const code = parts[index + 1];
            return <View key={`code-${index}`}>{renderCodeBlock(code, language)}</View>;
          }
          return null;
        })}
      </View>
    );
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateSystemMessage = (newSystemMessage: string) => {
    setSystemMessage(newSystemMessage);
    if (currentConversationId) {
      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, systemMessage: newSystemMessage }
          : conv
      );
      setConversations(updatedConversations);
      saveConversations(updatedConversations);
    }
  };

  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.timing(loadingIconRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const handleModelChange = async (modelName: string) => {
    setIsModelLoading(true);
    startLoadingAnimation();
    setLoadingProgress(0);
    setLoadingStatus('');
    
    try {
      const success = await loadModel(
        modelName,
        (progress) => {
          setLoadingProgress(progress);
        },
        (status) => {
          setLoadingStatus(status);
        }
      );

      if (success) {
        setSelectedModel(modelName);
        console.log(`Modèle ${modelName} chargé avec succès`);
      } else {
        Alert.alert('Erreur', `Impossible de charger le modèle ${modelName}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement du modèle');
    } finally {
      setIsModelLoading(false);
    }
  };

  const spin = loadingIconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handleStop = async () => {
    try {
      const success = await stopGeneration();
      if (success) {
        setIsGenerating(false);
        setIsWaitingFirstResponse(false);
      } else {
        Alert.alert('Erreur', 'Impossible d\'arrêter la génération');
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de la génération:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'arrêt de la génération');
    }
  };

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${process.env.BASE_API_URL}/models`);
      if (!response.ok) throw new Error('API non disponible');
      setIsApiAvailable(true);
      return true;
    } catch (error) {
      setIsApiAvailable(false);
      setApiErrorMessage(
        "Impossible de se connecter à l'API. Veuillez vérifier que le serveur est en cours d'exécution et réessayer."
      );
      return false;
    }
  };

  const handleRetryConnection = async () => {
    const isAvailable = await checkApiConnection();
    if (isAvailable) {
      // Réinitialiser l'application
      const initResult = await initChatbot();
      if (!initResult) {
        setIsApiAvailable(false);
        setApiErrorMessage("L'API est disponible mais ne répond pas correctement. Veuillez réessayer.");
      }
    }
  };

  const initChatbot = async () => {
    try {
      setIsModelLoading(true);
      startLoadingAnimation();
      setLoadingProgress(0);
      setLoadingStatus('');
      
      const models = await getAvailableModels();
      if (models.length === 0) {
        throw new Error('Aucun modèle disponible');
      }

      setAvailableModels(models);
      const firstModel = models[0];
      setSelectedModel(firstModel);
      
      const success = await loadModel(
        firstModel,
        (progress) => setLoadingProgress(progress),
        (status) => setLoadingStatus(status)
      );

      if (!success) {
        throw new Error(`Impossible de charger le modèle ${firstModel}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      return false;
    } finally {
      setIsModelLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAvailable = await checkApiConnection();
      if (isAvailable) {
        await initChatbot();
      }
    };
    init();
  }, []);

  const renderToolSelector = () => (
    <View style={styles.toolSelector}>
      <TouchableOpacity
        style={[
          styles.toolDropdownButton,
          isToolMenuOpen && styles.toolDropdownButtonActive
        ]}
        onPress={() => setIsToolMenuOpen(!isToolMenuOpen)}
      >
        <View style={styles.toolDropdownContent}>
          <Ionicons 
            name={TOOLS.find(t => t.id === currentTool)?.icon || 'apps'} 
            size={20} 
            color={theme.colors.text} 
          />
          <Text style={styles.toolDropdownText}>
            {TOOLS.find(t => t.id === currentTool)?.label || 'Sélectionner un outil'}
          </Text>
          <Ionicons 
            name={isToolMenuOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.colors.text} 
          />
        </View>
      </TouchableOpacity>
      {isToolMenuOpen && (
        <View style={styles.toolDropdownMenu}>
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolMenuItem,
                currentTool === tool.id && styles.toolMenuItemActive
              ]}
              onPress={() => {
                setCurrentTool(tool.id);
                setIsToolMenuOpen(false);
              }}
            >
              <Ionicons 
                name={tool.icon} 
                size={20} 
                color={currentTool === tool.id ? theme.colors.primary : theme.colors.text} 
              />
              <Text style={[
                styles.toolMenuItemText,
                currentTool === tool.id && styles.toolMenuItemTextActive
              ]}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderToolSpecificControls = () => {
    if (currentTool === 'chat') {
      return (
        <View style={styles.toolControls}>
          <TextInput
            style={styles.systemMessageInput}
            value={systemMessage}
            onChangeText={updateSystemMessage}
            placeholder="Message système..."
            placeholderTextColor={theme.colors.text}
          />
          <View style={styles.modelSelectContainer}>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                color: theme.colors.text,
                border: 'none',
                borderRadius: 5,
                padding: '5px',
                fontSize: '14px',
                outline: 'none',
                cursor: isModelLoading ? 'wait' : 'pointer',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                opacity: isModelLoading ? 0.5 : 1,
              }}
              disabled={isModelLoading}
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </View>
        </View>
      );
    }
    // Ajoutez ici les contrôles spécifiques pour les autres outils
    return null;
  };

  const handleConfigChange = (toolId: ToolType, config: any) => {
    setToolConfigs(prev => ({
      ...prev,
      [toolId]: config
    }));

    if (toolId === 'chat') {
      if ('systemMessage' in config) {
        setSystemMessage(config.systemMessage);
      }
      if ('model' in config) {
        handleModelChange(config.model);
      }
    }
  };

  const styles = createStyles(theme, currentTool);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isToolMenuOpen) {
        setIsToolMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isToolMenuOpen]);

  const renderCurrentTool = () => {
    const tool = TOOLS.find(t => t.id === currentTool);
    if (!tool) return null;

    return (
      <ToolComponent
        toolId={currentTool}
        config={toolConfigs[currentTool]}
        onConfigChange={(config) => handleConfigChange(currentTool, config)}
        input={input}
        setInput={setInput}
        isGenerating={isGenerating}
        handleSend={handleSend}
        handleStop={handleStop}
        handleFileUpload={handleFileUpload}
        handleUrlInput={handleUrlInput}
        pendingFile={pendingFile}
        setPendingFile={setPendingFile}
        systemMessage={systemMessage}
        updateSystemMessage={updateSystemMessage}
        selectedModel={selectedModel}
        availableModels={availableModels}
        isModelLoading={isModelLoading}
        onModelChange={handleModelChange}
      />
    );
  };

  if (!isApiAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorModal
          isVisible={true}
          onRetry={handleRetryConnection}
          message={apiErrorMessage}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ToolBar
            currentTool={currentTool}
            isToolMenuOpen={isToolMenuOpen}
            setIsToolMenuOpen={setIsToolMenuOpen}
            setCurrentTool={setCurrentTool}
            tools={TOOLS}
          />
        </View>

        <TouchableOpacity onPress={toggleDarkMode}>
          <Ionicons name={theme === darkTheme ? "sunny" : "moon"} size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `message-${index}`}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isGenerating={isGenerating}
              loadingProgress={loadingProgress}
              dots={dots}
              isWaitingFirstResponse={isWaitingFirstResponse}
              renderCodeBlock={renderCodeBlock}
            />
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
      </View>

      {/* Configuration des outils */}
      <ToolOptionsBar
        currentTool={currentTool}
        config={toolConfigs[currentTool]}
        onConfigChange={(config) => handleConfigChange(currentTool, config)}
      />

      {/* Affichage du Tool actif */}
      {renderCurrentTool()}

      {isSidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.sidebarOverlay} />
        </TouchableWithoutFeedback>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        conversations={conversations}
        currentConversationId={currentConversationId}
        sidebarAnimation={sidebarAnimation}
        onNewConversation={startNewConversation}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
      />

      <ConfirmationModal
        isVisible={confirmationModal.isVisible}
        onConfirm={confirmationModal.onConfirm}
        onCancel={hideConfirmation}
        message={confirmationModal.message}
      />

      <UrlInputModal
        isVisible={urlInputModalVisible}
        onSubmit={processUrl}
        onCancel={() => setUrlInputModalVisible(false)}
      />

      {!isApiAvailable && (
        <ErrorModal
          isVisible={true}
          onRetry={handleRetryConnection}
          message={apiErrorMessage}
        />
      )}
    </View>
  );
};


export default ChatBot;
