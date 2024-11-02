import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Tool, ToolConfig  } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles, getSelectStyle } from '../styles/theme.styles';
import { Ionicons } from '@expo/vector-icons';
import { useTool } from '../hooks/useTool';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import FileUploadConfig from './FileUploadConfig';
import { useLoading } from '../hooks/useLoading';
import AudioRecorder from './AudioRecorder';

interface ToolConfigComponentProps {
  tool: Tool;
  config: ToolConfig;
  onConfigChange: (config: ToolConfig) => void;
}

export const ToolConfigComponent: React.FC<ToolConfigComponentProps> = ({
  tool,
  config,
  onConfigChange,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { 
    toolStates,
    currentTool,
    selectConfigs,
    setInput,
    isGenerating,
    handleToolAction,
    addPendingFile,
    clearPendingFiles
    } = useTool();
  const loading = useLoading();
  const [isListening, setIsListening] = useState(false);
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const currentState = toolStates[currentTool];
  const pendingFiles = currentState?.pendingFiles || [];
  const input = currentState?.input || '';
  const handleConfigChange = (name: string, value: any) => {
    onConfigChange({
      ...config,
      [name]: value,
    });
  };

  const hasPromptInput = !!tool.features?.promptInput;
  const hasFileUpload = !!tool.features?.fileUpload;
  const hasUrlInput = !!tool.features?.urlInput;

  const handleSend = async () => {
    if (pendingFiles && pendingFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await handleToolAction('upload', {
          base64,
          name: pendingFiles[0].name,
          type: pendingFiles[0].file.type
        });
        clearPendingFiles();
      };
      reader.readAsDataURL(pendingFiles[0].file);
    } else if (input.trim()) {
      handleToolAction('send');
    }
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
            value={config[field.name] || (field.defaultValue || '')}
            onChangeText={(value) => handleConfigChange(field.name, value)}
            placeholder={field.placeholder || field.label}
            placeholderTextColor={theme.colors.text}
          />
        );

      case 'select':
        const selectConfig = selectConfigs[field.name];
        if (selectConfig) {
          return (
            <View style={styles.selectContainer}>
              <select
                value={selectConfig.value}
                onChange={(e) => {
                  selectConfig.onChange(e.target.value);
                }}
                style={getSelectStyle({ theme }, selectConfig.isLoading)}
                disabled={selectConfig.isLoading || loading.isLoading}
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
              <Ionicons 
                name={loading.isLoading ? "reload" : "chevron-down"} 
                size={16} 
                color={theme.colors.text}
                style={[
                  styles.selectIcon
                ]}
              />
            </View>
          );
        }
        return null;

      case 'number':
        return (
          <TextInput
            style={styles.textInput}
            value={config[field.name] || (field.defaultValue || '')}
            onChangeText={(value) => {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                //if (field.min !== undefined && numValue < field.min) return;
                //if (field.max !== undefined && numValue > field.max) return;
                handleConfigChange(field.name, numValue);
              }
            }}
            keyboardType="numeric"
            placeholder={field.placeholder || field.label}
            placeholderTextColor={theme.colors.text}
          />
        );

      case 'micro':
        return (
          <AudioRecorder
            onRecordingComplete={(audioBlob) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Audio = reader.result as string;
                handleConfigChange(field.name, base64Audio);
              };
              reader.readAsDataURL(audioBlob);
            }}
            isDisabled={isGenerating}
          />
        );

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

  const handleFileSelect = (file: File) => {
    addPendingFile({ name: file.name, file });
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
          <View style={styles.inputContainer}>
            <FileUploadConfig
              tool={tool}
              onFileSelect={handleFileSelect}
              pendingFiles={pendingFiles}
              onClearFiles={clearPendingFiles}
            />
            {hasPromptInput && (
              <>
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
                    size={styles.buttonIcon.size}
                    color={isGenerating ? theme.colors.gray400 : theme.colors.primary}
                  />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity 
              style={[
                styles.sendButton,
                isGenerating ? styles.stopButton : (!input.trim() && !pendingFiles) && styles.sendButtonDisabled
              ]}
              onPress={isGenerating ? handleStop : handleSend}
              disabled={!isGenerating && (!input.trim() && !pendingFiles)}
            >
              <Ionicons 
                name={isGenerating ? "stop" : "send"}
                size={styles.buttonIcon.size}
                color={isGenerating ? "red" : (!input.trim() && !pendingFiles) ? theme.colors.gray400 : theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ToolConfigComponent; 