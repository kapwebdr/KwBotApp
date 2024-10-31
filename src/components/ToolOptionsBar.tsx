import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { ToolConfigComponent } from './ToolConfig';
import { useTool } from '../hooks/useTool';

export const ToolOptionsBar: React.FC = () => {
  const { theme } = useTheme();
  const { tool, toolConfig, updateToolConfig } = useTool();
  const styles = createStyles(theme);

  if (!tool?.configFields) return null;

  return (
    <View style={styles.toolOptionsBar}>
      <ToolConfigComponent
        tool={tool}
        config={toolConfig}
        onConfigChange={updateToolConfig}
      />
    </View>
  );
}; 