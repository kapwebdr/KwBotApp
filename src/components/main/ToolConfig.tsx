import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Tool, ToolConfig  } from '../../types/tools';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { Ionicons } from '@expo/vector-icons';
import { useTool } from '../../hooks/useTool';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import FileUploadConfig from '../form/FileUploadConfig';
import { useLoading } from '../../hooks/useLoading';
import AudioRecorder from '../main/AudioRecorder';
import { useConversation } from '../../contexts/ConversationContext';
import { FormInput } from '../form/FormInput';
import { FormSelect } from '../form/FormSelect';

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
  const { isLoading } = useConversation();
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
    if (isLoading) return;

    if (pendingFiles && pendingFiles.length > 0) {
      const processFiles = pendingFiles.map(async (pendingFile) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const base64 = e.target?.result as string;
              await handleToolAction('upload', {
                base64,
                name: pendingFile.name,
                type: pendingFile.file.type,
              });
              resolve(true);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(pendingFile.file);
        });
      });

      try {
        await Promise.all(processFiles);
        clearPendingFiles();
      } catch (error) {
        console.error('Erreur lors du traitement des fichiers:', error);
      }
    } else if (input.trim()) {
      handleToolAction('send');
    }
  };

  const handleStop = () => {
    handleToolAction('stop');
  };

  const renderField = (field: any) => {
    const hasError = toolStates[currentTool]?.errors?.[field.name];

    switch (field.type) {
      case 'text':
        return (
          <FormInput
            label={field.label}
            value={config[field.name] || (field.defaultValue || '')}
            onChangeText={(value) => handleConfigChange(field.name, value)}
            placeholder={field.placeholder || field.label}
            required={field.required}
            error={hasError ? toolStates[currentTool].errors[field.name] : undefined}
          />
        );

      case 'select':
        const selectConfig = selectConfigs[field.name];
        if (selectConfig) {
          return (
            <FormSelect
              label={field.label}
              value={selectConfig.value}
              onValueChange={selectConfig.onChange}
              options={selectConfig.options}
              required={field.required}
              error={hasError ? toolStates[currentTool].errors[field.name] : undefined}
              disabled={selectConfig.isLoading || loading.isLoading}
              loading={selectConfig.isLoading}
              placeholder="Sélectionnez un modèle"
            />
          );
        }
        return null;

      case 'number':
        return (
          <FormInput
            label={field.label}
            value={config[field.name]?.toString() || field.defaultValue?.toString() || ''}
            onChangeText={(value) => {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                handleConfigChange(field.name, numValue);
              }
            }}
            keyboardType="numeric"
            placeholder={field.placeholder || field.label}
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

    const pairs = [];
    for (let i = 0; i < tool.configFields.length; i += 2) {
      pairs.push(tool.configFields.slice(i, i + 2));
    }

    return pairs.map((pair, index) => (
      <View key={index} style={styles.formRow}>
        {pair.map((field) => (
          <View key={field.name} style={styles.formColumn}>
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

  const handleFileSelect = (files: File[]) => {
    files.forEach(file => {
      addPendingFile({ name: file.name, file });
    });
  };

  if (!tool.configFields && !hasPromptInput && !hasFileUpload && !hasUrlInput) {
    return null;
  }
  return (
    <View style={[styles.toolContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.formSection}>
        {tool.configFields && tool.configFields.length > 0 && renderFields()}

        <View style={styles.formInputBarWrapper}>
          <View style={styles.formPromptInputContainer}>
            <FileUploadConfig
              tool={tool}
              onFileSelect={handleFileSelect}
              pendingFiles={pendingFiles}
              onClearFiles={clearPendingFiles}
              onClearFile={clearPendingFiles}
            />
            {hasPromptInput && (
              <>
                <FormInput
                  style={styles.formInput}
                  value={input}
                  onChangeText={setInput}
                  placeholder={tool.features?.promptInput?.placeholder || "Tapez votre message..."}
                  multiline={tool.features?.promptInput?.multiline}
                  editable={!isGenerating}
                  icon={isListening ? "mic" : "mic-outline"}
                  iconColor={isGenerating ? theme.colors.gray400 : theme.colors.primary}
                  onIconPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  disabled={isGenerating}
                />
              </>
            )}
            <TouchableOpacity 
              style={[
                styles.sendButton,
                isGenerating ? styles.stopButton : (!input.trim() && !pendingFiles || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={isGenerating ? handleStop : handleSend}
              disabled={!isGenerating && (!input.trim() && !pendingFiles || isLoading)}
            >
              <Ionicons 
                name={isGenerating ? "stop" : "send"}
                size={styles.buttonIcon.size}
                color={isGenerating ? "red" : (!input.trim() && !pendingFiles || isLoading) ? theme.colors.gray400 : theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ToolConfigComponent; 