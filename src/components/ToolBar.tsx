import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { Tool, ToolType } from '../types';
import { createStyles } from '../styles/theme.styles';

interface ToolBarProps {
  currentTool: ToolType;
  isToolMenuOpen: boolean;
  setIsToolMenuOpen: (isOpen: boolean) => void;
  setCurrentTool: (tool: ToolType) => void;
  tools: Tool[];
}

export const ToolBar: React.FC<ToolBarProps> = ({
  currentTool,
  isToolMenuOpen,
  setIsToolMenuOpen,
  setCurrentTool,
  tools,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
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
            name={tools.find(t => t.id === currentTool)?.icon || 'apps'} 
            size={20} 
            color={theme.colors.text} 
          />
          <Text style={styles.toolDropdownText}>
            {tools.find(t => t.id === currentTool)?.label || 'Sélectionner un outil'}
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
          {tools.map((tool) => (
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
}; 