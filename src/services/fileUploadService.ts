import { FileItem } from '../types/files';
import { notificationService } from './notificationService';
import { UploadResult, ListDirectoryResponse, ApiResponse, 
  CompressParams,DecompressParams, 
  DecompressResponse, MoveResponse,PreviewResponse  } from '../types/files';

interface RenameResponse {
  status: string;
  message: string;
  old_path: string;
  new_path: string;
  timestamp: string;
}

interface UploadBase64Params {
  content: string;
  path: string;
  mime_type: string;
}

class FileUploadService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BASE_API_URL || '';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async listDirectory(path: string = ''): Promise<FileItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/files/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path })
      });

      const data = await this.handleResponse<ListDirectoryResponse>(response);
      
      return data.items.map(item => ({
        name: item.name,
        path: `${path}/${item.name}`.replace(/\/+/g, '/'),
        type: item.type,
        size: item.size,
        modified: item.modified
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors du listage du répertoire: ${errorMessage}`);
      return [];
    }
  }

  async uploadFiles(files: File[], path: string, sessionId?: string): Promise<boolean> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('path', path);

      const response = await fetch(`${this.baseUrl}/files/upload`, {
        method: 'POST',
        headers: {
          ...(sessionId ? { 'x-session-id': sessionId } : {})
        },
        body: formData
      });

      const result = await this.handleResponse<UploadResult>(response);
      const allSuccessful = result.uploads.every(upload => upload.status === 'success');
      
      if (allSuccessful) {
        notificationService.notify('success', 'Upload réussi');
      } else {
        const errors = result.uploads
          .filter(upload => upload.status !== 'success')
          .map(upload => upload.message)
          .join(', ');
        notificationService.notify('error', `Certains uploads ont échoué: ${errors}`);
      }
      
      return allSuccessful;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de l'upload: ${errorMessage}`);
      return false;
    }
  }

  async createDirectory(name: string, path: string): Promise<boolean> {
    try {
      const fullPath = `${path}/${name}`.replace(/\/+/g, '/');
      const response = await fetch(`${this.baseUrl}/files/directory/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: fullPath })
      });

      const result = await this.handleResponse<ApiResponse>(response);
      if (result.status === 'success') {
        notificationService.notify('success', 'Dossier créé avec succès');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la création du dossier: ${errorMessage}`);
      return false;
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path })
      });

      const result = await this.handleResponse<ApiResponse>(response);
      if (result.status === 'success') {
        notificationService.notify('success', 'Fichier supprimé avec succès');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la suppression: ${errorMessage}`);
      return false;
    }
  }

  async deleteDirectory(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/directory/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path })
      });

      const result = await this.handleResponse<ApiResponse>(response);
      if (result.status === 'success') {
        notificationService.notify('success', 'Dossier supprimé avec succès');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la suppression du dossier: ${errorMessage}`);
      return false;
    }
  }

  async compress(params: CompressParams): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/files/compress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la compression');
    }

    return response;
  }

  async downloadFile(path: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/files/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      return response.blob();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors du téléchargement: ${errorMessage}`);
      throw error;
    }
  }

  async decompress(params: DecompressParams): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/decompress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      const result = await this.handleResponse<DecompressResponse>(response);
      if (result.status === 'success') {
        notificationService.notify('success', result.message);
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la décompression: ${errorMessage}`);
      return false;
    }
  }

  async moveFile(source: string, destination: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source, destination })
      });

      const result = await this.handleResponse<MoveResponse>(response);
      if (result.status === 'success') {
        notificationService.notify('success', result.message);
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors du déplacement: ${errorMessage}`);
      return false;
    }
  }

  async getFilePreview(path: string): Promise<PreviewResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/files/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path })
      });

      const result = await this.handleResponse<PreviewResponse>(response);
      if (result.status !== 'success') {
        throw new Error('Échec de la prévisualisation');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la prévisualisation: ${errorMessage}`);
      throw error;
    }
  }

  async renameFile(path: string, newName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/rename`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, new_name: newName })
      });

      const result = await this.handleResponse<RenameResponse>(response);
      if (result.status === 'success') {
        notificationService.notify('success', result.message);
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors du renommage: ${errorMessage}`);
      return false;
    }
  }

  async uploadBase64File(params: UploadBase64Params): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      const result = await this.handleResponse<UploadResult>(response);
      return result.uploads.every(upload => upload.status === 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de l'upload: ${errorMessage}`);
      return false;
    }
  }
}

export const fileUploadService = new FileUploadService();