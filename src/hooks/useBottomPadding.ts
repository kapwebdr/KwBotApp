import { useTool } from './useTool';

export const useBottomPadding = () => {
  const { toolConfig } = useTool();
  return (toolConfig?.height || 0) + 55;
}; 