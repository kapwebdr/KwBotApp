import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { TOOLS } from '../types';
import { useTool } from '../hooks/useTool';
import { useStyles } from '../hooks/useStyles';

export const ToolBar: React.FC = () => {
  const { theme } = useTheme();
  const { currentTool, setCurrentTool, isToolMenuOpen, setIsToolMenuOpen } = useTool();
  const styles = useStyles(currentTool);
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
}; 