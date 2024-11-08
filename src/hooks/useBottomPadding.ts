import { useTool } from './useTool';

export const useBottomPadding = () => {
  const { toolHeight } = useTool();
  return ( toolHeight || 0) + 55;
};
