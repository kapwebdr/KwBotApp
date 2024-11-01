import { ToolType, TOOLS, ApiEndpoint, ActionType } from '../types';
import { sessionStorage } from './storage';

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
    onComplete?: (result: any) => void
  ) {
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) throw new Error(`Tool ${toolId} not found`);

    let endpoint: ApiEndpoint | undefined;
    
    const toolAction = tool.actions?.find(a => a.type === actionType);
    if (toolAction) {
      endpoint = toolAction.api;
    } else {
      endpoint = tool.api?.[actionType as 'init' | 'load'];
    }

    if (!endpoint) throw new Error(`No endpoint found for action ${actionType} in tool ${toolId}`);

    let path = endpoint.path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`{${key}}`, value as string);
      });
    }

    try {
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url, {
        method: endpoint.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionId ? { 'x-session-id': this.sessionId } : {}),
          ...endpoint.headers
        },
        ...(params && {
          body: endpoint.requestTransform ? 
            JSON.stringify(endpoint.requestTransform(params)) : 
            JSON.stringify(params)
        })
      });
      
      const newSessionId = response.headers.get('x-session-id');
      if (newSessionId) {
        await this.updateSessionId(newSessionId);
      }

      if (endpoint.streaming) {
        return this.handleStreamResponse(response, endpoint, onProgress, onComplete);
      }

      const data = await response.json();
      const result = endpoint.responseTransform ? endpoint.responseTransform(data) : data;
      
      if (onComplete) {
        onComplete(result);
      }
      
      return result;
    } catch (error) {
      console.error(`API error for ${toolId}/${actionType}:`, error);
      throw error;
    }
  }

  private async handleStreamResponse(
    response: Response,
    endpoint: ApiEndpoint,
    onProgress?: (progress: number) => void,
    onComplete?: (result: any) => void
  ) {
    const reader = response.body?.getReader();
    if (!reader) return false;

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.slice(6);
            
            if (chunk.trim() === '[DONE]') {
              return true;
            }

            const processedChunk = endpoint.streamProcessor ? 
              endpoint.streamProcessor(chunk) : 
              chunk;

            if (!processedChunk) continue;

            try {
              const data = JSON.parse(processedChunk);
              if (data.progress !== undefined && onProgress) {
                onProgress(data.progress);
              }
              if (onComplete) {
                onComplete(processedChunk);
              }
            } catch {
              if (onComplete) {
                onComplete(processedChunk);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return true;
  }
}

// Exporter directement l'instance unique
export const apiHandler = ApiHandler.getInstance();