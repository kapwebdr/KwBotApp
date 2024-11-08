import { ApiEndpoint, ActionType } from '../types/api';
import { ToolType, TOOLS } from '../types/tools';
import { sessionStorage } from './storage';
import { notificationService } from './notificationService';

class ApiHandler {
  private static instance: ApiHandler | null = null;
  private baseUrl: string;
  private sessionId: string | null = null;

  private constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadSessionId();
  }

  public static getInstance(): ApiHandler {
    if (!ApiHandler.instance) {
      ApiHandler.instance = new ApiHandler(process.env.BASE_API_URL || '');
    }
    return ApiHandler.instance;
  }

  private async loadSessionId(): Promise<void> {
    this.sessionId = await sessionStorage.load();
  }

  private async updateSessionId(newSessionId: string): Promise<void> {
    if (newSessionId !== this.sessionId) {
      this.sessionId = newSessionId;
      await sessionStorage.save(newSessionId);
    }
  }

  async executeApiAction(
    toolId: ToolType,
    actionType: ActionType,
    params?: any,
    onProgress?: (progress: number) => void,
    onChunk?: (chunk: any, params?: any) => void,
    onComplete?: (result: any, params?: any) => void
  ) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) {
      notificationService.notify('error', `Outil ${toolId} non trouvé`, true);
      return null;
    }

    let endpoint: ApiEndpoint | undefined;

    const toolAction = tool.actions?.find(a => a.type === actionType);
    if (toolAction) {
      endpoint = toolAction.api;
    } else {
      endpoint = tool.api?.[actionType as 'init' | 'load'];
    }

    if (!endpoint) {
      notificationService.notify('error', `No endpoint found for action ${actionType} in tool ${toolId}`, true);
      return null;
    }

    try {
      let path = endpoint.path;
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          path = path.replace(`{${key}}`, value as string);
        });
      }
      // Transformer les paramètres si nécessaire
      params = endpoint.requestTransform ? 
        { ...params, ...endpoint.requestTransform(params) } : 
        params;
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url, {
        method: endpoint.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionId ? { 'x-session-id': this.sessionId } : {}),
          ...endpoint.headers,
        },
        ...(params && {
          body: JSON.stringify(params),
        }),
      }).catch(error => {
        console.error(`Fetch error for ${toolId}/${actionType}:`, error);
        return null;
      });

      if (!response) {return null;}

      const newSessionId = response.headers.get('x-session-id');
      if (newSessionId) {
        await this.updateSessionId(newSessionId).catch(console.error);
      }

      if (endpoint.streaming) {
        return this.handleStreamResponse(
          response,
          endpoint,
          params,
          onProgress,
          onChunk ? (chunk: any) => onChunk(chunk, params) : undefined,
          onComplete ? (result: any) => onComplete(result, params) : undefined,
        ).catch(error => {
          console.error('Stream handling error:', error);
          return null;
        });
      }

      const data = await response.json().catch(error => {
        console.error('JSON parsing error:', error);
        return null;
      });

      if (!data) {return null;}

      const result = endpoint.responseTransform ? endpoint.responseTransform(data,params) : data;

      if (onComplete) {
        onComplete(result, params);
      }

      return result;
    } catch (error) {
      notificationService.notify(
        'error',
        `Erreur API pour ${toolId}/${actionType}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        true
      );
      return null;
    }
  }

  private async handleStreamResponse(
    response: Response,
    endpoint: ApiEndpoint,
    params?: any,
    onProgress?: (progress: number) => void,
    onChunk?: (chunk: any, params?: any) => void,
    onComplete?: (result: any, params?: any) => void,
  ) {
    const reader = response.body?.getReader();
    if (!reader) {return false;}
    const decoder = new TextDecoder();
    let buffer = '';
    let textBuffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {break;}

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const chunk = line.slice(6);
                    try {
                        // Essayer de parser en JSON
                        const data = JSON.parse(chunk);
                        if (data.status === 'completed' && onComplete) {
                          const result = endpoint.responseTransform ?
                              endpoint.responseTransform(data,params) : data;
                          onComplete(result, params);
                      }
                      else if (data.progress !== undefined && onProgress) {
                            onProgress(data.progress);
                        } else if (onChunk) {
                            const result = endpoint.streamProcessor ?
                                endpoint.streamProcessor(data,params) : data;
                            onChunk(result, params);
                        }
                    } catch {
                        // Si ce n'est pas du JSON, traiter le texte
                        if (chunk.includes('\\n')) {
                            // Remplacer les \n littéraux par de vrais retours à la ligne
                            const processedChunk = chunk.replace(/\\n/g, '\n');
                            if (onChunk) {
                                onChunk(processedChunk, params);
                            }
                        } else {
                            // Ajouter le chunk au buffer
                            textBuffer += chunk;
                            if (onChunk) {
                                onChunk(chunk, params);
                            }
                        }
                    }
                }
            }
        }
        // Envoyer le reste du buffer si nécessaire
        if (textBuffer && onChunk) {
            onChunk(textBuffer, params);
        }
    } finally {
        reader.releaseLock();
    }

    return true;
  }

  async executeRequest<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    headers?: Record<string, string>
  ): Promise<T | null> {
    try {
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionId ? { 'x-session-id': this.sessionId } : {}),
          ...headers,
        },
        ...(body && { body: JSON.stringify(body) }),
      }).catch(error => {
        console.error(`Fetch error for ${method} ${path}:`, error);
        return null;
      });

      if (!response) {return null;}

      const newSessionId = response.headers.get('x-session-id');
      if (newSessionId) {
        await this.updateSessionId(newSessionId).catch(console.error);
      }

      const data = await response.json().catch(error => {
        console.error('JSON parsing error:', error);
        return null;
      });

      return data as T;
    } catch (error) {
      notificationService.notify(
        'error',
        `Erreur de requête API (${method} ${path}): ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        true
      );
      return null;
    }
  }
}

// Exporter directement l'instance unique
export const apiHandler = ApiHandler.getInstance();
