import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { ToolType, TOOLS } from '../types';
import { createStyles } from '../styles/theme.styles';
import { ToolConfigComponent } from './ToolConfig';

interface ToolOptionsBarProps {
  currentTool: ToolType;
  config: any;
  onConfigChange: (config: any) => void;
}

export const ToolOptionsBar: React.FC<ToolOptionsBarProps> = ({
  currentTool,
  config,
  onConfigChange,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme, currentTool);
  const currentToolConfig = TOOLS.find(tool => tool.id === currentTool);

  if (!currentToolConfig?.configFields) return null;

  return (
    <View style={styles.toolOptionsBar}>
      <ToolConfigComponent
        tool={currentToolConfig}
        config={config}
        onConfigChange={onConfigChange}
      />
    </View>
  );
};

export default ToolOptionsBar; 