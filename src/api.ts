import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ModelResponse {
  models: string[];
}

interface LoadModelEvent {
  progress?: number;
  status?: string;
  error?: string;
}

interface ImageGenerationRequest {
  model_type: string;
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
}

interface ImageAnalyzeRequest {
  image: string;
  labels: string[];
}

interface ImageOCRRequest {
  image: string;
}

interface ImageRefineRequest {
  image: string;
  prompt: string;
  negative_prompt?: string;
  strength?: number;
  steps?: number;
}

let currentSessionId: string | null = null;

const updateSessionId = async (newSessionId: string) => {
  if (newSessionId !== currentSessionId) {
    currentSessionId = newSessionId;
    try {
      await AsyncStorage.setItem('session_id', newSessionId);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du session ID:', error);
    }
  }
};

export const loadSessionId = async (): Promise<string | null> => {
  try {
    const savedSessionId = await AsyncStorage.getItem('session_id');
    currentSessionId = savedSessionId;
    return savedSessionId;
  } catch (error) {
    console.error('Erreur lors du chargement du session ID:', error);
    return null;
  }
};

export const getAvailableModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/models`, {
      headers: currentSessionId ? {
        'x-session-id': currentSessionId
      } : {}
    });
    
    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }
    
    const data: ModelResponse = await response.json();
    return data.models;
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles:', error);
    return [];
  }
};

export const getImageModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/images/models`, {
      headers: currentSessionId ? {
        'x-session-id': currentSessionId
      } : {}
    });
    
    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }
    
    const data = await response.json();
    return data.models;
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles d\'image:', error);
    return [];
  }
};

export const generateImage = async (
  params: ImageGenerationRequest,
  onProgress?: (progress: number) => void,
  onComplete?: (imageBase64: string) => void
) => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentSessionId ? { 'x-session-id': currentSessionId } : {})
      },
      body: JSON.stringify(params)
    });

    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }

    const reader = response.body?.getReader();
    if (!reader) return false;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).replace(/'/g, '"');
          try {
            const event = JSON.parse(jsonStr);
            
            if (event.progress !== undefined && onProgress) {
              onProgress(event.progress);
            }
            
            if (event.status === 'completed' && event.image && onComplete) {
              onComplete(event.image);
              return true;
            }

            if (event.error) {
              console.error('Erreur lors de la génération de l\'image:', event.error);
              return false;
            }
          } catch (e) {
            console.error('Erreur lors du parsing du JSON:', e);
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image:', error);
    return false;
  }
};

// Fonction utilitaire pour parser les lignes SSE
const parseSSELine = (line: string): any | null => {
  if (line.startsWith('data: ')) {
    try {
      const jsonStr = line.slice(6).replace(/'/g, '"');
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Erreur lors du parsing du JSON:', e, 'Data reçue:', line);
      return null;
    }
  }
  return null;
};

// Fonction utilitaire pour gérer les streams SSE
const handleSSEStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onData: (data: any) => void
) => {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const data = parseSSELine(line);
      if (data) {
        onData(data);
      }
    }
  }
};

export const loadModel = async (
  modelName: string, 
  onProgress?: (progress: number) => void,
  onStatus?: (status: string) => void
): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/models/${modelName}/load`, {
      method: 'POST',
      headers: currentSessionId ? {
        'x-session-id': currentSessionId
      } : {}
    });

    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }

    const reader = response.body?.getReader();
    if (!reader) return false;

    let success = false;
    await handleSSEStream(reader, (data) => {
      if (data.progress !== undefined && onProgress) {
        onProgress(data.progress);
      }
      
      if (data.status) {
        if (onStatus) onStatus(data.status);
        if (data.status === 'loaded') {
          success = true;
        }
      }

      if (data.error) {
        console.error('Erreur lors du chargement du modèle:', data.error);
        success = false;
      }
    });

    return success;
  } catch (error) {
    console.error('Erreur lors du chargement du modèle:', error);
    return false;
  }
};

export const streamChatCompletion = async (
  modelName: string,
  messages: Message[],
  systemMessage?: string,
  onChunk?: (chunk: string) => void
) => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentSessionId ? { 'x-session-id': currentSessionId } : {})
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        stream: true,
        system: systemMessage,
      }),
    });

    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6); // Enlever le préfixe "data: "
          if (content === '[DONE]') break;
          if (onChunk) onChunk(content);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du streaming:', error);
    throw error;
  }
};

export const stopGeneration = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentSessionId ? { 'x-session-id': currentSessionId } : {})
      }
    });

    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }

    return response.ok;
  } catch (error) {
    console.error('Erreur lors de l\'arrêt de la génération:', error);
    return false;
  }
};

export const analyzeImage = async (
  params: ImageAnalyzeRequest,
): Promise<{ logits: number[][], probabilities: number[][] }> => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/images/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentSessionId ? { 'x-session-id': currentSessionId } : {})
      },
      body: JSON.stringify(params)
    });

    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    throw error;
  }
};

export const extractTextFromImage = async (
  params: ImageOCRRequest,
): Promise<{ text: string }> => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/images/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentSessionId ? { 'x-session-id': currentSessionId } : {})
      },
      body: JSON.stringify(params)
    });

    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'extraction du texte:', error);
    throw error;
  }
};

export const refineImage = async (
  params: ImageRefineRequest,
  onProgress?: (progress: number) => void,
  onComplete?: (imageBase64: string) => void
): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.BASE_API_URL}/images/refine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentSessionId ? { 'x-session-id': currentSessionId } : {})
      },
      body: JSON.stringify(params)
    });

    const newSessionId = response.headers.get('x-session-id');
    if (newSessionId) {
      await updateSessionId(newSessionId);
    }

    const reader = response.body?.getReader();
    if (!reader) return false;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).replace(/'/g, '"');
          try {
            const event = JSON.parse(jsonStr);
            
            if (event.progress !== undefined && onProgress) {
              onProgress(event.progress);
            }
            
            if (event.status === 'completed' && event.image && onComplete) {
              onComplete(event.image);
              return true;
            }

            if (event.error) {
              console.error('Erreur lors du raffinement de l\'image:', event.error);
              return false;
            }
          } catch (e) {
            console.error('Erreur lors du parsing du JSON:', e);
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Erreur lors du raffinement de l\'image:', error);
    return false;
  }
};