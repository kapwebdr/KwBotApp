import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Tool, ToolConfig as IToolConfig } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles, getSelectStyle } from '../styles/theme.styles';
import { Ionicons } from '@expo/vector-icons';
import { useTool } from '../hooks/useTool';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';

interface ToolConfigComponentProps {
  tool: Tool;
  config: IToolConfig;
  onConfigChange: (config: IToolConfig) => void;
}

export const ToolConfigComponent: React.FC<ToolConfigComponentProps> = ({
  tool,
  config,
  onConfigChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const styles = createStyles({ theme }, tool.id);
  const { 
    selectConfigs,
    input,
    setInput,
    isGenerating,
    handleToolAction,
    isModelLoading,
    modelLoadingProgress,
    modelLoadingStatus,
    loadSelectedModel
  } = useTool();
  const [isListening, setIsListening] = useState(false);
  const speechRecognition = useRef<SpeechRecognition | null>(null);

  const handleConfigChange = (name: string, value: any) => {
    onConfigChange({
      ...config,
      [name]: value,
    });
  };

  const hasPromptInput = !!tool.features?.promptInput;
  const hasFileUpload = !!tool.features?.fileUpload;
  const hasUrlInput = !!tool.features?.urlInput;

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convertir le fichier en base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      await handleToolAction('upload', {
        base64,
        name: file.name,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlInput = () => {
    handleToolAction('url');
  };

  const handleSend = () => {
    handleToolAction('send');
  };

  const handleStop = () => {
    handleToolAction('stop');
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <TextInput
            style={styles.textInput}
            value={config[field.name] as string}
            onChangeText={(value) => handleConfigChange(field.name, value)}
            placeholder={field.placeholder || field.label}
            placeholderTextColor={theme.colors.text}
          />
        );

      case 'select':
        const selectConfig = selectConfigs[field.name];
        if (selectConfig) {
          return (
            <View style={styles.modelSelectContainer}>
              <select
                value={selectConfig.value}
                onChange={(e) => {
                  if (field.name === 'model') {
                    loadSelectedModel(e.target.value);
                  }
                  selectConfig.onChange(e.target.value);
                }}
                style={getSelectStyle({ theme }, selectConfig.isLoading)}
                disabled={selectConfig.isLoading || isModelLoading}
              >
                <option value="">Sélectionnez un modèle</option>
                {Array.isArray(selectConfig.options) && selectConfig.options.map((option: string | { value: string; label: string }) => {
                  if (typeof option === 'string') {
                    return (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    );
                  } else {
                    return (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    );
                  }
                })}
              </select>
              {isModelLoading && (
                <View style={styles.modelLoadingContainer}>
                  <Text style={styles.modelLoadingStatus}>{modelLoadingStatus}</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${modelLoadingProgress}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}
              <Ionicons 
                name={isModelLoading ? "reload" : "chevron-down"} 
                size={16} 
                color={theme.colors.text}
                style={[
                  styles.modelSelectIcon,
                  isModelLoading && styles.modelSelectIconSpinning
                ]}
              />
            </View>
          );
        }
        return null;

      default:
        return null;
    }
  };

  const renderFields = () => {
    if (!tool.configFields) return null;

    // Grouper les champs par paires
    const pairs = [];
    for (let i = 0; i < tool.configFields.length; i += 2) {
      pairs.push(tool.configFields.slice(i, i + 2));
    }

    return pairs.map((pair, index) => (
      <View key={index} style={styles.configRow}>
        {pair.map((field) => (
          <View key={field.name} style={styles.configColumn}>
            <Text style={[styles.configLabel, { color: theme.colors.text }]}>
              {field.label}
            </Text>
            {renderField(field)}
          </View>
        ))}
      </View>
    ));
  };

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognition.current = new SpeechRecognition();
        speechRecognition.current.continuous = false;
        speechRecognition.current.interimResults = false;
        speechRecognition.current.lang = 'fr-FR';

        speechRecognition.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          // Envoyer automatiquement le message après la reconnaissance
          setTimeout(() => handleSend(), 100);
        };

        speechRecognition.current.onerror = (event) => {
          console.error('Erreur de reconnaissance vocale:', event.error);
          setIsListening(false);
        };

        speechRecognition.current.onend = () => {
          setIsListening(false);
        };
      }
    } else {
      // React Native Voice
      Voice.onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value) {
          setInput(e.value[0]);
          // Envoyer automatiquement le message après la reconnaissance
          setTimeout(() => handleSend(), 100);
        }
        setIsListening(false);
      };

      Voice.onSpeechError = (e) => {
        console.error('Erreur de reconnaissance vocale:', e);
        setIsListening(false);
      };

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      };
    }
  }, []);

  const startVoiceRecognition = async () => {
    try {
      setIsListening(true);
      if (Platform.OS === 'web') {
        if (speechRecognition.current) {
          speechRecognition.current.start();
        }
      } else {
        await Voice.start('fr-FR');
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de la reconnaissance vocale:', error);
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      if (Platform.OS === 'web') {
        if (speechRecognition.current) {
          speechRecognition.current.stop();
        }
      } else {
        await Voice.stop();
      }
      setIsListening(false);
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de la reconnaissance vocale:', error);
    }
  };

  if (!tool.configFields && !hasPromptInput && !hasFileUpload && !hasUrlInput) {
    return null;
  }

  return (
    <View style={[styles.toolConfigContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.toolConfigContent}>
        {tool.configFields && tool.configFields.length > 0 && (
          <View style={styles.configFields}>
            {renderFields()}
          </View>
        )}

        <View style={styles.inputBarWrapper}>
          {(hasFileUpload || hasUrlInput) && (
            <View style={styles.uploadContainer}>
              {hasFileUpload && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept={tool.features?.fileUpload?.accept?.join(',')}
                    multiple={tool.features?.fileUpload?.multiple}
                  />
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={handleFileUploadClick}
                  >
                    <Ionicons 
                      name="cloud-upload" 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  </TouchableOpacity>
                </>
              )}
              {hasUrlInput && (
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={handleUrlInput}
                >
                  <Ionicons 
                    name="link" 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {hasPromptInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, isGenerating && styles.inputDisabled]}
                value={input}
                onChangeText={setInput}
                placeholder={tool.features?.promptInput?.placeholder || "Tapez votre message..."}
                placeholderTextColor={theme.colors.text}
                multiline={tool.features?.promptInput?.multiline}
                editable={!isGenerating}
              />
              <TouchableOpacity 
                style={[
                  styles.voiceButton,
                  isListening && styles.voiceButtonActive
                ]}
                onPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
                disabled={isGenerating}
              >
                <Ionicons 
                  name={isListening ? "mic" : "mic-outline"} 
                  size={24} 
                  color={isGenerating ? "#999" : theme.colors.primary}
                />
              </TouchableOpacity>

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
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ToolConfigComponent; 