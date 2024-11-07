export interface FileItem {
    name: string;
    type: 'file' | 'directory';
    size: number | null;
    modified: string;
    path?: string;
  }
  