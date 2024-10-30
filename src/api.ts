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