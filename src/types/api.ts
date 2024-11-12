export type ActionType = 'init' | 'load' | 'execute' | 'stop' | 'send' | 'upload' | 'url' | 'systemStats' | 'containersList'  | 'list_directory' | 'create_directory' | 'delete_file' | 'delete_directory' | 'rename_file' | 'rename_directory' | 'upload_file' | 'download_file' | 'copy_file' | 'move_file' | 'copy_directory' | 'move_directory' | 'set' | 'get' | 'delete' | 'list' | 'search' | 'list_tasks' | 'add_task' | 'update_task' | 'delete_task' | 'list_events' | 'add_event' | 'update_event' | 'delete_event';

export interface ApiEndpoint {
  path: string;
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
  streaming?: boolean;
  responseType?: 'json' | 'stream' | 'base64';
  requestTransform?: (params: any) => any | null;
  responseTransform?: (response: any,params:any) => any| null;
  streamProcessor?: (chunk: any | string | null,params:any) => string | null;
  headers?: Record<string, string>;
  loadingTxt?: string;
}
