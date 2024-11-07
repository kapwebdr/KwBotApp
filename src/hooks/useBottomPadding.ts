import { useTool } from './useTool';

export const useBottomPadding = () => {
  const { toolHeight } = useTool();
  return toolHeight + 80; // Ajustez 80 si nécessaire
}; 