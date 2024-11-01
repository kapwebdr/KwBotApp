import { useState } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress?: number;
  status?: string;
}

export const useLoading = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
  });

  const startLoading = (initialStatus?: string,progress?: number) => {
    setLoadingState({
      isLoading: true,
      progress: progress,
      status: initialStatus,
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