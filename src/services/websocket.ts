export class SystemWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private onMetricsUpdate: (metrics: SystemMetrics) => void;
  private onStatusChange: (status: 'connected' | 'disconnected' | 'error') => void;

  constructor(
    onMetricsUpdate: (metrics: SystemMetrics) => void,
    onStatusChange: (status: 'connected' | 'disconnected' | 'error') => void
  ) {
    this.onMetricsUpdate = onMetricsUpdate;
    this.onStatusChange = onStatusChange;
  }

  connect() {
    try {
      const wsUrl = process.env.BASE_WS_URL || 'ws://localhost:8000';
      this.ws = new WebSocket(`${wsUrl}/ws/system-metrics`);

      this.ws.onopen = () => {
        console.log('WebSocket connecté');
        this.reconnectAttempts = 0;
        this.onStatusChange('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const metrics: SystemMetrics = JSON.parse(event.data);
          this.onMetricsUpdate(metrics);
        } catch (error) {
          console.error('Erreur lors du parsing des métriques:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket déconnecté');
        this.onStatusChange('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        this.onStatusChange('error');
      };
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
      this.onStatusChange('error');
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect();
      }, delay);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

export interface SystemMetrics {
  cpu: {
    percent: number;
    frequency_current: number;
    frequency_max: number;
    cores: number;
  };
  memory: {
    total: number;
    available: number;
    percent: number;
    used: number;
  };
  gpu: {
    id: number;
    name: string;
    load: number;
    memory_used: number;
    memory_total: number;
    temperature: number;
  }[];
} 