import React, {  useCallback } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { ToolConfigComponent } from './ToolConfig';
import { createStyles } from '../../styles/theme.styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useTool } from '../../hooks/useTool';

export const Tool: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { tool, toolStates, updateToolConfig, setToolHeight } = useTool();

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setToolHeight(height);
  }, [setToolHeight]);

  if (!tool) return null;
  const toolConfig = toolStates[tool.id]?.config;

  return (
    <View 
      style={[
        styles.toolContainer,
        {
          position: 'absolute',
          bottom: 70,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }
      ]}
      onLayout={handleLayout}
    >
      <ToolConfigComponent
        tool={tool}
        config={toolConfig}
        onConfigChange={updateToolConfig}
      />
    </View>
  );
};
