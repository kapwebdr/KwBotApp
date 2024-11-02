import React, { useRef, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { ToolConfigComponent } from './ToolConfig';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';

export const Tool: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { tool, toolStates, updateToolConfig, setToolHeight } = useTool();
  const toolRef = useRef<View>(null);

  const updateHeight = useCallback(() => {
    if (toolRef.current) {
      // @ts-ignore - getBoundingClientRect existe sur web
      const height = toolRef.current.getBoundingClientRect?.().height || 0;
      setToolHeight(height);
    }
  }, [setToolHeight]);

  useEffect(() => {
    updateHeight();
    // Observer les changements de taille
    const resizeObserver = new ResizeObserver(updateHeight);
    if (toolRef.current) {
      // @ts-ignore
      resizeObserver.observe(toolRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [updateHeight]);

  if (!tool) return null;
  const toolConfig = toolStates[tool.id]?.config;

  return (
    <View 
      ref={toolRef}
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
      onLayout={updateHeight}
    >
      <ToolConfigComponent
        tool={tool}
        config={toolConfig}
        onConfigChange={updateToolConfig}
      />
    </View>
  );
}; 