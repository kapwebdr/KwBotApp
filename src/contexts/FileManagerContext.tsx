import React, { createContext, useContext, useState, useCallback } from 'react';
import { FileItem } from '../types/files';
import { fileUploadService } from '../services/fileUploadService';
import { notificationService } from '../services/notificationService';
import { PendingFile,FileManagerContextType } from '../types/files';

export const FileManagerContext = createContext<FileManagerContextType>({} as FileManagerContextType);

export const FileManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [compressionProgress, setCompressionProgress] = useState<{
    progress: number;
    file: string;
  } | null>(null);

  const loadDirectory = useCallback(async () => {
    try {
      const response = await fileUploadService.listDirectory(currentPath);
      setFiles(response);
    } catch (error) {
      console.error('Erreur lors du chargement du répertoire:', error);
    }
  }, [currentPath]);

  const handleFileClick = useCallback((file: FileItem) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path || '/');
      return;
    }

    const isSelected = selectedFiles.includes(file.path || '');
    setSelectedFiles(isSelected 
      ? selectedFiles.filter(path => path !== file.path)
      : [...selectedFiles, file.path].filter((path): path is string => path !== undefined)
    );
  }, [selectedFiles]);

  const handleFileSelect = (newFiles: File[]) => {
    const newPendingFiles = newFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
    }));
    setPendingFiles(prev => [...prev, ...newPendingFiles]);
  };

  const clearPendingFiles = () => {
    setPendingFiles([]);
  };

  const handleClearFile = (fileId: string) => {
    setPendingFiles(prev => prev.filter(pf => pf.id !== fileId));
  };

  const handleUpload = async (files: File[]) => {
    try {
      setIsUploading(true);
      const success = await fileUploadService.uploadFiles(files, currentPath);
      if (success) {
        clearPendingFiles();
        await loadDirectory();
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      const success = await fileUploadService.createDirectory(folderName, currentPath);
      if (success) {
        await loadDirectory();
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      return false;
    }
  };

  const handleDeleteFiles = async (filePaths: string[]) => {
    let success = true;
    for (const filePath of filePaths) {
      try {
        const isDirectory = files.find(f => f.path === filePath)?.type === 'directory';
        if (isDirectory) {
          await fileUploadService.deleteDirectory(filePath);
        } else {
          await fileUploadService.deleteFile(filePath);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        success = false;
      }
    }
    if (success) {
      setSelectedFiles([]);
      await loadDirectory();
    }
  };

  const handleDownloadFile = async (path: string) => {
    try {
      const blob = await fileUploadService.downloadFile(path);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleCompressFile = async (path: string) => {
    if (!path) return;
    
    try {
      const isDirectory = files.find(f => f.path === path)?.type === 'directory';
      const response = await fileUploadService.compress({
        path,
        is_directory: isDirectory
      });

      const reader = response.body?.getReader();
      if (!reader) return;

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
            try {
              const data = JSON.parse(chunk);
              if ('progress' in data) {
                setCompressionProgress({
                  progress: data.progress,
                  file: data.file
                });
              } else if (data.status === 'completed') {
                setCompressionProgress(null);
                await loadDirectory();
                notificationService.notify('success', 'Compression terminée');
                return;
              }
            } catch (error) {
              console.error('Erreur parsing SSE:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la compression:', error);
      notificationService.notify('error', 'Erreur lors de la compression');
      setCompressionProgress(null);
    }
  };

  const handleDecompressFile = async (path: string) => {
    try {
      const success = await fileUploadService.decompress({
        path,
        extract_path: currentPath
      });
      
      if (success) {
        await loadDirectory();
      }
    } catch (error) {
      console.error('Erreur lors de la décompression:', error);
    }
  };

  const handleMoveFiles = async (sourcePaths: string[], destination: string): Promise<boolean> => {
    try {
      let success = true;
      for (const sourcePath of sourcePaths) {
        const result = await fileUploadService.moveFile(sourcePath, destination);
        if (!result) {
          success = false;
        }
      }
      
      if (success) {
        await loadDirectory();
        notificationService.notify('success', 'Déplacement effectué avec succès');
      }
      
      return success;
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      notificationService.notify('error', 'Erreur lors du déplacement');
      return false;
    }
  };

  React.useEffect(() => {
    loadDirectory();
  }, [currentPath, loadDirectory]);

  const value = {
    files,
    currentPath,
    selectedFiles,
    pendingFiles,
    isUploading,
    loadDirectory,
    handleUpload,
    handleFileClick,
    handleCreateFolder,
    handleDeleteFiles,
    setSelectedFiles,
    handleFileSelect,
    clearPendingFiles,
    handleClearFile,
    setCurrentPath,
    handleDownloadFile,
    handleCompressFile,
    handleDecompressFile,
    compressionProgress,
    handleMoveFiles,
  };

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
};

export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }
  return context;
}; 