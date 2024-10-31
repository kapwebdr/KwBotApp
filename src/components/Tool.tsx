import React from 'react';
import { View } from 'react-native';
import { ToolConfigComponent } from './ToolConfig';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';

export const Tool: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { tool, toolConfig, updateToolConfig } = useTool();

  if (!tool) return null;

  return (
    <View style={[
      styles.toolContainer,
      {
        position: 'absolute',
        bottom: 70, // Hauteur de la bottom bar
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      }
    ]}>
      <ToolConfigComponent
        tool={tool}
        config={toolConfig}
        onConfigChange={updateToolConfig}
      />
    </View>
  );
}; 