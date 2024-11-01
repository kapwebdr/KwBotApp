import { useState } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress?: number;
  status?: string;
  type?: 'model' | 'generation' | 'upload';
}

export const useLoading = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
  });

  const startLoading = (type: LoadingState['type'], initialStatus?: string) => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      status: initialStatus,
      type,
    });
  };

  const updateProgress = (progress: number, status?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress,
      ...(status && { status }),
    }));
  };

  const stopLoading = () => {
    setLoadingState({
      isLoading: false,
    });
  };

  return {
    ...loadingState,
    startLoading,
    updateProgress,
    stopLoading,
  };
}; 