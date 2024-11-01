import { ApiConfig, ToolType, TOOLS } from '../types';
import { sessionStorage } from './storage';

export class ApiHandler {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async executeToolAction(
    toolId: ToolType,
    actionType: string,
    params: any,
    onProgress?: (progress: number) => void,
    onComplete?: (result: any) => void
  ) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) throw new Error(`Tool ${toolId} not found`);

    const action = tool.actions?.find(a => a.type === actionType);
    if (!action?.api) throw new Error(`No API config found for action ${actionType} in tool ${toolId}`);

    try {
      const response = await fetch(`${this.baseUrl}${action.api.endpoint}`, {
        method: action.api.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionId ? { 'x-session-id': this.sessionId } : {})
        },
        body: action.api.requestTransform ? 
          JSON.stringify(action.api.requestTransform(params)) : 
          JSON.stringify(params)
      });

      const newSessionId = response.headers.get('x-session-id');
      if (newSessionId) {
        this.sessionId = newSessionId;
        await sessionStorage.save(newSessionId);
      }

      if (action.api.streaming) {
        return this.handleStreamResponse(response, action.api, onProgress, onComplete);
      }

      const data = await response.json();
      return action.api.responseTransform ? action.api.responseTransform(data) : data;
    } catch (error) {
      console.error(`API error for ${toolId}/${actionType}:`, error);
      throw error;
    }
  }

  private async handleStreamResponse(
    response: Response,
    config: ApiConfig,
    onProgress?: (progress: number) => void,
    onComplete?: (result: any) => void
  ) {
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
          const chunk = line.slice(6);
          const processedChunk = config.streamProcessor ? config.streamProcessor(chunk) : chunk;
          
          if (!processedChunk) continue;

          try {
            const data = JSON.parse(processedChunk.replace(/'/g, '"'));
            
            if (data.progress !== undefined && onProgress && config.progressEvent) {
              onProgress(data.progress);
            }

            if (data.status === config.completedEvent && onComplete) {
              onComplete(data);
              return true;
            }

            if (onComplete) {
              onComplete(processedChunk);
            }
          } catch (error) {
            // Si le chunk n'est pas du JSON valide, on le traite comme une chaîne simple
            if (onComplete) {
              onComplete(processedChunk);
            }
          }
        }
      }
    }

    return false;
  }
}

export const api = new ApiHandler(process.env.BASE_API_URL || '');