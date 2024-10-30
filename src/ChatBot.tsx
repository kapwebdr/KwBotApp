import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated, TouchableWithoutFeedback, Modal, ScrollView, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
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
import { getAvailableModels, loadModel, streamChatCompletion, loadSessionId, stopGeneration } from './api';
import ErrorModal from './ErrorModal';

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
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf'],
        copyToCacheDirectory: false,
        multiple: true,
      });

      if (result.type === 'success') {
        const files = Array.isArray(result) ? result : [result];
        for (const file of files) {
          let fileContent: string;
          if (Platform.OS === 'web') {
            const response = await fetch(file.uri);
            fileContent = await response.text();
          } else {
            fileContent = await FileSystem.readAsStringAsync(file.uri);
          }
          await processAndStoreDocument(fileContent, file.name);
        }
        Alert.alert('Succès', 'Les documents ont été traités et stockés avec succès.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      Alert.alert('Erreur', 'Impossible de charger les fichiers.');
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
        if (models.length > 0) {
          const firstModel = models[0];
          setSelectedModel(firstModel);
          
          const success = await loadModel(
            firstModel,
            (progress) => {
              setLoadingProgress(progress);
            },
            (status) => {
              setLoadingStatus(status);
            }
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
    if (!input.trim() || !selectedModel || !currentConversationId || isGenerating) return;

    const newMessages = [
      ...messages,
      { role: 'user', content: input } as Message,
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
      flatListRef.current.scrollToEnd({ animated: false });
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      height: 60,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    contentContainer: {
      flex: 1,
      marginTop: 60,
      marginBottom: 60,
    },
    messageList: {
      paddingHorizontal: 15,
      paddingVertical: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      backgroundColor: theme.colors.background, // Utiliser la couleur de fond du thème
      borderTopWidth: 1,
      borderTopColor: theme.colors.border, // Utiliser la couleur de bordure du thème
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    sidebar: {
      position: 'absolute',
      left: 0,
      top: 60, // Ajustez cette valeur pour qu'elle corresponde à la hauteur de votre barre supérieure
      bottom: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: theme.colors.background,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      zIndex: 5, // Assurez-vous que ce zIndex est inférieur à celui de la barre supérieure
    },
    newConversationButton: {
      padding: 15,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
    },
    newConversationButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    conversationItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    conversationItem: {
      flex: 1,
      padding: 15,
    },
    conversationTimestamp: {
      fontSize: theme.fontSizes.small,
      color: '#999',
    },
    conversationPreview: {
      fontSize: theme.fontSizes.medium,
      color: theme.colors.text,
      marginTop: 5,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 20,
      marginBottom: 10,
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.userBubble,
    },
    aiBubble: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.aiBubble,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    messageText: {
      fontSize: theme.fontSizes.medium,
    },
    userText: {
      color: theme.colors.userText,
    },
    aiText: {
      color: theme.colors.aiText,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.inputBackground, // Déjà correct, mais assurez-vous que c'est bien défini
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: theme.fontSizes.medium,
      color: theme.colors.text,
    },
    sendButton: {
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.inputBackground, // Utiliser la même couleur que l'input
    },
    deleteButton: {
      padding: 15,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalText: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalButton: {
      padding: 10,
      borderRadius: 5,
      backgroundColor: '#4A90E2',
    },
    modalButtonDanger: {
      backgroundColor: 'red',
    },
    modalButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    uploadButton: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.inputBackground, // Utiliser la même couleur que l'input
    },
    codeBlockContainer: {
      marginVertical: 10,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    codeBlock: {
      padding: 10,
      fontSize: 14,
      borderRadius: 8,
    },
    copyButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    systemMessageInput: {
      flex: 1,
      marginHorizontal: 10,
      padding: 5,
      borderRadius: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: 14,
    },
    headerControls: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 10,
    },
    modelSelectContainer: {
      flex: 1,
      position: 'relative',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 5,
      minWidth: 120,
    },
    modelSelectIcon: {
      position: 'absolute',
      right: 5,
      top: '50%',
      transform: [{ translateY: -8 }],
      pointerEvents: 'none',
    },
    loadingProgressContainer: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      padding: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 4,
      marginTop: 4,
      zIndex: 1000,
    },
    loadingText: {
      color: theme.colors.text,
      fontSize: 12,
      marginBottom: 4,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    inputDisabled: {
      opacity: 0.7,
    },
    sendButtonDisabled: {
      opacity: 0.7,
    },
    stopButton: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
  });

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
        <View style={styles.headerControls}>
          <TextInput
            style={styles.systemMessageInput}
            value={systemMessage}
            onChangeText={updateSystemMessage}
            placeholder="Message système..."
            placeholderTextColor={theme.colors.text}
          />
          <View style={styles.modelSelectContainer}>
            {isModelLoading && (
              <View style={styles.loadingProgressContainer}>
                <Text style={styles.loadingText}>
                  {loadingStatus === 'exists' ? 'Modèle déjà chargé' :
                   loadingStatus === 'completed' ? 'Téléchargement terminé' :
                   loadingStatus === 'loaded' ? 'Modèle chargé' :
                   `Chargement: ${Math.round(loadingProgress * 100)}%`}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${loadingProgress * 100}%` }]} />
                </View>
              </View>
            )}
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
            <Animated.View 
              style={[
                styles.modelSelectIcon,
                isModelLoading && { transform: [{ rotate: spin }] }
              ]}
            >
              <Ionicons 
                name={isModelLoading ? "reload" : "chevron-down"}
                size={16} 
                color={theme.colors.text}
              />
            </Animated.View>
          </View>
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
          renderItem={({ item }) => renderMessage(item)}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 60}
        style={[styles.inputContainer, { backgroundColor: theme.colors.background }]}
      >
        <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
          <Ionicons name="document-attach" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUrlInput}>
          <Ionicons name="link" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            isGenerating && styles.inputDisabled
          ]}
          value={input}
          onChangeText={setInput}
          placeholder={isGenerating ? "Génération en cours..." : "Tapez votre message..."}
          placeholderTextColor="#999"
          onKeyPress={handleKeyPress}
          multiline
          editable={!isGenerating}
        />
        {isGenerating ? (
          <TouchableOpacity 
            style={[styles.sendButton, styles.stopButton]}
            onPress={handleStop}
          >
            <Ionicons 
              name="stop" 
              size={24} 
              color="red"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!input.trim() || isGenerating) && styles.sendButtonDisabled
            ]}
            onPress={handleSend} 
            disabled={!input.trim() || isGenerating}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={!input.trim() || isGenerating ? "#999" : theme.colors.primary} 
            />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
      {isSidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.sidebarOverlay} />
        </TouchableWithoutFeedback>
      )}
      {renderSidebar()}
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
    </View>
  );
};


export default ChatBot;
