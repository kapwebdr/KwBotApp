import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { SystemMetrics } from '../types';
import { apiHandler } from '../services/apiHandler';
import ErrorModal from './ErrorModal';

export const SystemStatus: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showError, setShowError] = useState(false);

  const fetchMetrics = async () => {
    try {
      const result = await apiHandler.executeApiAction(
        'system_metrics',
        'execute',
        {}
      );

      if (result && 
          typeof result === 'object' && 
          'cpu' in result && 
          'memory' in result && 
          'gpu' in result &&
          Array.isArray(result.gpu)) {
        setMetrics(result);
        setStatus('connected');
        setShowError(false);
      } else {
        console.warn('Format de données système invalide:', result);
        setStatus('error');
        setMetrics(null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      setStatus('error');
      setErrorMessage('Impossible de récupérer les métriques système. Veuillez vérifier la connexion au serveur.');
      setShowError(true);
      setMetrics(null);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    setShowError(false);
    fetchMetrics();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#00FF9C';
      case 'disconnected': return '#FFA500';
      case 'error': return '#FF0000';
      default: return theme.colors.text;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return 'checkmark-circle';
      case 'disconnected': return 'warning';
      case 'error': return 'warning';
      default: return 'help-circle';
    }
  };

  const renderMetrics = () => {
    if (!metrics || status !== 'connected') return null;

    try {
      return (
        <Text style={[styles.statusText, { color: theme.colors.text }]}>
          {`CPU: ${metrics.cpu?.percent?.toFixed(0) || '?'}% | RAM: ${metrics.memory?.percent?.toFixed(0) || '?'}%`}
          {metrics.gpu?.length > 0 && metrics.gpu[0]?.load !== undefined && 
            ` | GPU: ${metrics.gpu[0].load.toFixed(0)}%`}
        </Text>
      );
    } catch (error) {
      console.warn('Erreur lors du rendu des métriques:', error);
      return null;
    }
  };

  return (
    <>
      <View style={styles.systemStatus}>
        <Ionicons
          name={getStatusIcon()}
          size={16}
          color={getStatusColor()}
          style={styles.statusIcon}
        />
        {renderMetrics()}
      </View>

      <ErrorModal
        isVisible={showError}
        onRetry={handleRetry}
        message={errorMessage}
      />
    </>
  );
}; 