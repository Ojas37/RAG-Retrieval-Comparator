export interface RAGError {
  error: string;
  code: string;
  detail?: string;
}

export const getApiUrl = (): string => {
  // Pull from Vite environment or fallback to localhost
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  // Strip trailing slash if present
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Generic fetch wrapper with robust error checking
async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let errBody: any;
    try {
      errBody = await response.json();
    } catch {
      errBody = { error: 'Unknown server error', code: 'SERVER_ERROR' };
    }
    
    throw {
      error: errBody.error || response.statusText,
      code: errBody.code || 'HTTP_ERROR',
      detail: errBody.detail || '',
      status: response.status
    };
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  // System configurations
  getConfig: () => apiRequest<any>('/api/config'),
  
  updateConfig: (config: { hnsw_m: number; hnsw_ef_construction: number; hnsw_ef_search: number }) => 
    apiRequest<any>('/api/config/update', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  // Health checks
  checkHealth: () => apiRequest<{ status: string; db: string }>('/api/health'),

  // Ingestion management
  triggerIngest: () => apiRequest<{ message: string }>('/api/ingest', { method: 'POST' }),
  
  getIngestStatus: () => apiRequest<{
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    processed: number;
    total: number;
    last_error: string | null;
  }>('/api/ingest/status'),

  getGoldenQueries: () => apiRequest<Array<{ query_id: string; query_text: string }>>('/api/queries'),

  // Overview dashboard KPIs
  getOverviewStats: () => apiRequest<any>('/api/overview/stats'),

  // Benchmark operations
  runBenchmark: (name: string) => 
    apiRequest<{ message: string }>('/api/benchmark/run', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getBenchmarkHistory: () => apiRequest<any[]>('/api/benchmark/history'),

  getBenchmarkMetrics: (runId: string) => apiRequest<any>(`/api/benchmark/${runId}/metrics`),

  // Side-by-side Retrieval comparison
  retrieve: (query: string) => 
    apiRequest<any>('/api/retrieve', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // PCA Visualizer Points Projection
  projectCoordinates: (payload: {
    query: string;
    strategy: 'dense' | 'sparse' | 'hybrid';
    dense?: any[];
    sparse?: any[];
    hybrid?: any[];
  }) => 
    apiRequest<any[]>('/api/retrieve/embeddings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// WebSocket Streaming Log client with self-reconnecting behaviors
export const streamLogs = (
  onMessage: (msg: string) => void,
  onClose?: () => void,
  onError?: (err: any) => void
) => {
  const apiHost = getApiUrl();
  const wsUrl = apiHost.replace('http://', 'ws://').replace('https://', 'wss://') + '/api/logs/stream';
  
  let ws: WebSocket | null = null;
  let shouldReconnect = true;
  let reconnectTimeout: any = null;
  
  const connect = () => {
    if (!shouldReconnect) return;
    
    ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      onMessage(event.data);
    };
    
    ws.onclose = () => {
      if (onClose) onClose();
      if (shouldReconnect) {
        // Automatically attempt reconnection in 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };
    
    ws.onerror = (error) => {
      if (onError) onError(error);
    };
  };
  
  connect();
  
  return {
    // Allows cleanup on view dismount
    close: () => {
      shouldReconnect = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    }
  };
};
