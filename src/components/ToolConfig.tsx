import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Tool, ToolConfig as IToolConfig } from '../types';
import { useTheme } from '../ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { webSelectStyles } from '../styles/webStyles';

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
  const theme = useTheme();
  const styles = createStyles(theme);

  const handleConfigChange = (name: string, value: any) => {
    onConfigChange({
      ...config,
      [name]: value,
    });
  };

  if (!tool.configFields) return null;

  return (
    <View style={styles.toolConfigContainer}>
      {tool.configFields.map((field) => (
        <View key={field.name} style={styles.configField}>
          <Text style={styles.configLabel}>{field.label}</Text>
          {field.type === 'text' && (
            <TextInput
              style={styles.configInput}
              value={config[field.name] as string}
              onChangeText={(value) => handleConfigChange(field.name, value)}
              placeholder={field.label}
              placeholderTextColor={theme.colors.text}
            />
          )}
          {field.type === 'number' && (
            <View style={styles.numberInputContainer}>
              <TextInput
                style={styles.configInput}
                value={String(config[field.name])}
                onChangeText={(value) => {
                  const num = parseFloat(value);
                  if (!isNaN(num)) {
                    handleConfigChange(field.name, num);
                  }
                }}
                keyboardType="numeric"
                placeholder={field.label}
                placeholderTextColor={theme.colors.text}
              />
              <View style={styles.numberControls}>
                <TouchableOpacity
                  onPress={() => {
                    const current = config[field.name] as number;
                    if (field.min === undefined || current > field.min) {
                      handleConfigChange(field.name, current - (field.step || 1));
                    }
                  }}
                  style={styles.numberButton}
                >
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const current = config[field.name] as number;
                    if (field.max === undefined || current < field.max) {
                      handleConfigChange(field.name, current + (field.step || 1));
                    }
                  }}
                  style={styles.numberButton}
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {field.type === 'select' && field.options && (
            <select
              value={config[field.name] as string}
              onChange={(e) => handleConfigChange(field.name, e.target.value)}
              style={webSelectStyles.select as React.CSSProperties}
            >
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
          {field.type === 'multiselect' && field.options && (
            <View style={styles.multiSelectContainer}>
              {field.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.multiSelectOption,
                    (config[field.name] as string[])?.includes(option) && 
                    styles.multiSelectOptionSelected
                  ]}
                  onPress={() => {
                    const current = (config[field.name] as string[]) || [];
                    const newValue = current.includes(option)
                      ? current.filter(v => v !== option)
                      : [...current, option];
                    handleConfigChange(field.name, newValue);
                  }}
                >
                  <Text style={styles.multiSelectOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default ToolConfigComponent; 