import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { fileUploadService } from '../services/fileUploadService';
import { FilePreviewProps } from '../types/files';

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  isModal = false,
  onClose,
  downloadUrl,
  onDownload,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    content: string;
    mimeType: string;
  } | null>(null);

  useEffect(() => {
    if (file?.path) {
      loadPreview();
    }
  }, [file]);

  const loadPreview = async () => {
    if (!file?.path) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const preview = await fileUploadService.getFilePreview(file.path);
      setPreviewData({
        content: preview.content,
        mimeType: preview.mime_type
      });
    } catch (err) {
      setError('Erreur lors du chargement de la prévisualisation');
      console.error('Erreur preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <View style={styles.filePreviewLoadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error || !previewData) {
      return (
        <View style={styles.filePreviewErrorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.filePreviewErrorText}>
            {error || 'Aucun fichier à afficher'}
          </Text>
        </View>
      );
    }

    const { mimeType, content } = previewData;
    const dataUrl = `data:${mimeType};base64,${content}`;

    if (mimeType.startsWith('image/')) {
      return (
        <View style={{ width: '100%', height: '100%' }}>
          <Image
            source={{ uri: dataUrl }}
            style={styles.filePreviewImage}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (mimeType.startsWith('video/')) {
      return (
        <video controls style={styles.filePreviewVideo} src={dataUrl}>
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    }

    if (mimeType.startsWith('audio/')) {
      return (
        <audio controls style={styles.filePreviewAudio} src={dataUrl}>
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <iframe
          src={dataUrl}
          style={styles.filePreviewPdf}
          title="PDF Preview"
        />
      );
    }

    // Pour les fichiers texte
    if (mimeType.startsWith('text/')) {
      return (
        <ScrollView style={styles.filePreviewTextContainer}>
          <Text style={styles.filePreviewTextContent}>{content}</Text>
        </ScrollView>
      );
    }

    return (
      <View style={styles.filePreviewUnsupportedContainer}>
        <Ionicons name="document" size={48} color={theme.colors.text} />
        <Text style={styles.filePreviewUnsupportedText}>
          Aperçu non disponible pour ce type de fichier
        </Text>
      </View>
    );
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const renderHeader = () => {
    if (!isModal) return null;
    
    return (
      <View style={styles.filePreviewHeader}>
        <Text style={styles.filePreviewTitle}>
          {file?.name || 'Aperçu du fichier'}
        </Text>
        <View style={styles.filePreviewHeaderActions}>
          {(downloadUrl || onDownload) && (
            <TouchableOpacity 
              onPress={handleDownload}
              style={styles.filePreviewHeaderButton}
            >
              <Ionicons 
                name="download" 
                size={24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity 
              onPress={onClose}
              style={styles.filePreviewHeaderButton}
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const content = (
    <View style={styles.filePreviewContainer}>
      {renderHeader()}
      <View style={styles.filePreviewContent}>
        {renderPreview()}
      </View>
    </View>
  );

  if (isModal) {
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.filePreviewModalOverlay}>
          {content}
        </View>
      </Modal>
    );
  }

  return content;
};
