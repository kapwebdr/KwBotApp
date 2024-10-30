import React from 'react';
import { View, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { createStyles, webSelectStyle } from '../styles/theme.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ChatControlsProps {
  systemMessage: string;
  updateSystemMessage: (message: string) => void;
  selectedModel: string;
  availableModels: string[];
  isModelLoading: boolean;
  onModelChange: (modelName: string) => void;
}

export const ChatControls: React.FC<ChatControlsProps> = ({
  systemMessage,
  updateSystemMessage,
  selectedModel,
  availableModels,
  isModelLoading,
  onModelChange,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

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
          onChange={(e) => onModelChange(e.target.value)}
          style={webSelectStyle(theme, isModelLoading)}
          disabled={isModelLoading}
        >
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        <Ionicons 
          name={isModelLoading ? "reload" : "chevron-down"} 
          size={16} 
          color={theme.colors.text}
          style={styles.modelSelectIcon}
        />
      </View>
    </View>
  );
};

export default ChatControls; 