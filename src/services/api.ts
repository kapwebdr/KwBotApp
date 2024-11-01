import { sessionStorage } from './storage';

interface ModelResponse {
  models: string[];
}

let currentSessionId: string | null = null;

const updateSessionId = async (newSessionId: string) => {
  if (newSessionId !== currentSessionId) {
    currentSessionId = newSessionId;
    await sessionStorage.save(newSessionId);
  }
};

export const loadSessionId = async (): Promise<string | null> => {
  currentSessionId = await sessionStorage.load();
  return currentSessionId;
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

export const getImageModels = async (): Promise<{ id: string; name: string; type: string }[]> => {
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
    
    const data: ImageModelsResponse = await response.json();
    
    // Transformer l'objet en tableau avec id, name et type
    return Object.entries(data.models).map(([id, info]) => ({
      id,
      name: info.name,
      type: info.type
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles d\'image:', error);
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
