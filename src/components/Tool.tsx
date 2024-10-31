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

  // Si l'outil n'est pas encore chargé, on ne rend rien
  if (!tool) return null;

  return (
    <View style={styles.toolContainer}>
      <ToolConfigComponent
        tool={tool}
        config={toolConfig}
        onConfigChange={updateToolConfig}
      />
    </View>
  );
}; 