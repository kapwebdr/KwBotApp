import { Swipeable } from 'react-native-gesture-handler';
import { MutableRefObject, ReactNode } from 'react';
import { Theme } from './themes';
import { ToolType } from './tools';

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number | null;
  modified: string;
  path: string;
}

export interface PendingFile {
  file: File;
  id: string;
  name?: string;
}

export interface PreviewData {
  content: string;
  mimeType: string;
}

export interface FilePreviewProps {
  file?: FileItem | null;
  isModal?: boolean;
  onClose?: () => void;
  downloadUrl?: string;
  onDownload?: () => void;
}

export interface FileListProps {
  files: FileItem[];
  currentPath: string;
  selectedFiles?: string[];
  onFileClick: (file: FileItem) => void;
  renderActions?: (file: FileItem) => ReactNode;
  showSwipeActions?: boolean;
  directoryOnly?: boolean;
  multiSelect?: boolean;
  disabledItems?: string[];
  showFileInfo?: boolean;
  customRenderItem?: (file: FileItem) => ReactNode;
  onSwipeOpen?: (swipeable: Swipeable, file: FileItem) => void;
  onSwipeClose?: () => void;
  swipeableRefs?: MutableRefObject<{ [key: string]: Swipeable | null }>;
}


export interface MoveFileModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMove: (destination: string) => void;
  currentPath: string;
  itemToMove: FileItem | null;
  directoryOnly?: boolean;
}

// API Response Types
export interface UploadResult {
  uploads: Array<{
    status: string;
    message: string;
    size: number;
    timestamp: string;
  }>;
}

export interface ListDirectoryResponse {
  status: string;
  path: string;
  items: Array<{
    name: string;
    type: 'directory' | 'file';
    size: number | null;
    modified: string;
  }>;
  timestamp: string;
}

export interface ApiResponse {
  status: string;
  message: string;
  timestamp: string;
}

export interface CompressParams {
  path: string;
  is_directory?: boolean;
  zip_name?: string;
}

export interface DecompressParams {
  path: string;
  extract_path?: string;
}

export interface DecompressResponse extends ApiResponse {}

export interface MoveResponse extends ApiResponse {
  source: string;
  destination: string;
}

export interface PreviewResponse {
  status: string;
  mime_type: string;
  content: string;
  size: number;
  timestamp: string;
}

export interface FileManagerContextType {
  files: FileItem[];
  currentPath: string;
  selectedFiles: string[];
  pendingFiles: PendingFile[];
  isUploading: boolean;
  loadDirectory: () => Promise<void>;
  handleUpload: (files: File[]) => Promise<void>;
  handleFileClick: (file: FileItem) => void;
  handleCreateFolder: (folderName: string) => Promise<boolean>;
  handleDeleteFiles: (filePaths: string[]) => Promise<void>;
  setSelectedFiles: (files: string[]) => void;
  handleFileSelect: (files: File[]) => void;
  clearPendingFiles: () => void;
  handleClearFile: (fileId: string) => void;
  setCurrentPath: (path: string) => void;
  handleDownloadFile: (path: string) => Promise<void>;
  handleCompressFile: (path: string) => Promise<void>;
  handleDecompressFile: (path: string) => Promise<void>;
  compressionProgress: {
    progress: number;
    file: string;
  } | null;
  handleMoveFiles: (sourcePaths: string[], destination: string) => Promise<boolean>;
}

export interface FileUploadConfigProps {
  tool: {
    id?: ToolType;
    features?: {
      fileUpload?: {
        accept?: string[];
        multiple?: boolean;
        dragDrop?: boolean;
      };
    };
  };
  onFileSelect: (files: File[]) => void;
  pendingFiles: PendingFile[];
  onClearFiles: () => void;
  onClearFile: (fileId: string) => void;
}
