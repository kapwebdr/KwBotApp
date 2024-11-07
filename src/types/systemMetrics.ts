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

export interface ContainerStats {
    cpu_percent: number;
    memory_percent: number;
    memory_usage: number;
    memory_limit: number;
  }
  
  export interface Container {
    id: string;
    name: string;
    status: string;
    image: string;
    created: string;
    ports: Record<string, any>;
    stats: ContainerStats;
  }