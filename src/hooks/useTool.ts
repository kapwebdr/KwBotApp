import { useContext } from 'react';
import { ToolContext } from '../contexts/ToolContext';
import { TOOLS } from '../types/tools';

export const useTool = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool must be used within a ToolProvider');
  }
  const currentToolConfig = TOOLS.find(tool => tool.id === context.currentTool);
  return {
    ...context,
    tool: currentToolConfig,
    getToolFeatures: () => currentToolConfig?.features || {},
    isFeatureEnabled: (feature: string) => {
      return !!currentToolConfig?.features?.[feature];
    },
  };
};
